import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Download,
  FileBarChart,
  Scale,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { CfoReporteWorkflowActions } from "@/app/components/cfo/reporte-workflow-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Kpi } from "@/app/components/ui/kpi";
import { db } from "@/lib/db";
import { requireEmpresaSession } from "@/lib/session";
import { formatFecha, formatFechaHora, formatNumero, formatPeso } from "@/lib/utils";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

function formatEstado(value: string) {
  return value.replace(/_/g, " ").toLowerCase();
}

function getEstadoVariant(value: string) {
  if (value === "APROBADO" || value === "PUBLICADO") return "success";
  if (value === "BORRADOR") return "secondary";
  if (value === "ARCHIVADO") return "outline";
  return "info";
}

function getNumberFromData(data: unknown, key: string) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const value = (data as Record<string, unknown>)[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toNumber(value: unknown) {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatPct(value: unknown) {
  const number = toNumber(value);
  if (number === null) return "-";
  return `${formatNumero(number, 2)}%`;
}

function buildKpis(tipo: string, data: unknown) {
  if (tipo === "BALANCE") {
    const activos = getNumberFromData(data, "activos");
    const pasivos = getNumberFromData(data, "pasivos");
    const patrimonio = getNumberFromData(data, "patrimonio");
    const cuadre = getNumberFromData(data, "cuadre");

    return [
      { label: "Activos", value: formatPeso(activos), tone: "up" as const },
      { label: "Pasivos", value: formatPeso(pasivos), tone: "flat" as const },
      { label: "Patrimonio", value: formatPeso(patrimonio), tone: "flat" as const },
      {
        label: "Cuadre",
        value: formatPeso(cuadre),
        tone: (cuadre ?? 0) === 0 ? ("up" as const) : ("down" as const),
      },
    ];
  }

  const ingresos = getNumberFromData(data, "ingresos");
  const costos = getNumberFromData(data, "costos");
  const gastos = getNumberFromData(data, "gastos");
  const ebitda = getNumberFromData(data, "ebitda");

  return [
    { label: "Ingresos", value: formatPeso(ingresos), tone: "up" as const },
    { label: "Costos", value: formatPeso(costos), tone: "flat" as const },
    { label: "Gastos", value: formatPeso(gastos), tone: "flat" as const },
    {
      label: "EBITDA",
      value: formatPeso(ebitda),
      tone: (ebitda ?? 0) >= 0 ? ("up" as const) : ("down" as const),
    },
  ];
}

export default async function CfoReportePage({ params }: PageProps) {
  const session = await requireEmpresaSession();
  const { id } = await params;

  const [reporte, workflows] = await Promise.all([
    db.cfoReporte.findFirst({
      where: { id, empresaId: session.empresaId },
      include: {
        periodo: true,
        consolidacion: { select: { version: true, estado: true } },
        generadoPor: { select: { nombre: true, email: true } },
        aprobadoPor: { select: { nombre: true, email: true } },
        comentarios: {
          orderBy: { createdAt: "desc" },
          include: {
            creadoPor: { select: { nombre: true } },
          },
        },
        lineas: {
          orderBy: [{ orden: "asc" }, { etiqueta: "asc" }],
          include: {
            cuenta: { select: { codigo: true, nombre: true, tipo: true } },
            sociedad: { select: { codigo: true, razonSocial: true } },
          },
        },
      },
    }),
    db.cfoWorkflowAprobacion.findMany({
      where: {
        empresaId: session.empresaId,
        entidadTipo: "CfoReporte",
        entidadId: id,
      },
      orderBy: { solicitadoAt: "desc" },
      include: {
        solicitadoPor: { select: { nombre: true } },
        aprobadoPor: { select: { nombre: true } },
        rechazadoPor: { select: { nombre: true } },
      },
    }),
  ]);

  if (!reporte) {
    notFound();
  }

  const kpis = buildKpis(reporte.tipo, reporte.data);

  return (
    <div className="mx-auto flex max-w-[1320px] flex-col gap-4 p-5 lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
            <Link href="/cfo">
              <ArrowLeft className="h-4 w-4" />
              CFO Platform
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-[var(--color-fg1)]">
              {reporte.nombre}
            </h1>
            <Badge variant={getEstadoVariant(reporte.estado)}>
              {formatEstado(reporte.estado)}
            </Badge>
          </div>
          <p className="mt-1 text-[13px] text-[var(--color-fg3)]">
            {formatEstado(reporte.tipo)} - {reporte.periodo.codigo} - version{" "}
            {reporte.version} - {reporte.moneda}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/cfo/reportes/${reporte.id}/export`}>
              <Download className="h-4 w-4" />
              Exportar CSV
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((item) => (
          <Kpi
            key={item.label}
            label={item.label}
            value={item.value}
            deltaLabel="reporte"
            deltaTone={item.tone}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.72fr_0.28fr]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileBarChart className="h-4 w-4 text-blue-600" />
              Lineas del reporte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border border-[var(--color-border)]">
              <div className="grid grid-cols-[54px_1.5fr_0.8fr_0.8fr_0.7fr] gap-3 bg-[var(--color-surface-muted)] px-3 py-2 text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--color-fg3)] max-lg:hidden">
                <span>Orden</span>
                <span>Concepto</span>
                <span className="text-right">Actual</span>
                <span className="text-right">Comparativo</span>
                <span className="text-right">Var.</span>
              </div>
              <div className="divide-y divide-[var(--color-border)]">
                {reporte.lineas.map((linea) => (
                  <div
                    key={linea.id}
                    className="grid gap-2 px-3 py-3 text-sm lg:grid-cols-[54px_1.5fr_0.8fr_0.8fr_0.7fr] lg:gap-3"
                  >
                    <span className="hidden text-xs text-[var(--color-fg4)] lg:block">
                      {linea.orden}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--color-fg1)]">
                        {linea.etiqueta}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-[var(--color-fg3)]">
                        {linea.cuenta
                          ? `${linea.cuenta.codigo} - ${linea.cuenta.nombre}`
                          : "Sin cuenta asociada"}
                        {linea.sociedad
                          ? ` - ${linea.sociedad.codigo} ${linea.sociedad.razonSocial}`
                          : ""}
                      </p>
                    </div>
                    <p className="tnum text-left font-medium text-[var(--color-fg1)] lg:text-right">
                      {formatPeso(toNumber(linea.montoActual))}
                    </p>
                    <p className="tnum text-left text-[var(--color-fg3)] lg:text-right">
                      {formatPeso(toNumber(linea.montoComparativo))}
                    </p>
                    <div className="text-left lg:text-right">
                      <p className="tnum text-[var(--color-fg2)]">
                        {formatPeso(toNumber(linea.variacion))}
                      </p>
                      <p className="tnum text-xs text-[var(--color-fg4)]">
                        {formatPct(linea.variacionPct)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <CfoReporteWorkflowActions
            reporteId={reporte.id}
            estado={reporte.estado}
          />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Scale className="h-4 w-4 text-emerald-600" />
                Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-[var(--color-fg4)]">Generado por</p>
                <p className="font-medium text-[var(--color-fg1)]">
                  {reporte.generadoPor.nombre}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-fg4)]">Generado</p>
                <p className="text-[var(--color-fg2)]">
                  {formatFechaHora(reporte.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-fg4)]">Periodo</p>
                <p className="text-[var(--color-fg2)]">
                  {formatFecha(reporte.periodo.fechaInicio)} -{" "}
                  {formatFecha(reporte.periodo.fechaFin)}
                </p>
              </div>
              {reporte.consolidacion && (
                <div>
                  <p className="text-xs text-[var(--color-fg4)]">
                    Consolidacion
                  </p>
                  <p className="text-[var(--color-fg2)]">
                    v{reporte.consolidacion.version} -{" "}
                    {formatEstado(reporte.consolidacion.estado)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-[var(--color-fg4)]">Aprobacion</p>
                {reporte.aprobadoPor ? (
                  <p className="flex items-center gap-2 text-[var(--color-fg2)]">
                    <UserCheck className="h-4 w-4 text-emerald-600" />
                    {reporte.aprobadoPor.nombre} -{" "}
                    {formatFechaHora(reporte.aprobadoAt)}
                  </p>
                ) : (
                  <p className="text-[var(--color-fg3)]">Pendiente</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Historial de flujo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {workflows.length === 0 ? (
                <p className="text-sm text-[var(--color-fg3)]">
                  Sin solicitudes de aprobacion registradas.
                </p>
              ) : (
                workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className="rounded-lg bg-[var(--color-surface-muted)] p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-[var(--color-fg1)]">
                          {formatEstado(workflow.estado)}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--color-fg3)]">
                          Solicitado por {workflow.solicitadoPor.nombre}
                        </p>
                      </div>
                      <Badge
                        variant={
                          workflow.estado === "APROBADO"
                            ? "success"
                            : workflow.estado === "RECHAZADO"
                              ? "destructive"
                              : "info"
                        }
                      >
                        {formatFecha(workflow.solicitadoAt)}
                      </Badge>
                    </div>
                    {workflow.comentario && (
                      <p className="mt-2 text-xs text-[var(--color-fg3)]">
                        {workflow.comentario}
                      </p>
                    )}
                    {(workflow.aprobadoPor || workflow.rechazadoPor) && (
                      <p className="mt-2 text-[11px] text-[var(--color-fg4)]">
                        Resuelto por{" "}
                        {workflow.aprobadoPor?.nombre ??
                          workflow.rechazadoPor?.nombre}
                        {workflow.resueltoAt
                          ? ` - ${formatFechaHora(workflow.resueltoAt)}`
                          : ""}
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Comentarios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reporte.comentarios.length === 0 ? (
                <p className="text-sm text-[var(--color-fg3)]">
                  Sin comentarios ejecutivos asociados.
                </p>
              ) : (
                reporte.comentarios.map((comentario) => (
                  <div
                    key={comentario.id}
                    className="rounded-lg bg-[var(--color-surface-muted)] p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-[var(--color-fg1)]">
                        {comentario.titulo}
                      </p>
                      {comentario.fuenteIa && <Badge variant="info">IA</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-[var(--color-fg3)]">
                      {comentario.contenido}
                    </p>
                    <p className="mt-2 text-[11px] text-[var(--color-fg4)]">
                      {comentario.creadoPor.nombre} -{" "}
                      {formatFechaHora(comentario.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
