"use server";

import { revalidatePath } from "next/cache";
import {
  CfoAuditAccion,
  CfoEstadoConsolidacion,
  CfoEstadoImportacion,
  CfoEstadoPeriodo,
  CfoEstadoReporte,
  CfoWorkflowEstado,
  CfoOrigenDato,
  CfoTipoCuenta,
  CfoTipoFuenteDato,
  CfoTipoReporte,
  CfoTipoSociedad,
  CfoNaturalezaCuenta,
} from "@/app/generated/prisma";
import { parseCsvText } from "@/lib/csv";
import { db } from "@/lib/db";
import { requireEmpresaSession } from "@/lib/session";
import { ensureCfoBaseStructure } from "@/lib/cfo";
export type ActionState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

function getRowValue(row: Record<string, string>, ...keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return "";
}

function parseImportedNumber(value: string, fallback = 0) {
  const trimmed = value.trim();
  if (!trimmed) return fallback;

  const normalized =
    trimmed.includes(",") && trimmed.includes(".")
      ? trimmed.replace(/\./g, "").replace(",", ".")
      : trimmed.replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function parseImportedDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (dateOnlyMatch) {
    return new Date(
      Number(dateOnlyMatch[1]),
      Number(dateOnlyMatch[2]) - 1,
      Number(dateOnlyMatch[3]),
      12,
      0,
      0
    );
  }

  const slashMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (slashMatch) {
    return new Date(
      Number(slashMatch[3]),
      Number(slashMatch[2]) - 1,
      Number(slashMatch[1]),
      12,
      0,
      0
    );
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getPeriodKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getPeriodRange(periodo: string) {
  const [yearRaw, monthRaw] = periodo.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }

  return {
    codigo: periodo,
    anio: year,
    mes: month,
    fechaInicio: new Date(year, month - 1, 1),
    fechaFin: new Date(year, month, 0, 23, 59, 59, 999),
  };
}

function normalizeCode(value: string) {
  return value.trim().toUpperCase();
}

function moneyEquals(a: number, b: number) {
  return Math.abs(a - b) < 0.01;
}

function getSignedAmount({
  debito,
  credito,
  naturaleza,
}: {
  debito: number;
  credito: number;
  naturaleza: CfoNaturalezaCuenta;
}) {
  if (naturaleza === CfoNaturalezaCuenta.ACREEDORA) {
    return credito - debito;
  }

  return debito - credito;
}

function getStringField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getReporteDetailPath(reporteId: string) {
  return `/cfo/reportes/${reporteId}`;
}

export async function prepararBaseCfo(
  _prevState: ActionState,
  _formData: FormData
): Promise<ActionState> {
  void _prevState;
  void _formData;
  const session = await requireEmpresaSession();

  await ensureCfoBaseStructure({
    empresaId: session.empresaId,
    usuarioId: session.usuarioId,
  });

  revalidatePath("/cfo");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: "Base CFO preparada: sociedad, periodo, fuente, cuentas y escenario.",
  };
}

export async function importarAsientosCfoCsv(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  void _prevState;
  const session = await requireEmpresaSession();

  await ensureCfoBaseStructure({
    empresaId: session.empresaId,
    usuarioId: session.usuarioId,
  });

  const archivo = formData.get("archivo");
  if (!(archivo instanceof File) || archivo.size === 0) {
    return {
      errors: {
        archivo: ["Selecciona un archivo CSV para importar"],
      },
    };
  }

  const parsed = parseCsvText(await archivo.text());
  if (parsed.rows.length === 0) {
    return { message: "El archivo CSV no tiene filas para importar" };
  }

  const [sociedades, cuentas, fuente] = await Promise.all([
    db.cfoSociedad.findMany({
      where: { empresaId: session.empresaId, activa: true },
      select: { id: true, codigo: true },
    }),
    db.cfoCuentaContable.findMany({
      where: { empresaId: session.empresaId, activa: true, esImputable: true },
      select: { id: true, codigo: true, naturaleza: true },
    }),
    db.cfoFuenteDatos.upsert({
      where: {
        empresaId_nombre: {
          empresaId: session.empresaId,
          nombre: "Importacion CSV CFO",
        },
      },
      update: { activo: true },
      create: {
        empresaId: session.empresaId,
        nombre: "Importacion CSV CFO",
        tipo: CfoTipoFuenteDato.CSV,
        sistema: "CSV",
      },
      select: { id: true },
    }),
  ]);

  const sociedadByCode = new Map(
    sociedades.map((sociedad) => [normalizeCode(sociedad.codigo), sociedad])
  );
  const cuentaByCode = new Map(
    cuentas.map((cuenta) => [normalizeCode(cuenta.codigo), cuenta])
  );

  const errores: string[] = [];
  const periodosNecesarios = new Set<string>();
  const rows = parsed.rows.map((row, index) => {
    const fecha = parseImportedDate(getRowValue(row, "fecha", "fechacontable"));
    const periodoRaw = getRowValue(row, "periodo", "mes", "periodocontable");
    const periodo = periodoRaw || (fecha ? getPeriodKey(fecha) : "");
    const sociedadCodigo = normalizeCode(
      getRowValue(row, "sociedadcodigo", "sociedad", "empresa", "rut") || "MATRIZ"
    );
    const cuentaCodigo = normalizeCode(
      getRowValue(row, "cuentacodigo", "cuenta", "codigocta", "codigocuenta")
    );
    const numero =
      getRowValue(row, "numero", "nro", "folio", "asiento", "comprobante") ||
      `CSV-${index + 2}`;
    const descripcion =
      getRowValue(row, "descripcion", "glosa", "detalle") || "Asiento importado";
    const debito = parseImportedNumber(getRowValue(row, "debito", "debe"), 0);
    const credito = parseImportedNumber(getRowValue(row, "credito", "haber"), 0);
    const sociedad = sociedadByCode.get(sociedadCodigo);
    const cuenta = cuentaByCode.get(cuentaCodigo);

    if (!fecha) {
      errores.push(`Fila ${index + 2}: fecha no valida`);
    }

    if (!periodo || !getPeriodRange(periodo)) {
      errores.push(`Fila ${index + 2}: periodo no valido, usa AAAA-MM`);
    } else {
      periodosNecesarios.add(periodo);
    }

    if (!sociedad) {
      errores.push(`Fila ${index + 2}: sociedad no existe (${sociedadCodigo})`);
    }

    if (!cuenta) {
      errores.push(`Fila ${index + 2}: cuenta imputable no existe (${cuentaCodigo})`);
    }

    if (!Number.isFinite(debito) || debito < 0) {
      errores.push(`Fila ${index + 2}: debito/debe no valido`);
    }

    if (!Number.isFinite(credito) || credito < 0) {
      errores.push(`Fila ${index + 2}: credito/haber no valido`);
    }

    if (moneyEquals(debito, 0) && moneyEquals(credito, 0)) {
      errores.push(`Fila ${index + 2}: informa debito o credito`);
    }

    if (debito > 0 && credito > 0) {
      errores.push(`Fila ${index + 2}: una linea no puede tener debito y credito`);
    }

    return {
      index,
      fecha,
      periodo,
      sociedad,
      cuenta,
      numero,
      descripcion,
      glosa: getRowValue(row, "glosa", "lineaglosa", "detalle") || descripcion,
      terceroRut: getRowValue(row, "tercerorut", "ruttercero", "rut"),
      terceroNombre: getRowValue(row, "terceronombre", "nombretercero", "tercero"),
      documentoTipo: getRowValue(row, "documentotipo", "tipodocumento", "tipodoc"),
      documentoFolio: getRowValue(row, "documentofolio", "folio", "nrodocumento"),
      debito,
      credito,
      moneda: normalizeCode(getRowValue(row, "moneda") || "CLP"),
    };
  });

  if (errores.length > 0) {
    return { message: errores.slice(0, 10).join(" | ") };
  }

  const periodos = new Map<string, { id: string; estado: CfoEstadoPeriodo }>();
  for (const periodoCodigo of periodosNecesarios) {
    const periodRange = getPeriodRange(periodoCodigo);
    if (!periodRange) continue;

    const periodo = await db.cfoPeriodo.upsert({
      where: {
        empresaId_codigo: {
          empresaId: session.empresaId,
          codigo: periodoCodigo,
        },
      },
      update: {},
      create: {
        empresaId: session.empresaId,
        codigo: periodoCodigo,
        anio: periodRange.anio,
        mes: periodRange.mes,
        fechaInicio: periodRange.fechaInicio,
        fechaFin: periodRange.fechaFin,
      },
      select: { id: true, estado: true },
    });

    if (
      periodo.estado === CfoEstadoPeriodo.CERRADO ||
      periodo.estado === CfoEstadoPeriodo.BLOQUEADO
    ) {
      errores.push(
        `Periodo ${periodoCodigo} esta ${periodo.estado.toLowerCase()} y no acepta importaciones`
      );
    }

    periodos.set(periodoCodigo, periodo);
  }

  if (errores.length > 0) {
    return { message: errores.slice(0, 10).join(" | ") };
  }

  const asientoGroups = new Map<string, typeof rows>();
  for (const row of rows) {
    const key = [
      row.sociedad!.id,
      periodos.get(row.periodo)!.id,
      row.numero,
      row.fecha!.toISOString().slice(0, 10),
    ].join("|");
    const group = asientoGroups.get(key) ?? [];
    group.push(row);
    asientoGroups.set(key, group);
  }

  const descuadres: string[] = [];
  for (const group of asientoGroups.values()) {
    const debitos = group.reduce((sum, row) => sum + row.debito, 0);
    const creditos = group.reduce((sum, row) => sum + row.credito, 0);
    if (!moneyEquals(debitos, creditos)) {
      const sample = group[0];
      descuadres.push(
        `Asiento ${sample.numero} (${sample.periodo}): debe ${debitos} vs haber ${creditos}`
      );
    }
  }

  if (descuadres.length > 0) {
    return { message: descuadres.slice(0, 8).join(" | ") };
  }

  const result = await db.$transaction(async (tx) => {
    const importacion = await tx.cfoImportacion.create({
      data: {
        empresaId: session.empresaId,
        fuenteId: fuente.id,
        sociedadId: rows[0]?.sociedad?.id,
        periodoId: periodos.get(rows[0]?.periodo ?? "")?.id,
        creadoPorId: session.usuarioId,
        estado: CfoEstadoImportacion.VALIDANDO,
        nombreArchivo: archivo.name,
        filasTotales: parsed.rows.length,
        filasValidas: rows.length,
        metadata: {
          headers: parsed.headers,
          tipo: "ASIENTOS_CONTABLES",
        },
      },
      select: { id: true },
    });

    let asientosCreados = 0;
    let lineasCreadas = 0;

    for (const group of asientoGroups.values()) {
      const first = group[0];
      const asiento = await tx.cfoAsientoContable.create({
        data: {
          empresaId: session.empresaId,
          sociedadId: first.sociedad!.id,
          periodoId: periodos.get(first.periodo)!.id,
          importacionId: importacion.id,
          origen: CfoOrigenDato.IMPORTACION,
          numero: first.numero,
          fecha: first.fecha!,
          descripcion: first.descripcion,
          terceroRut: first.terceroRut || null,
          terceroNombre: first.terceroNombre || null,
          documentoTipo: first.documentoTipo || null,
          documentoFolio: first.documentoFolio || null,
          moneda: first.moneda,
        },
        select: { id: true },
      });

      asientosCreados += 1;

      for (const row of group) {
        await tx.cfoAsientoLinea.create({
          data: {
            empresaId: session.empresaId,
            asientoId: asiento.id,
            sociedadId: row.sociedad!.id,
            cuentaId: row.cuenta!.id,
            glosa: row.glosa,
            debito: row.debito,
            credito: row.credito,
            monto: getSignedAmount({
              debito: row.debito,
              credito: row.credito,
              naturaleza: row.cuenta!.naturaleza,
            }),
            moneda: row.moneda,
            metadata: {
              csvRow: row.index + 2,
            },
          },
        });
        lineasCreadas += 1;
      }
    }

    await tx.cfoImportacion.update({
      where: { id: importacion.id },
      data: {
        estado: CfoEstadoImportacion.PROCESADA,
        procesadaAt: new Date(),
      },
    });

    await tx.cfoAuditLog.create({
      data: {
        empresaId: session.empresaId,
        usuarioId: session.usuarioId,
        accion: CfoAuditAccion.IMPORTAR,
        entidadTipo: "CfoImportacion",
        entidadId: importacion.id,
        despues: {
          archivo: archivo.name,
          asientosCreados,
          lineasCreadas,
        },
      },
    });

    return { asientosCreados, lineasCreadas };
  });

  revalidatePath("/cfo");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `Importacion CFO lista: ${result.asientosCreados} asientos y ${result.lineasCreadas} lineas creadas`,
  };
}

type ReportLine = {
  cuentaId: string;
  codigo: string;
  nombre: string;
  tipo: CfoTipoCuenta;
  monto: number;
};

async function getCurrentPeriodo(empresaId: string) {
  const now = new Date();
  const codigo = getPeriodKey(now);
  const periodRange = getPeriodRange(codigo);

  if (!periodRange) {
    throw new Error("No se pudo resolver el periodo actual");
  }

  return db.cfoPeriodo.upsert({
    where: {
      empresaId_codigo: {
        empresaId,
        codigo,
      },
    },
    update: {},
    create: {
      empresaId,
      codigo,
      anio: periodRange.anio,
      mes: periodRange.mes,
      fechaInicio: periodRange.fechaInicio,
      fechaFin: periodRange.fechaFin,
    },
    select: { id: true, codigo: true, estado: true },
  });
}

async function getCurrentPeriodoCierre(empresaId: string) {
  const periodo = await getCurrentPeriodo(empresaId);

  return db.cfoPeriodo.findUniqueOrThrow({
    where: { id: periodo.id },
    select: {
      id: true,
      codigo: true,
      estado: true,
      cerradoAt: true,
      cerradoPorId: true,
    },
  });
}

async function buildReportLines({
  empresaId,
  periodoId,
  tiposCuenta,
}: {
  empresaId: string;
  periodoId: string;
  tiposCuenta: CfoTipoCuenta[];
}) {
  const grouped = await db.cfoAsientoLinea.groupBy({
    by: ["cuentaId"],
    where: {
      empresaId,
      cuenta: { tipo: { in: tiposCuenta } },
      asiento: { periodoId },
    },
    _sum: {
      monto: true,
    },
  });

  const cuentas = await db.cfoCuentaContable.findMany({
    where: {
      empresaId,
      id: { in: grouped.map((row) => row.cuentaId) },
    },
    select: {
      id: true,
      codigo: true,
      nombre: true,
      tipo: true,
    },
  });
  const cuentaById = new Map(cuentas.map((cuenta) => [cuenta.id, cuenta]));

  return grouped
    .map((row): ReportLine | null => {
      const cuenta = cuentaById.get(row.cuentaId);
      if (!cuenta) return null;

      return {
        cuentaId: row.cuentaId,
        codigo: cuenta.codigo,
        nombre: cuenta.nombre,
        tipo: cuenta.tipo,
        monto: Number(row._sum.monto ?? 0),
      };
    })
    .filter((row): row is ReportLine => row !== null)
    .sort((a, b) => a.codigo.localeCompare(b.codigo, "es"));
}

async function nextReportVersion({
  empresaId,
  periodoId,
  tipo,
}: {
  empresaId: string;
  periodoId: string;
  tipo: CfoTipoReporte;
}) {
  const aggregate = await db.cfoReporte.aggregate({
    where: { empresaId, periodoId, tipo },
    _max: { version: true },
  });

  return (aggregate._max.version ?? 0) + 1;
}

async function nextConsolidationVersion({
  empresaId,
  periodoId,
}: {
  empresaId: string;
  periodoId: string;
}) {
  const aggregate = await db.cfoConsolidacion.aggregate({
    where: { empresaId, periodoId },
    _max: { version: true },
  });

  return (aggregate._max.version ?? 0) + 1;
}

async function buildConsolidationSnapshot({
  empresaId,
  periodoId,
}: {
  empresaId: string;
  periodoId: string;
}) {
  const grouped = await db.cfoAsientoLinea.groupBy({
    by: ["sociedadId", "cuentaId"],
    where: {
      empresaId,
      asiento: { periodoId },
    },
    _sum: {
      monto: true,
      debito: true,
      credito: true,
    },
  });

  const [sociedades, cuentas] = await Promise.all([
    db.cfoSociedad.findMany({
      where: {
        empresaId,
        id: { in: grouped.map((row) => row.sociedadId).filter(Boolean) as string[] },
      },
      select: {
        id: true,
        codigo: true,
        razonSocial: true,
        tipo: true,
        porcentajeParticipacion: true,
      },
    }),
    db.cfoCuentaContable.findMany({
      where: {
        empresaId,
        id: { in: grouped.map((row) => row.cuentaId) },
      },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        tipo: true,
      },
    }),
  ]);

  const sociedadById = new Map(sociedades.map((sociedad) => [sociedad.id, sociedad]));
  const cuentaById = new Map(cuentas.map((cuenta) => [cuenta.id, cuenta]));
  const totals = {
    activos: 0,
    pasivos: 0,
    patrimonio: 0,
    ingresos: 0,
    costos: 0,
    gastos: 0,
  };
  const bySociedad = new Map<string, { codigo: string; razonSocial: string; monto: number }>();
  const byCuenta = new Map<
    string,
    {
      codigo: string;
      nombre: string;
      tipo: CfoTipoCuenta;
      monto: number;
    }
  >();

  for (const row of grouped) {
    const cuenta = cuentaById.get(row.cuentaId);
    const sociedad = row.sociedadId ? sociedadById.get(row.sociedadId) : null;
    const monto = Number(row._sum.monto ?? 0);

    if (cuenta?.tipo === CfoTipoCuenta.ACTIVO) totals.activos += monto;
    if (cuenta?.tipo === CfoTipoCuenta.PASIVO) totals.pasivos += monto;
    if (cuenta?.tipo === CfoTipoCuenta.PATRIMONIO) totals.patrimonio += monto;
    if (cuenta?.tipo === CfoTipoCuenta.INGRESO) totals.ingresos += monto;
    if (cuenta?.tipo === CfoTipoCuenta.COSTO) totals.costos += monto;
    if (cuenta?.tipo === CfoTipoCuenta.GASTO) totals.gastos += monto;

    if (sociedad) {
      const current = bySociedad.get(sociedad.id) ?? {
        codigo: sociedad.codigo,
        razonSocial: sociedad.razonSocial,
        monto: 0,
      };
      current.monto += monto;
      bySociedad.set(sociedad.id, current);
    }

    if (cuenta) {
      const current = byCuenta.get(cuenta.id) ?? {
        codigo: cuenta.codigo,
        nombre: cuenta.nombre,
        tipo: cuenta.tipo,
        monto: 0,
      };
      current.monto += monto;
      byCuenta.set(cuenta.id, current);
    }
  }

  return {
    generadoAt: new Date().toISOString(),
    sociedades: Array.from(bySociedad.values()).sort((a, b) =>
      a.codigo.localeCompare(b.codigo, "es")
    ),
    cuentas: Array.from(byCuenta.values()).sort((a, b) =>
      a.codigo.localeCompare(b.codigo, "es")
    ),
    totales: {
      ...totals,
      ebitda: totals.ingresos - totals.costos - totals.gastos,
      liquidez: totals.activos - totals.pasivos,
      cuadreBalance: totals.activos - totals.pasivos - totals.patrimonio,
    },
    conteos: {
      sociedades: sociedades.length,
      cuentas: cuentas.length,
      agrupaciones: grouped.length,
    },
  };
}

function buildEstadoResultadosSnapshot(lines: ReportLine[]) {
  const ingresos = lines
    .filter((line) => line.tipo === CfoTipoCuenta.INGRESO)
    .reduce((sum, line) => sum + line.monto, 0);
  const costos = lines
    .filter((line) => line.tipo === CfoTipoCuenta.COSTO)
    .reduce((sum, line) => sum + line.monto, 0);
  const gastos = lines
    .filter((line) => line.tipo === CfoTipoCuenta.GASTO)
    .reduce((sum, line) => sum + line.monto, 0);

  return {
    ingresos,
    costos,
    gastos,
    margenBruto: ingresos - costos,
    ebitda: ingresos - costos - gastos,
  };
}

function buildBalanceSnapshot(lines: ReportLine[]) {
  const activos = lines
    .filter((line) => line.tipo === CfoTipoCuenta.ACTIVO)
    .reduce((sum, line) => sum + line.monto, 0);
  const pasivos = lines
    .filter((line) => line.tipo === CfoTipoCuenta.PASIVO)
    .reduce((sum, line) => sum + line.monto, 0);
  const patrimonio = lines
    .filter((line) => line.tipo === CfoTipoCuenta.PATRIMONIO)
    .reduce((sum, line) => sum + line.monto, 0);

  return {
    activos,
    pasivos,
    patrimonio,
    patrimonioCalculado: activos - pasivos,
    cuadre: activos - pasivos - patrimonio,
  };
}

export async function generarReportesCfo(
  _prevState: ActionState,
  _formData: FormData
): Promise<ActionState> {
  void _prevState;
  void _formData;
  const session = await requireEmpresaSession();

  await ensureCfoBaseStructure({
    empresaId: session.empresaId,
    usuarioId: session.usuarioId,
  });

  const periodo = await getCurrentPeriodo(session.empresaId);
  const lineCount = await db.cfoAsientoLinea.count({
    where: {
      empresaId: session.empresaId,
      asiento: { periodoId: periodo.id },
    },
  });

  if (lineCount === 0) {
    return {
      message:
        "No hay lineas contables para generar reportes del periodo activo. Importa asientos primero.",
    };
  }

  const [estadoResultadosLines, balanceLines] = await Promise.all([
    buildReportLines({
      empresaId: session.empresaId,
      periodoId: periodo.id,
      tiposCuenta: [
        CfoTipoCuenta.INGRESO,
        CfoTipoCuenta.COSTO,
        CfoTipoCuenta.GASTO,
      ],
    }),
    buildReportLines({
      empresaId: session.empresaId,
      periodoId: periodo.id,
      tiposCuenta: [
        CfoTipoCuenta.ACTIVO,
        CfoTipoCuenta.PASIVO,
        CfoTipoCuenta.PATRIMONIO,
      ],
    }),
  ]);

  if (estadoResultadosLines.length === 0 && balanceLines.length === 0) {
    return {
      message:
        "Los asientos del periodo no tienen cuentas de resultado ni balance para reportar.",
    };
  }

  const [estadoResultadosVersion, balanceVersion] = await Promise.all([
    nextReportVersion({
      empresaId: session.empresaId,
      periodoId: periodo.id,
      tipo: CfoTipoReporte.ESTADO_RESULTADOS,
    }),
    nextReportVersion({
      empresaId: session.empresaId,
      periodoId: periodo.id,
      tipo: CfoTipoReporte.BALANCE,
    }),
  ]);

  const created = await db.$transaction(async (tx) => {
    const reports: string[] = [];

    if (estadoResultadosLines.length > 0) {
      const snapshot = buildEstadoResultadosSnapshot(estadoResultadosLines);
      const reporte = await tx.cfoReporte.create({
        data: {
          empresaId: session.empresaId,
          periodoId: periodo.id,
          generadoPorId: session.usuarioId,
          tipo: CfoTipoReporte.ESTADO_RESULTADOS,
          estado: CfoEstadoReporte.GENERADO,
          nombre: `Estado de resultados ${periodo.codigo}`,
          version: estadoResultadosVersion,
          data: snapshot,
          lineas: {
            create: estadoResultadosLines.map((line, index) => ({
              empresaId: session.empresaId,
              cuentaId: line.cuentaId,
              etiqueta: `${line.codigo} ${line.nombre}`,
              orden: index + 1,
              montoActual: line.monto,
              metadata: { tipoCuenta: line.tipo },
            })),
          },
        },
        select: { id: true },
      });
      reports.push(reporte.id);
    }

    if (balanceLines.length > 0) {
      const snapshot = buildBalanceSnapshot(balanceLines);
      const reporte = await tx.cfoReporte.create({
        data: {
          empresaId: session.empresaId,
          periodoId: periodo.id,
          generadoPorId: session.usuarioId,
          tipo: CfoTipoReporte.BALANCE,
          estado: CfoEstadoReporte.GENERADO,
          nombre: `Balance ${periodo.codigo}`,
          version: balanceVersion,
          data: snapshot,
          lineas: {
            create: balanceLines.map((line, index) => ({
              empresaId: session.empresaId,
              cuentaId: line.cuentaId,
              etiqueta: `${line.codigo} ${line.nombre}`,
              orden: index + 1,
              montoActual: line.monto,
              metadata: { tipoCuenta: line.tipo },
            })),
          },
        },
        select: { id: true },
      });
      reports.push(reporte.id);
    }

    await tx.cfoAuditLog.createMany({
      data: reports.map((reportId) => ({
        empresaId: session.empresaId,
        usuarioId: session.usuarioId,
        accion: CfoAuditAccion.CREAR,
        entidadTipo: "CfoReporte",
        entidadId: reportId,
        despues: {
          periodo: periodo.codigo,
          origen: "generacion_reportes_cfo",
        },
      })),
    });

    return reports.length;
  });

  revalidatePath("/cfo");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `Reportes generados para ${periodo.codigo}: ${created}`,
  };
}

export async function cambiarCierrePeriodoCfo(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  void _prevState;
  const session = await requireEmpresaSession();
  const accion = getStringField(formData, "accion");
  const comentario = getStringField(formData, "comentario");

  const periodo = await getCurrentPeriodoCierre(session.empresaId);
  const [asientos, reportesPeriodo] = await Promise.all([
    db.cfoAsientoContable.count({
      where: { empresaId: session.empresaId, periodoId: periodo.id },
    }),
    db.cfoReporte.findMany({
      where: { empresaId: session.empresaId, periodoId: periodo.id },
      select: { id: true },
    }),
  ]);

  const workflowsPendientes =
    reportesPeriodo.length > 0
      ? await db.cfoWorkflowAprobacion.count({
          where: {
            empresaId: session.empresaId,
            entidadTipo: "CfoReporte",
            entidadId: { in: reportesPeriodo.map((reporte) => reporte.id) },
            estado: {
              in: [
                CfoWorkflowEstado.PENDIENTE,
                CfoWorkflowEstado.EN_REVISION,
              ],
            },
          },
        })
      : 0;
  const reportes = reportesPeriodo.length;

  let nextEstado: CfoEstadoPeriodo;
  let auditAccion: CfoAuditAccion = CfoAuditAccion.ACTUALIZAR;
  const now = new Date();

  if (accion === "iniciar_cierre") {
    if (periodo.estado !== CfoEstadoPeriodo.ABIERTO) {
      return { message: "Solo puedes iniciar cierre desde un periodo abierto." };
    }
    if (asientos === 0) {
      return {
        message:
          "No hay asientos contables en el periodo activo. Importa datos antes de iniciar cierre.",
      };
    }
    nextEstado = CfoEstadoPeriodo.EN_CIERRE;
  } else if (accion === "cerrar") {
    if (periodo.estado !== CfoEstadoPeriodo.EN_CIERRE) {
      return { message: "Solo puedes cerrar un periodo que esta en cierre." };
    }
    if (reportes === 0) {
      return {
        message:
          "Genera al menos un reporte financiero antes de cerrar el periodo.",
      };
    }
    if (workflowsPendientes > 0) {
      return {
        message:
          "Hay reportes en revision. Resuelve aprobaciones antes de cerrar.",
      };
    }
    nextEstado = CfoEstadoPeriodo.CERRADO;
    auditAccion = CfoAuditAccion.CERRAR;
  } else if (accion === "bloquear") {
    if (periodo.estado !== CfoEstadoPeriodo.CERRADO) {
      return { message: "Solo puedes bloquear un periodo cerrado." };
    }
    nextEstado = CfoEstadoPeriodo.BLOQUEADO;
    auditAccion = CfoAuditAccion.CERRAR;
  } else if (accion === "reabrir") {
    if (
      periodo.estado !== CfoEstadoPeriodo.EN_CIERRE &&
      periodo.estado !== CfoEstadoPeriodo.CERRADO
    ) {
      return {
        message: "Solo puedes reabrir un periodo en cierre o cerrado.",
      };
    }
    if (periodo.estado === CfoEstadoPeriodo.CERRADO && comentario.length < 5) {
      return {
        errors: {
          comentario: ["Explica por que se reabre el periodo cerrado"],
        },
        message: "Reabrir un periodo cerrado requiere comentario.",
      };
    }
    nextEstado = CfoEstadoPeriodo.ABIERTO;
    auditAccion = CfoAuditAccion.REABRIR;
  } else {
    return { message: "Accion de cierre no valida." };
  }

  await db.$transaction(async (tx) => {
    await tx.cfoPeriodo.update({
      where: { id: periodo.id },
      data: {
        estado: nextEstado,
        cerradoPorId:
          nextEstado === CfoEstadoPeriodo.CERRADO ||
          nextEstado === CfoEstadoPeriodo.BLOQUEADO
            ? session.usuarioId
            : null,
        cerradoAt:
          nextEstado === CfoEstadoPeriodo.CERRADO ||
          nextEstado === CfoEstadoPeriodo.BLOQUEADO
            ? now
            : null,
      },
    });

    if (comentario) {
      await tx.cfoComentarioFinanciero.create({
        data: {
          empresaId: session.empresaId,
          periodoId: periodo.id,
          creadoPorId: session.usuarioId,
          titulo: "Comentario de cierre financiero",
          contenido: comentario,
          tags: { accion, modulo: "cierre_periodo_cfo" },
        },
      });
    }

    await tx.cfoAuditLog.create({
      data: {
        empresaId: session.empresaId,
        usuarioId: session.usuarioId,
        accion: auditAccion,
        entidadTipo: "CfoPeriodo",
        entidadId: periodo.id,
        antes: { estado: periodo.estado },
        despues: {
          estado: nextEstado,
          accion,
          asientos,
          reportes,
          workflowsPendientes,
        },
        metadata: {
          periodo: periodo.codigo,
          comentario: comentario ? "incluido" : "sin_comentario",
        },
      },
    });
  });

  revalidatePath("/cfo");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `Periodo ${periodo.codigo} actualizado a ${nextEstado.toLowerCase()}.`,
  };
}

export async function generarConsolidacionCfo(
  _prevState: ActionState,
  _formData: FormData
): Promise<ActionState> {
  void _prevState;
  void _formData;
  const session = await requireEmpresaSession();

  await ensureCfoBaseStructure({
    empresaId: session.empresaId,
    usuarioId: session.usuarioId,
  });

  const periodo = await getCurrentPeriodo(session.empresaId);
  if (periodo.estado === CfoEstadoPeriodo.BLOQUEADO) {
    return {
      message:
        "El periodo esta bloqueado. No se pueden crear nuevas consolidaciones.",
    };
  }

  const lineCount = await db.cfoAsientoLinea.count({
    where: {
      empresaId: session.empresaId,
      asiento: { periodoId: periodo.id },
    },
  });

  if (lineCount === 0) {
    return {
      message:
        "No hay lineas contables para consolidar en el periodo activo.",
    };
  }

  const [version, matriz, snapshot] = await Promise.all([
    nextConsolidationVersion({
      empresaId: session.empresaId,
      periodoId: periodo.id,
    }),
    db.cfoSociedad.findFirst({
      where: {
        empresaId: session.empresaId,
        activa: true,
        tipo: CfoTipoSociedad.MATRIZ,
      },
      select: { id: true, codigo: true, razonSocial: true },
      orderBy: { createdAt: "asc" },
    }),
    buildConsolidationSnapshot({
      empresaId: session.empresaId,
      periodoId: periodo.id,
    }),
  ]);

  const consolidacion = await db.$transaction(async (tx) => {
    const created = await tx.cfoConsolidacion.create({
      data: {
        empresaId: session.empresaId,
        periodoId: periodo.id,
        sociedadMatrizId: matriz?.id,
        creadoPorId: session.usuarioId,
        estado: CfoEstadoConsolidacion.BORRADOR,
        version,
        monedaPresentacion: "CLP",
        snapshot,
        resumenEjecutivo: `Consolidacion ${periodo.codigo} v${version}: ${snapshot.conteos.sociedades} sociedades, ${snapshot.conteos.cuentas} cuentas y ${lineCount} lineas contables.`,
      },
      select: { id: true },
    });

    await tx.cfoAuditLog.create({
      data: {
        empresaId: session.empresaId,
        usuarioId: session.usuarioId,
        accion: CfoAuditAccion.CREAR,
        entidadTipo: "CfoConsolidacion",
        entidadId: created.id,
        despues: {
          periodo: periodo.codigo,
          version,
          sociedadMatriz: matriz?.codigo ?? null,
          lineasContables: lineCount,
          totales: snapshot.totales,
        },
      },
    });

    return created;
  });

  revalidatePath("/cfo");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `Consolidacion CFO generada: ${periodo.codigo} v${version}`,
  };
}

export async function cambiarEstadoReporteCfo(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  void _prevState;
  const session = await requireEmpresaSession();
  const reporteId = getStringField(formData, "reporteId");
  const accion = getStringField(formData, "accion");
  const comentario = getStringField(formData, "comentario");

  if (!reporteId) {
    return { message: "Falta el reporte a actualizar." };
  }

  const reporte = await db.cfoReporte.findFirst({
    where: { id: reporteId, empresaId: session.empresaId },
    select: {
      id: true,
      periodoId: true,
      estado: true,
      nombre: true,
      tipo: true,
      version: true,
    },
  });

  if (!reporte) {
    return { message: "Reporte CFO no encontrado." };
  }

  const now = new Date();
  let nextEstado: CfoEstadoReporte;
  let auditAccion: CfoAuditAccion = CfoAuditAccion.ACTUALIZAR;
  let workflowEstado: CfoWorkflowEstado | null = null;
  let workflowResolver:
    | "aprobadoPorId"
    | "rechazadoPorId"
    | null = null;

  if (accion === "solicitar_revision") {
    if (
      reporte.estado !== CfoEstadoReporte.BORRADOR &&
      reporte.estado !== CfoEstadoReporte.GENERADO
    ) {
      return {
        message:
          "Solo puedes enviar a revision reportes en borrador o generados.",
      };
    }
    nextEstado = CfoEstadoReporte.EN_REVISION;
    workflowEstado = CfoWorkflowEstado.EN_REVISION;
  } else if (accion === "aprobar") {
    if (reporte.estado !== CfoEstadoReporte.EN_REVISION) {
      return { message: "Solo puedes aprobar reportes en revision." };
    }
    nextEstado = CfoEstadoReporte.APROBADO;
    auditAccion = CfoAuditAccion.APROBAR;
    workflowEstado = CfoWorkflowEstado.APROBADO;
    workflowResolver = "aprobadoPorId";
  } else if (accion === "rechazar") {
    if (reporte.estado !== CfoEstadoReporte.EN_REVISION) {
      return { message: "Solo puedes rechazar reportes en revision." };
    }
    if (!comentario) {
      return {
        errors: { comentario: ["Explica el motivo del rechazo"] },
        message: "El rechazo requiere comentario.",
      };
    }
    nextEstado = CfoEstadoReporte.BORRADOR;
    auditAccion = CfoAuditAccion.RECHAZAR;
    workflowEstado = CfoWorkflowEstado.RECHAZADO;
    workflowResolver = "rechazadoPorId";
  } else if (accion === "publicar") {
    if (reporte.estado !== CfoEstadoReporte.APROBADO) {
      return { message: "Solo puedes publicar reportes aprobados." };
    }
    nextEstado = CfoEstadoReporte.PUBLICADO;
    auditAccion = CfoAuditAccion.CERRAR;
  } else if (accion === "archivar") {
    if (reporte.estado === CfoEstadoReporte.ARCHIVADO) {
      return { message: "El reporte ya esta archivado." };
    }
    nextEstado = CfoEstadoReporte.ARCHIVADO;
    auditAccion = CfoAuditAccion.CERRAR;
  } else if (accion === "reabrir") {
    if (reporte.estado !== CfoEstadoReporte.ARCHIVADO) {
      return { message: "Solo puedes reabrir reportes archivados." };
    }
    nextEstado = CfoEstadoReporte.GENERADO;
    auditAccion = CfoAuditAccion.REABRIR;
  } else {
    return { message: "Accion de reporte no valida." };
  }

  await db.$transaction(async (tx) => {
    await tx.cfoReporte.update({
      where: { id: reporte.id },
      data: {
        estado: nextEstado,
        aprobadoPorId:
          nextEstado === CfoEstadoReporte.APROBADO
            ? session.usuarioId
            : accion === "rechazar" || accion === "reabrir"
              ? null
              : undefined,
        aprobadoAt:
          nextEstado === CfoEstadoReporte.APROBADO
            ? now
            : accion === "rechazar" || accion === "reabrir"
              ? null
              : undefined,
      },
    });

    if (workflowEstado) {
      const workflowUpdate = await tx.cfoWorkflowAprobacion.updateMany({
        where: {
          empresaId: session.empresaId,
          entidadTipo: "CfoReporte",
          entidadId: reporte.id,
          estado: {
            in: [
              CfoWorkflowEstado.PENDIENTE,
              CfoWorkflowEstado.EN_REVISION,
            ],
          },
        },
        data: {
          estado: workflowEstado,
          comentario: comentario || undefined,
          resueltoAt:
            workflowEstado === CfoWorkflowEstado.APROBADO ||
            workflowEstado === CfoWorkflowEstado.RECHAZADO
              ? now
              : undefined,
          aprobadoPorId:
            workflowResolver === "aprobadoPorId" ? session.usuarioId : undefined,
          rechazadoPorId:
            workflowResolver === "rechazadoPorId" ? session.usuarioId : undefined,
        },
      });

      if (workflowUpdate.count === 0) {
        await tx.cfoWorkflowAprobacion.create({
          data: {
            empresaId: session.empresaId,
            solicitadoPorId: session.usuarioId,
            aprobadoPorId:
              workflowResolver === "aprobadoPorId" ? session.usuarioId : undefined,
            rechazadoPorId:
              workflowResolver === "rechazadoPorId" ? session.usuarioId : undefined,
            entidadTipo: "CfoReporte",
            entidadId: reporte.id,
            estado: workflowEstado,
            comentario: comentario || undefined,
            resueltoAt:
              workflowEstado === CfoWorkflowEstado.APROBADO ||
              workflowEstado === CfoWorkflowEstado.RECHAZADO
                ? now
                : undefined,
          },
        });
      }
    }

    if (comentario) {
      await tx.cfoComentarioFinanciero.create({
        data: {
          empresaId: session.empresaId,
          periodoId: reporte.periodoId,
          reporteId: reporte.id,
          creadoPorId: session.usuarioId,
          titulo:
            accion === "rechazar"
              ? "Motivo de rechazo"
              : "Comentario de flujo",
          contenido: comentario,
          tags: { accion },
        },
      });
    }

    await tx.cfoAuditLog.create({
      data: {
        empresaId: session.empresaId,
        usuarioId: session.usuarioId,
        accion: auditAccion,
        entidadTipo: "CfoReporte",
        entidadId: reporte.id,
        antes: { estado: reporte.estado },
        despues: { estado: nextEstado, accion },
        metadata: {
          nombre: reporte.nombre,
          tipo: reporte.tipo,
          version: reporte.version,
          comentario: comentario ? "incluido" : "sin_comentario",
        },
      },
    });
  });

  revalidatePath("/cfo");
  revalidatePath(getReporteDetailPath(reporte.id));
  revalidatePath("/dashboard");

  return {
    success: true,
    message: "Estado del reporte actualizado.",
  };
}

export async function comentarReporteCfo(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  void _prevState;
  const session = await requireEmpresaSession();
  const reporteId = getStringField(formData, "reporteId");
  const titulo = getStringField(formData, "titulo") || "Comentario ejecutivo";
  const contenido = getStringField(formData, "contenido");

  if (!reporteId) {
    return { message: "Falta el reporte a comentar." };
  }

  if (contenido.length < 5) {
    return {
      errors: { contenido: ["Escribe un comentario financiero mas completo"] },
      message: "El comentario es demasiado corto.",
    };
  }

  const reporte = await db.cfoReporte.findFirst({
    where: { id: reporteId, empresaId: session.empresaId },
    select: { id: true, periodoId: true, nombre: true },
  });

  if (!reporte) {
    return { message: "Reporte CFO no encontrado." };
  }

  await db.$transaction([
    db.cfoComentarioFinanciero.create({
      data: {
        empresaId: session.empresaId,
        periodoId: reporte.periodoId,
        reporteId: reporte.id,
        creadoPorId: session.usuarioId,
        titulo,
        contenido,
        tags: { origen: "detalle_reporte_cfo" },
      },
    }),
    db.cfoAuditLog.create({
      data: {
        empresaId: session.empresaId,
        usuarioId: session.usuarioId,
        accion: CfoAuditAccion.CREAR,
        entidadTipo: "CfoComentarioFinanciero",
        entidadId: reporte.id,
        despues: { reporte: reporte.nombre, titulo },
      },
    }),
  ]);

  revalidatePath(getReporteDetailPath(reporte.id));

  return {
    success: true,
    message: "Comentario agregado al reporte.",
  };
}
