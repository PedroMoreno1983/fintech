import {
  CfoEstadoPeriodo,
  CfoNaturalezaCuenta,
  CfoTipoEscenario,
  CfoTipoFuenteDato,
  CfoTipoSociedad,
  CfoTipoCuenta,
} from "@/app/generated/prisma";
import { db } from "@/lib/db";

function getPeriodRange(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();

  return {
    codigo: `${year}-${String(month + 1).padStart(2, "0")}`,
    anio: year,
    mes: month + 1,
    fechaInicio: new Date(year, month, 1),
    fechaFin: new Date(year, month + 1, 0, 23, 59, 59, 999),
  };
}

function toNumber(value: unknown) {
  if (value === null || value === undefined) return 0;
  return Number(value);
}

const defaultAccounts = [
  {
    codigo: "1000",
    nombre: "Activos",
    tipo: CfoTipoCuenta.ACTIVO,
    naturaleza: CfoNaturalezaCuenta.DEUDORA,
    nivel: 1,
    esImputable: false,
  },
  {
    codigo: "1100",
    nombre: "Caja y bancos",
    tipo: CfoTipoCuenta.ACTIVO,
    naturaleza: CfoNaturalezaCuenta.DEUDORA,
    nivel: 2,
    parentCodigo: "1000",
  },
  {
    codigo: "1200",
    nombre: "Cuentas por cobrar",
    tipo: CfoTipoCuenta.ACTIVO,
    naturaleza: CfoNaturalezaCuenta.DEUDORA,
    nivel: 2,
    parentCodigo: "1000",
  },
  {
    codigo: "2000",
    nombre: "Pasivos",
    tipo: CfoTipoCuenta.PASIVO,
    naturaleza: CfoNaturalezaCuenta.ACREEDORA,
    nivel: 1,
    esImputable: false,
  },
  {
    codigo: "2100",
    nombre: "Cuentas por pagar",
    tipo: CfoTipoCuenta.PASIVO,
    naturaleza: CfoNaturalezaCuenta.ACREEDORA,
    nivel: 2,
    parentCodigo: "2000",
  },
  {
    codigo: "3000",
    nombre: "Patrimonio",
    tipo: CfoTipoCuenta.PATRIMONIO,
    naturaleza: CfoNaturalezaCuenta.ACREEDORA,
    nivel: 1,
  },
  {
    codigo: "4000",
    nombre: "Ingresos operacionales",
    tipo: CfoTipoCuenta.INGRESO,
    naturaleza: CfoNaturalezaCuenta.ACREEDORA,
    nivel: 1,
  },
  {
    codigo: "5000",
    nombre: "Costos de venta",
    tipo: CfoTipoCuenta.COSTO,
    naturaleza: CfoNaturalezaCuenta.DEUDORA,
    nivel: 1,
  },
  {
    codigo: "6000",
    nombre: "Gastos de administracion y venta",
    tipo: CfoTipoCuenta.GASTO,
    naturaleza: CfoNaturalezaCuenta.DEUDORA,
    nivel: 1,
  },
];

export async function ensureCfoBaseStructure({
  empresaId,
  usuarioId,
}: {
  empresaId: string;
  usuarioId: string;
}) {
  const period = getPeriodRange();

  await db.$transaction(async (tx) => {
    await tx.cfoSociedad.upsert({
      where: {
        empresaId_codigo: {
          empresaId,
          codigo: "MATRIZ",
        },
      },
      update: {
        activa: true,
      },
      create: {
        empresaId,
        codigo: "MATRIZ",
        razonSocial: "Sociedad matriz",
        nombreFantasia: "Matriz",
        tipo: CfoTipoSociedad.MATRIZ,
        monedaFuncional: "CLP",
      },
    });

    await tx.cfoFuenteDatos.upsert({
      where: {
        empresaId_nombre: {
          empresaId,
          nombre: "Carga manual CFO",
        },
      },
      update: {
        activo: true,
      },
      create: {
        empresaId,
        nombre: "Carga manual CFO",
        tipo: CfoTipoFuenteDato.MANUAL,
        sistema: "Fintech CFO",
      },
    });

    await tx.cfoPeriodo.upsert({
      where: {
        empresaId_codigo: {
          empresaId,
          codigo: period.codigo,
        },
      },
      update: {},
      create: {
        empresaId,
        codigo: period.codigo,
        anio: period.anio,
        mes: period.mes,
        fechaInicio: period.fechaInicio,
        fechaFin: period.fechaFin,
        estado: CfoEstadoPeriodo.ABIERTO,
      },
    });

    const byCode = new Map<string, string>();

    for (const account of defaultAccounts) {
      const created = await tx.cfoCuentaContable.upsert({
        where: {
          empresaId_codigo: {
            empresaId,
            codigo: account.codigo,
          },
        },
        update: {
          nombre: account.nombre,
          tipo: account.tipo,
          naturaleza: account.naturaleza,
          nivel: account.nivel,
          esImputable: account.esImputable ?? true,
          activa: true,
        },
        create: {
          empresaId,
          codigo: account.codigo,
          nombre: account.nombre,
          tipo: account.tipo,
          naturaleza: account.naturaleza,
          nivel: account.nivel,
          esImputable: account.esImputable ?? true,
        },
        select: { id: true },
      });

      byCode.set(account.codigo, created.id);
    }

    for (const account of defaultAccounts) {
      if (!account.parentCodigo) continue;

      await tx.cfoCuentaContable.update({
        where: {
          empresaId_codigo: {
            empresaId,
            codigo: account.codigo,
          },
        },
        data: {
          parentId: byCode.get(account.parentCodigo),
        },
      });
    }

    await tx.cfoEscenario.upsert({
      where: {
        empresaId_codigo_version: {
          empresaId,
          codigo: "PRESUPUESTO-BASE",
          version: 1,
        },
      },
      update: {
        activo: true,
      },
      create: {
        empresaId,
        codigo: "PRESUPUESTO-BASE",
        nombre: "Presupuesto base",
        tipo: CfoTipoEscenario.PRESUPUESTO,
        version: 1,
        creadoPorId: usuarioId,
      },
    });
  });
}

export async function getCfoDashboard(empresaId: string) {
  const period = getPeriodRange();

  const [
    sociedades,
    periodos,
    cuentas,
    centrosCosto,
    fuentes,
    currentPeriodo,
    recentAsientos,
    consolidaciones,
    reportes,
    planes,
    insights,
    workflows,
    esgIndicadores,
    importaciones,
  ] = await Promise.all([
    db.cfoSociedad.count({ where: { empresaId, activa: true } }),
    db.cfoPeriodo.count({ where: { empresaId } }),
    db.cfoCuentaContable.count({ where: { empresaId, activa: true } }),
    db.cfoCentroCosto.count({ where: { empresaId, activo: true } }),
    db.cfoFuenteDatos.count({ where: { empresaId, activo: true } }),
    db.cfoPeriodo.findUnique({
      where: {
        empresaId_codigo: {
          empresaId,
          codigo: period.codigo,
        },
      },
      select: {
        id: true,
        codigo: true,
        estado: true,
        cerradoAt: true,
        cerradoPor: { select: { nombre: true } },
      },
    }),
    db.cfoAsientoContable.findMany({
      where: { empresaId },
      include: {
        sociedad: { select: { codigo: true, razonSocial: true } },
        lineas: {
          include: {
            cuenta: { select: { codigo: true, nombre: true, tipo: true } },
          },
          take: 3,
        },
      },
      orderBy: [{ fecha: "desc" }, { createdAt: "desc" }],
      take: 6,
    }),
    db.cfoConsolidacion.findMany({
      where: { empresaId },
      include: {
        periodo: { select: { codigo: true } },
        sociedadMatriz: { select: { codigo: true, razonSocial: true } },
        _count: { select: { ajustes: true, eliminaciones: true, reportes: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    db.cfoReporte.findMany({
      where: { empresaId },
      include: {
        periodo: { select: { codigo: true } },
        _count: { select: { lineas: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    db.cfoPlanFinanciero.findMany({
      where: { empresaId },
      include: {
        periodo: { select: { codigo: true } },
        escenario: { select: { nombre: true, tipo: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    db.cfoInsightCfo.findMany({
      where: { empresaId },
      include: {
        periodo: { select: { codigo: true } },
        cuenta: { select: { codigo: true, nombre: true } },
      },
      orderBy: [{ severidad: "desc" }, { createdAt: "desc" }],
      take: 5,
    }),
    db.cfoWorkflowAprobacion.findMany({
      where: { empresaId, estado: { in: ["PENDIENTE", "EN_REVISION"] } },
      orderBy: { solicitadoAt: "desc" },
      take: 5,
    }),
    db.cfoIndicadorEsg.count({ where: { empresaId, activo: true } }),
    db.cfoImportacion.findMany({
      where: { empresaId },
      include: {
        fuente: { select: { nombre: true, tipo: true } },
        sociedad: { select: { codigo: true, razonSocial: true } },
        periodo: { select: { codigo: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const balanceByType = currentPeriodo
    ? await db.cfoAsientoLinea.groupBy({
        by: ["cuentaId"],
        where: {
          empresaId,
          asiento: { periodoId: currentPeriodo.id },
        },
        _sum: {
          monto: true,
          debito: true,
          credito: true,
        },
      })
    : [];

  const accountMap = new Map(
    await db.cfoCuentaContable
      .findMany({
        where: {
          empresaId,
          id: { in: balanceByType.map((row) => row.cuentaId) },
        },
        select: { id: true, tipo: true },
      })
      .then((rows) => rows.map((row) => [row.id, row.tipo] as const))
  );

  const totals = {
    activos: 0,
    pasivos: 0,
    patrimonio: 0,
    ingresos: 0,
    costos: 0,
    gastos: 0,
  };

  for (const row of balanceByType) {
    const tipo = accountMap.get(row.cuentaId);
    const monto =
      row._sum.monto !== null
        ? toNumber(row._sum.monto)
        : toNumber(row._sum.debito) - toNumber(row._sum.credito);

    if (tipo === CfoTipoCuenta.ACTIVO) totals.activos += monto;
    if (tipo === CfoTipoCuenta.PASIVO) totals.pasivos += monto;
    if (tipo === CfoTipoCuenta.PATRIMONIO) totals.patrimonio += monto;
    if (tipo === CfoTipoCuenta.INGRESO) totals.ingresos += monto;
    if (tipo === CfoTipoCuenta.COSTO) totals.costos += monto;
    if (tipo === CfoTipoCuenta.GASTO) totals.gastos += monto;
  }

  const cierreStats = currentPeriodo
    ? await Promise.all([
        db.cfoAsientoContable.count({
          where: { empresaId, periodoId: currentPeriodo.id },
        }),
        db.cfoImportacion.count({
          where: { empresaId, periodoId: currentPeriodo.id },
        }),
        db.cfoReporte.findMany({
          where: { empresaId, periodoId: currentPeriodo.id },
          select: { id: true },
        }),
      ]).then(async ([asientos, importacionesPeriodo, reportesPeriodo]) => {
        const workflowsPendientes =
          reportesPeriodo.length > 0
            ? await db.cfoWorkflowAprobacion.count({
                where: {
                  empresaId,
                  entidadTipo: "CfoReporte",
                  entidadId: { in: reportesPeriodo.map((reporte) => reporte.id) },
                  estado: { in: ["PENDIENTE", "EN_REVISION"] },
                },
              })
            : 0;

        return {
          asientos,
          importaciones: importacionesPeriodo,
          reportes: reportesPeriodo.length,
          workflowsPendientes,
        };
      })
    : {
        asientos: 0,
        importaciones: 0,
        reportes: 0,
        workflowsPendientes: 0,
      };

  return {
    periodoActual: currentPeriodo?.codigo ?? period.codigo,
    estadoPeriodo: currentPeriodo?.estado ?? "SIN_PERIODO",
    cierre: {
      periodoId: currentPeriodo?.id ?? null,
      periodoCodigo: currentPeriodo?.codigo ?? period.codigo,
      estado: currentPeriodo?.estado ?? "SIN_PERIODO",
      cerradoAt: currentPeriodo?.cerradoAt ?? null,
      cerradoPor: currentPeriodo?.cerradoPor?.nombre ?? null,
      ...cierreStats,
      listoParaIniciar: cierreStats.asientos > 0,
      listoParaCerrar:
        cierreStats.reportes > 0 && cierreStats.workflowsPendientes === 0,
    },
    counts: {
      sociedades,
      periodos,
      cuentas,
      centrosCosto,
      fuentes,
      esgIndicadores,
    },
    totals: {
      ...totals,
      ebitda: totals.ingresos - totals.costos - totals.gastos,
      liquidez: totals.activos - totals.pasivos,
    },
    recentAsientos,
    consolidaciones,
    reportes,
    planes,
    insights,
    workflows,
    importaciones,
    isBootstrapped: sociedades > 0 && cuentas > 0 && periodos > 0,
  };
}
