"use server";

import { revalidatePath } from "next/cache";
import {
  CfoEstadoTarjeta,
  CfoTipoTarjeta,
  CfoEstadoTransaccion,
  CfoAuditAccion,
} from "@/app/generated/prisma";
import { db } from "@/lib/db";
import { requireEmpresaSession } from "@/lib/session";
import { obtenerValorUF, convertirCLPaUF } from "@/lib/uf";

export type ActionState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
  data?: any;
};

/**
 * Obtiene todas las tarjetas corporativas de la empresa de la sesión actual
 */
export async function obtenerTarjetas(): Promise<CfoTarjetaCorporativaWithRelations[]> {
  const session = await requireEmpresaSession();

  const tarjetas = await db.cfoTarjetaCorporativa.findMany({
    where: {
      empresaId: session.empresaId,
    },
    include: {
      usuario: {
        select: {
          id: true,
          nombre: true,
          email: true,
          avatarUrl: true,
        },
      },
      sociedad: {
        select: {
          id: true,
          codigo: true,
          razonSocial: true,
        },
      },
      centroCosto: {
        select: {
          id: true,
          codigo: true,
          nombre: true,
        },
      },
      transacciones: {
        orderBy: {
          fecha: "desc",
        },
        take: 20,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Mapeamos los datos para serialización limpia (convertimos Decimals a números/strings)
  return tarjetas.map((t) => ({
    ...t,
    limiteUF: t.limiteUF ? Number(t.limiteUF) : null,
    limiteMensualCLP: Number(t.limiteMensualCLP),
    gastadoMensual: Number(t.gastadoMensual),
    transacciones: t.transacciones.map((tx) => ({
      ...tx,
      monto: Number(tx.monto),
      montoCLP: Number(tx.montoCLP),
      montoUF: tx.montoUF ? Number(tx.montoUF) : null,
    })),
  })) as any;
}

export type CfoTarjetaCorporativaWithRelations = {
  id: string;
  numeroEnmascarado: string;
  marca: string;
  titular: string;
  limiteUF: number | null;
  limiteMensualCLP: number;
  gastadoMensual: number;
  estado: CfoEstadoTarjeta;
  tipo: CfoTipoTarjeta;
  createdAt: Date;
  usuario: {
    id: string;
    nombre: string;
    email: string;
    avatarUrl: string | null;
  };
  sociedad: {
    id: string;
    codigo: string;
    razonSocial: string;
  } | null;
  centroCosto: {
    id: string;
    codigo: string;
    nombre: string;
  } | null;
  transacciones: Array<{
    id: string;
    fecha: Date;
    comercio: string;
    monto: number;
    moneda: string;
    montoCLP: number;
    montoUF: number | null;
    estado: CfoEstadoTransaccion;
    categoria: string | null;
    comprobanteUrl: string | null;
  }>;
};

/**
 * Crea una nueva tarjeta corporativa
 */
export async function crearTarjetaCorporativa(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireEmpresaSession();

  const usuarioId = formData.get("usuarioId") as string;
  const sociedadId = formData.get("sociedadId") as string || null;
  const centroCostoId = formData.get("centroCostoId") as string || null;
  const limiteMensualCLP = Number(formData.get("limiteMensualCLP"));
  const limiteUFVal = formData.get("limiteUF");
  const limiteUF = limiteUFVal ? Number(limiteUFVal) : null;
  const tipoStr = formData.get("tipo") as string;
  const tipo = tipoStr === "FISICA" ? CfoTipoTarjeta.FISICA : CfoTipoTarjeta.VIRTUAL;

  if (!usuarioId) {
    return {
      errors: { usuarioId: ["Debe seleccionar un colaborador titular"] },
      message: "Faltan campos requeridos.",
    };
  }

  if (isNaN(limiteMensualCLP) || limiteMensualCLP <= 0) {
    return {
      errors: { limiteMensualCLP: ["El límite mensual debe ser un número positivo"] },
      message: "Límite mensual inválido.",
    };
  }

  // Buscar usuario
  const usuario = await db.usuario.findFirst({
    where: { id: usuarioId, empresaId: session.empresaId },
    select: { nombre: true },
  });

  if (!usuario) {
    return { message: "El usuario seleccionado no pertenece a su empresa." };
  }

  // Generar número de tarjeta ficticio enmascarado
  const digitosFinales = Math.floor(1000 + Math.random() * 9000).toString();
  const numeroEnmascarado = `•••• •••• •••• ${digitosFinales}`;

  try {
    const tarjeta = await db.$transaction(async (tx) => {
      const nueva = await tx.cfoTarjetaCorporativa.create({
        data: {
          empresaId: session.empresaId,
          usuarioId,
          sociedadId,
          centroCostoId,
          numeroEnmascarado,
          titular: usuario.nombre,
          limiteMensualCLP,
          limiteUF,
          tipo,
          estado: CfoEstadoTarjeta.ACTIVA,
        },
      });

      await tx.cfoAuditLog.create({
        data: {
          empresaId: session.empresaId,
          usuarioId: session.usuarioId,
          accion: CfoAuditAccion.CREAR,
          entidadTipo: "CfoTarjetaCorporativa",
          entidadId: nueva.id,
          despues: {
            titular: usuario.nombre,
            tipo,
            limiteMensualCLP,
            limiteUF,
          },
        },
      });

      return nueva;
    });

    revalidatePath("/cfo");
    revalidatePath("/cfo/controlling");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Tarjeta ${tipo.toLowerCase()} emitida exitosamente para ${usuario.nombre}.`,
      data: tarjeta,
    };
  } catch (err: any) {
    return { message: `Error al crear la tarjeta: ${err.message}` };
  }
}

/**
 * Modifica el estado de una tarjeta corporativa (Bloquear / Activar / Suspender)
 */
export async function modificarEstadoTarjeta(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireEmpresaSession();
  const tarjetaId = formData.get("tarjetaId") as string;
  const nuevoEstadoStr = formData.get("estado") as string;

  if (!tarjetaId || !nuevoEstadoStr) {
    return { message: "Datos faltantes." };
  }

  let estado: CfoEstadoTarjeta;
  if (nuevoEstadoStr === "ACTIVA") estado = CfoEstadoTarjeta.ACTIVA;
  else if (nuevoEstadoStr === "BLOQUEADA") estado = CfoEstadoTarjeta.BLOQUEADA;
  else if (nuevoEstadoStr === "SUSPENDIDA") estado = CfoEstadoTarjeta.SUSPENDIDA;
  else return { message: "Estado de tarjeta no válido." };

  try {
    const tarjeta = await db.cfoTarjetaCorporativa.findFirst({
      where: { id: tarjetaId, empresaId: session.empresaId },
    });

    if (!tarjeta) {
      return { message: "Tarjeta no encontrada." };
    }

    await db.$transaction([
      db.cfoTarjetaCorporativa.update({
        where: { id: tarjetaId },
        data: { estado },
      }),
      db.cfoAuditLog.create({
        data: {
          empresaId: session.empresaId,
          usuarioId: session.usuarioId,
          accion: CfoAuditAccion.ACTUALIZAR,
          entidadTipo: "CfoTarjetaCorporativa",
          entidadId: tarjetaId,
          antes: { estado: tarjeta.estado },
          despues: { estado },
        },
      }),
    ]);

    revalidatePath("/cfo");
    revalidatePath("/cfo/controlling");

    return {
      success: true,
      message: `La tarjeta de ${tarjeta.titular} ha sido cambiada a ${nuevoEstadoStr.toLowerCase()}.`,
    };
  } catch (err: any) {
    return { message: `Error al modificar estado: ${err.message}` };
  }
}

/**
 * Cambia los límites de gasto de una tarjeta corporativa
 */
export async function modificarLimiteTarjeta(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireEmpresaSession();
  const tarjetaId = formData.get("tarjetaId") as string;
  const limiteMensualCLP = Number(formData.get("limiteMensualCLP"));
  const limiteUFVal = formData.get("limiteUF");
  const limiteUF = limiteUFVal ? Number(limiteUFVal) : null;

  if (!tarjetaId || isNaN(limiteMensualCLP) || limiteMensualCLP <= 0) {
    return { message: "Monto de límite CLP no válido." };
  }

  try {
    const tarjeta = await db.cfoTarjetaCorporativa.findFirst({
      where: { id: tarjetaId, empresaId: session.empresaId },
    });

    if (!tarjeta) {
      return { message: "Tarjeta no encontrada." };
    }

    await db.$transaction([
      db.cfoTarjetaCorporativa.update({
        where: { id: tarjetaId },
        data: { limiteMensualCLP, limiteUF },
      }),
      db.cfoAuditLog.create({
        data: {
          empresaId: session.empresaId,
          usuarioId: session.usuarioId,
          accion: CfoAuditAccion.ACTUALIZAR,
          entidadTipo: "CfoTarjetaCorporativa",
          entidadId: tarjetaId,
          antes: { limiteMensualCLP: Number(tarjeta.limiteMensualCLP), limiteUF: tarjeta.limiteUF ? Number(tarjeta.limiteUF) : null },
          despues: { limiteMensualCLP, limiteUF },
        },
      }),
    ]);

    revalidatePath("/cfo");
    revalidatePath("/cfo/controlling");

    return {
      success: true,
      message: `Límites actualizados para la tarjeta de ${tarjeta.titular}.`,
    };
  } catch (err: any) {
    return { message: `Error al modificar límites: ${err.message}` };
  }
}

/**
 * Simulación en tiempo real de transacciones en comercios (Moss-style con alertas de presupuesto)
 */
export async function procesarTransaccionTarjeta(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireEmpresaSession();
  const tarjetaId = formData.get("tarjetaId") as string;
  const comercio = formData.get("comercio") as string;
  const monto = Number(formData.get("monto"));
  const categoria = formData.get("categoria") as string || "General";

  if (!tarjetaId || !comercio || isNaN(monto) || monto <= 0) {
    return { message: "Datos de transacción no válidos." };
  }

  try {
    const tarjeta = await db.cfoTarjetaCorporativa.findFirst({
      where: { id: tarjetaId, empresaId: session.empresaId },
      include: {
        centroCosto: true,
      },
    });

    if (!tarjeta) {
      return { message: "Tarjeta no encontrada." };
    }

    if (tarjeta.estado !== CfoEstadoTarjeta.ACTIVA) {
      return {
        success: false,
        message: `Transacción rechazada: La tarjeta de ${tarjeta.titular} está ${tarjeta.estado.toLowerCase()}.`,
      };
    }

    const fecha = new Date();
    const valorUF = obtenerValorUF(fecha);
    const montoUF = convertirCLPaUF(monto, fecha);

    const gastadoActual = Number(tarjeta.gastadoMensual);
    const limiteActualCLP = Number(tarjeta.limiteMensualCLP);

    // 1. Validar límite CLP de la tarjeta
    if (gastadoActual + monto > limiteActualCLP) {
      // Registrar transacción fallida
      await db.cfoTarjetaTransaccion.create({
        data: {
          tarjetaId,
          fecha,
          comercio,
          monto,
          moneda: "CLP",
          montoCLP: monto,
          montoUF,
          estado: CfoEstadoTransaccion.RECHAZADA,
          categoria,
        },
      });

      return {
        success: false,
        message: `Transacción rechazada en ${comercio}: Supera el límite de la tarjeta ($${monto.toLocaleString("es-CL")} excede el límite restante de $${(limiteActualCLP - gastadoActual).toLocaleString("es-CL")}).`,
      };
    }

    // 2. Validar contra el presupuesto del Centro de Costos si está asignado (Control presupuestario de Moss)
    let alertaPresupuesto = "";
    if (tarjeta.centroCostoId) {
      // Buscamos si hay planificaciones/presupuestos para este centro de costo en el periodo actual
      const periodoActual = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
      
      const presupuesto = await db.cfoPlanLinea.findFirst({
        where: {
          empresaId: session.empresaId,
          centroCostoId: tarjeta.centroCostoId,
          plan: {
            periodo: { codigo: periodoActual },
            estado: "APROBADO",
          },
        },
        select: {
          monto: true,
        },
      });

      if (presupuesto) {
        const montoPresupuestado = Number(presupuesto.monto);
        
        // Calcular cuánto se ha gastado en este centro de costos este mes en total
        const totalGastadoCC = await db.cfoAsientoLinea.aggregate({
          where: {
            empresaId: session.empresaId,
            centroCostoId: tarjeta.centroCostoId,
            asiento: {
              periodo: { codigo: periodoActual },
            },
          },
          _sum: {
            monto: true,
          },
        });

        // Sumar también las transacciones de tarjeta ya aprobadas para este CC este mes
        const totalTarjetasCC = await db.cfoTarjetaTransaccion.aggregate({
          where: {
            tarjeta: {
              empresaId: session.empresaId,
              centroCostoId: tarjeta.centroCostoId,
            },
            fecha: {
              gte: new Date(fecha.getFullYear(), fecha.getMonth(), 1),
            },
            estado: CfoEstadoTransaccion.APROBADA,
          },
          _sum: {
            montoCLP: true,
          },
        });

        const gastadoTotalCC = Number(totalGastadoCC._sum.monto ?? 0) + Number(totalTarjetasCC._sum.montoCLP ?? 0);
        
        if (gastadoTotalCC + monto > montoPresupuestado) {
          const desvio = ((gastadoTotalCC + monto - montoPresupuestado) / montoPresupuestado) * 100;
          alertaPresupuesto = ` [ALERTA DE PRESUPUESTO: Excede presupuesto de Centro de Costo ${tarjeta.centroCosto?.nombre} en +${desvio.toFixed(1)}%]`;
        }
      }
    }

    // Aprobación y simulación de requerimiento de boleta (Moss pide boletas sobre compras > $15.000 CLP)
    const requiereComprobante = monto > 15000;
    const estadoTransaccion = requiereComprobante 
      ? CfoEstadoTransaccion.REQUERIR_COMPROBANTE 
      : CfoEstadoTransaccion.APROBADA;

    await db.$transaction([
      db.cfoTarjetaTransaccion.create({
        data: {
          tarjetaId,
          fecha,
          comercio,
          monto,
          moneda: "CLP",
          montoCLP: monto,
          montoUF,
          estado: estadoTransaccion,
          categoria,
        },
      }),
      db.cfoTarjetaCorporativa.update({
        where: { id: tarjetaId },
        data: {
          gastadoMensual: {
            increment: monto,
          },
        },
      }),
    ]);

    revalidatePath("/cfo");
    revalidatePath("/cfo/controlling");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Transacción aprobada en ${comercio} por $${monto.toLocaleString("es-CL")} (${montoUF.toFixed(2)} UF).` + 
        (requiereComprobante ? " Se requiere subir comprobante/boleta para justificar el gasto." : "") +
        alertaPresupuesto,
    };
  } catch (err: any) {
    return { message: `Error al procesar la transacción: ${err.message}` };
  }
}

/**
 * Adjuntar comprobante / boleta a una transacción (Moss-style justificante)
 */
export async function cargarComprobanteGasto(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireEmpresaSession();
  const transaccionId = formData.get("transaccionId") as string;
  // En un caso real se subiría el archivo a S3/Vercel Blob, aquí simulamos guardando una URL de mockup
  const archivo = formData.get("comprobante") as File;

  if (!transaccionId) {
    return { message: "ID de transacción faltante." };
  }

  try {
    const tx = await db.cfoTarjetaTransaccion.findFirst({
      where: {
        id: transaccionId,
        tarjeta: { empresaId: session.empresaId },
      },
      include: {
        tarjeta: true,
      },
    });

    if (!tx) {
      return { message: "Transacción no encontrada." };
    }

    const archivoNombre = archivo && archivo.name ? archivo.name : "boleta_digital.pdf";
    const comprobanteUrl = `/uploads/comprobantes/${transaccionId}_${archivoNombre}`;

    await db.$transaction([
      db.cfoTarjetaTransaccion.update({
        where: { id: transaccionId },
        data: {
          comprobanteUrl,
          estado: CfoEstadoTransaccion.APROBADA, // Pasa a aprobada completamente una vez subido el comprobante
        },
      }),
      db.cfoAuditLog.create({
        data: {
          empresaId: session.empresaId,
          usuarioId: session.usuarioId,
          accion: CfoAuditAccion.ACTUALIZAR,
          entidadTipo: "CfoTarjetaTransaccion",
          entidadId: transaccionId,
          despues: {
            comprobanteUrl,
            archivoNombre,
          },
        },
      }),
    ]);

    revalidatePath("/cfo");
    revalidatePath("/cfo/controlling");

    return {
      success: true,
      message: `Comprobante "${archivoNombre}" subido exitosamente. Transacción conciliada.`,
    };
  } catch (err: any) {
    return { message: `Error al subir comprobante: ${err.message}` };
  }
}
