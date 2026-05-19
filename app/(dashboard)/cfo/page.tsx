import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarCheck,
  ClipboardCheck,
  FileBarChart,
  FileSpreadsheet,
  GitMerge,
  Landmark,
  LineChart,
  Scale,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { EmptyState } from "@/app/components/ui/empty-state";
import { GenerarConsolidacionCfoButton } from "@/app/components/cfo/generar-consolidacion-cfo-button";
import { GenerarReportesCfoButton } from "@/app/components/cfo/generar-reportes-cfo-button";
import { ImportarCfoCsvDialog } from "@/app/components/cfo/importar-cfo-csv-dialog";
import { Kpi } from "@/app/components/ui/kpi";
import { PeriodoCierreActions } from "@/app/components/cfo/periodo-cierre-actions";
import { PrepararBaseCfoButton } from "@/app/components/cfo/preparar-base-cfo-button";
import { getCfoDashboard } from "@/lib/cfo";
import { requireEmpresaSession } from "@/lib/session";
import { formatFecha, formatPeso } from "@/lib/utils";

function formatEstado(value: string) {
  return value.replace(/_/g, " ").toLowerCase();
}

function getHealthBadge(value: number) {
  if (value > 0) return "success";
  return "warning";
}

function getSnapshotNumber(data: unknown, key: string) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const totals = (data as Record<string, unknown>).totales;
  if (!totals || typeof totals !== "object" || Array.isArray(totals)) return null;
  const value = (totals as Record<string, unknown>)[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export default async function CfoPage() {
  const session = await requireEmpresaSession();
  const dashboard = await getCfoDashboard(session.empresaId);

  const structureItems = [
    {
      label: "Sociedades",
      value: dashboard.counts.sociedades,
      icon: Building2,
      detail: "estructura legal",
    },
    {
      label: "Cuentas",
      value: dashboard.counts.cuentas,
      icon: FileSpreadsheet,
      detail: "plan contable",
    },
    {
      label: "Periodos",
      value: dashboard.counts.periodos,
      icon: ClipboardCheck,
      detail: "cierre y bloqueo",
    },
    {
      label: "Fuentes",
      value: dashboard.counts.fuentes,
      icon: GitMerge,
      detail: "contabilidad, bancos, Excel",
    },
  ];

  return (
    <div className="mx-auto flex max-w-[1320px] flex-col gap-4 p-5 lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-[var(--color-fg1)]">
            CFO Platform
          </h1>
          <p className="mt-1 max-w-3xl text-[13px] text-[var(--color-fg3)]">
            Consolidacion, planificacion, reporting financiero, auditoria e
            inteligencia CFO sobre la operacion financiera.
          </p>
          <p className="mt-2 text-[10.5px] font-medium uppercase tracking-[0.06em] text-[var(--color-fg4)]">
            Periodo activo: {dashboard.periodoActual} -{" "}
            {formatEstado(dashboard.estadoPeriodo)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <GenerarReportesCfoButton />
          <ImportarCfoCsvDialog />
          <PrepararBaseCfoButton
            label={dashboard.isBootstrapped ? "Actualizar base CFO" : "Preparar base CFO"}
          />
        </div>
      </div>

      {!dashboard.isBootstrapped && (
        <Card className="border-[var(--color-warn)]/30 bg-[var(--color-warn-soft)]/25">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--color-fg1)]">
                Falta preparar la estructura financiera base
              </p>
              <p className="mt-1 text-sm text-[var(--color-fg3)]">
                Esto crea sociedad matriz, periodo actual, fuente manual, plan
                de cuentas inicial y escenario de presupuesto.
              </p>
            </div>
            <PrepararBaseCfoButton />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          label="Ingresos"
          value={formatPeso(dashboard.totals.ingresos)}
          deltaLabel="periodo"
          deltaTone="up"
          sparkColor="oklch(0.55 0.10 152)"
        />
        <Kpi
          label="EBITDA"
          value={formatPeso(dashboard.totals.ebitda)}
          deltaLabel="gestion"
          deltaTone={dashboard.totals.ebitda >= 0 ? "up" : "down"}
          sparkColor="oklch(0.55 0.10 220)"
        />
        <Kpi
          label="Liquidez"
          value={formatPeso(dashboard.totals.liquidez)}
          deltaLabel="activos - pasivos"
          deltaTone={dashboard.totals.liquidez >= 0 ? "up" : "down"}
          sparkColor="oklch(0.55 0.10 190)"
        />
        <Kpi
          label="ESG"
          value={dashboard.counts.esgIndicadores}
          deltaLabel="indicadores"
          sparkColor="oklch(0.55 0.10 120)"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card id="reporting">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Landmark className="h-4 w-4 text-[var(--color-primary)]" />
              Estructura CFO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {structureItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--color-surface)]">
                          <Icon className="h-4 w-4 text-[var(--color-fg2)]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--color-fg1)]">
                            {item.label}
                          </p>
                          <p className="text-xs text-[var(--color-fg3)]">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getHealthBadge(item.value)}>
                        {item.value}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card id="consolidacion">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Scale className="h-4 w-4 text-blue-600" />
              Estado financiero
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-green-50 px-3 py-2 text-xs">
                <p className="text-green-700">Activos</p>
                <p className="text-sm font-semibold text-green-950">
                  {formatPeso(dashboard.totals.activos)}
                </p>
              </div>
              <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs">
                <p className="text-rose-700">Pasivos</p>
                <p className="text-sm font-semibold text-rose-950">
                  {formatPeso(dashboard.totals.pasivos)}
                </p>
              </div>
              <div className="rounded-lg bg-sky-50 px-3 py-2 text-xs">
                <p className="text-sky-700">Costos</p>
                <p className="text-sm font-semibold text-sky-950">
                  {formatPeso(dashboard.totals.costos)}
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs">
                <p className="text-amber-700">Gastos</p>
                <p className="text-sm font-semibold text-amber-950">
                  {formatPeso(dashboard.totals.gastos)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarCheck className="h-4 w-4 text-emerald-600" />
                Cierre financiero mensual
              </CardTitle>
              <p className="mt-1 text-xs text-[var(--color-fg3)]">
                Periodo {dashboard.cierre.periodoCodigo} -{" "}
                {formatEstado(dashboard.cierre.estado)}
              </p>
            </div>
            <Badge
              variant={
                dashboard.cierre.estado === "CERRADO" ||
                dashboard.cierre.estado === "BLOQUEADO"
                  ? "success"
                  : dashboard.cierre.estado === "EN_CIERRE"
                    ? "warning"
                    : "info"
              }
            >
              {dashboard.cierre.estado === "BLOQUEADO"
                ? "bloqueado"
                : formatEstado(dashboard.cierre.estado)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-[var(--color-border)] p-3">
                <p className="text-xs text-[var(--color-fg3)]">Asientos</p>
                <p className="tnum mt-1 text-lg font-semibold text-[var(--color-fg1)]">
                  {dashboard.cierre.asientos}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--color-border)] p-3">
                <p className="text-xs text-[var(--color-fg3)]">Importaciones</p>
                <p className="tnum mt-1 text-lg font-semibold text-[var(--color-fg1)]">
                  {dashboard.cierre.importaciones}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--color-border)] p-3">
                <p className="text-xs text-[var(--color-fg3)]">Reportes</p>
                <p className="tnum mt-1 text-lg font-semibold text-[var(--color-fg1)]">
                  {dashboard.cierre.reportes}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--color-border)] p-3">
                <p className="text-xs text-[var(--color-fg3)]">Aprobaciones</p>
                <p className="tnum mt-1 text-lg font-semibold text-[var(--color-fg1)]">
                  {dashboard.cierre.workflowsPendientes}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-[var(--color-surface-muted)] p-4">
              {dashboard.cierre.cerradoAt && (
                <p className="mb-3 text-xs text-[var(--color-fg3)]">
                  Cerrado por {dashboard.cierre.cerradoPor ?? "usuario"} el{" "}
                  {formatFecha(dashboard.cierre.cerradoAt)}
                </p>
              )}
              <PeriodoCierreActions
                estado={dashboard.cierre.estado}
                listoParaIniciar={dashboard.cierre.listoParaIniciar}
                listoParaCerrar={dashboard.cierre.listoParaCerrar}
              />
              {dashboard.cierre.estado === "ABIERTO" &&
                !dashboard.cierre.listoParaIniciar && (
                  <p className="text-sm text-[var(--color-fg3)]">
                    Importa asientos para iniciar el cierre del periodo.
                  </p>
                )}
              {dashboard.cierre.estado === "EN_CIERRE" &&
                !dashboard.cierre.listoParaCerrar && (
                  <p className="text-sm text-[var(--color-fg3)]">
                    Genera reportes y resuelve aprobaciones pendientes antes de cerrar.
                  </p>
                )}
              {dashboard.cierre.estado === "BLOQUEADO" && (
                <p className="text-sm text-[var(--color-fg3)]">
                  El periodo esta bloqueado. No se aceptan nuevas importaciones.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card id="planificacion">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-violet-600" />
              Asientos recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard.recentAsientos.length === 0 ? (
              <EmptyState
                icon={FileSpreadsheet}
                title="Sin asientos CFO todavia"
                description="Cuando entren saldos contables o importaciones, el tablero mostrara aqui los ultimos movimientos auditables."
                className="py-6"
              />
            ) : (
              <div className="space-y-3">
                {dashboard.recentAsientos.map((asiento) => (
                  <div
                    key={asiento.id}
                    className="rounded-lg border border-[var(--color-border)] p-3"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-[var(--color-fg1)]">
                          {asiento.descripcion ?? asiento.numero ?? "Asiento contable"}
                        </p>
                        <p className="text-xs text-[var(--color-fg3)]">
                          {asiento.sociedad.codigo} - {asiento.sociedad.razonSocial}
                        </p>
                      </div>
                      <Badge variant="outline">{formatFecha(asiento.fecha)}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {asiento.lineas.map((linea) => (
                        <Badge key={linea.id} variant="secondary">
                          {linea.cuenta.codigo} {linea.cuenta.nombre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-amber-600" />
              Copiloto CFO
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard.insights.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="Sin insights financieros"
                description="La capa CFO ya tiene espacio para desviaciones, anomalias, riesgos de caja y comentarios ejecutivos generados por IA."
                className="py-6"
              />
            ) : (
              <div className="space-y-3">
                {dashboard.insights.map((insight) => (
                  <div
                    key={insight.id}
                    className="rounded-lg border border-[var(--color-border)] p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-[var(--color-fg1)]">
                        {insight.titulo}
                      </p>
                      <Badge
                        variant={
                          insight.severidad === "CRITICAL"
                            ? "destructive"
                            : insight.severidad === "WARNING"
                              ? "warning"
                              : "info"
                        }
                      >
                        {insight.severidad}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-[var(--color-fg3)]">
                      {insight.descripcion}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                Importaciones
              </CardTitle>
              <ImportarCfoCsvDialog label="Importar" variant="outline" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.importaciones.length === 0 ? (
              <p className="text-sm text-[var(--color-fg3)]">
                Sin cargas financieras procesadas.
              </p>
            ) : (
              dashboard.importaciones.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg bg-[var(--color-surface-muted)] p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--color-fg1)]">
                        {item.nombreArchivo ?? item.fuente?.nombre ?? "Importacion CFO"}
                      </p>
                      <p className="text-xs text-[var(--color-fg3)]">
                        {item.periodo?.codigo ?? "sin periodo"} - {item.filasValidas}/
                        {item.filasTotales} filas
                      </p>
                    </div>
                    <Badge
                      variant={
                        item.estado === "PROCESADA"
                          ? "success"
                          : item.estado === "CON_ERRORES"
                            ? "destructive"
                            : "warning"
                      }
                    >
                      {formatEstado(item.estado)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-[var(--color-fg4)]">
                    {formatFecha(item.createdAt)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileBarChart className="h-4 w-4 text-blue-600" />
                Reportes
              </CardTitle>
              <GenerarReportesCfoButton label="Generar" variant="outline" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.reportes.length === 0 ? (
              <p className="text-sm text-[var(--color-fg3)]">
                Sin reportes financieros generados.
              </p>
            ) : (
              dashboard.reportes.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg bg-[var(--color-surface-muted)] p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--color-fg1)]">
                        {item.nombre}
                      </p>
                      <p className="text-xs text-[var(--color-fg3)]">
                        {formatEstado(item.tipo)} - {item.periodo.codigo} - v
                        {item.version}
                      </p>
                    </div>
                    <Badge
                      variant={
                        item.estado === "APROBADO" || item.estado === "PUBLICADO"
                          ? "success"
                          : item.estado === "BORRADOR"
                            ? "secondary"
                            : "info"
                      }
                    >
                      {item._count.lineas} lineas
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-[11px] text-[var(--color-fg4)]">
                      {formatFecha(item.createdAt)}
                    </p>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/cfo/reportes/${item.id}`}>
                        Abrir
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <GitMerge className="h-4 w-4 text-cyan-600" />
                Consolidaciones
              </CardTitle>
              <GenerarConsolidacionCfoButton />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.consolidaciones.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-[var(--color-fg3)]">
                  Sin ciclos de consolidacion creados.
                </p>
                <GenerarConsolidacionCfoButton label="Crear primera" />
              </div>
            ) : (
              dashboard.consolidaciones.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg bg-[var(--color-surface-muted)] p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-fg1)]">
                        {item.periodo.codigo} v{item.version}
                      </p>
                      <p className="text-xs text-[var(--color-fg3)]">
                        {item.sociedadMatriz
                          ? `${item.sociedadMatriz.codigo} - ${item.sociedadMatriz.razonSocial}`
                          : "sin matriz definida"}
                      </p>
                    </div>
                    <Badge
                      variant={
                        item.estado === "APROBADA" || item.estado === "CERRADA"
                          ? "success"
                          : item.estado === "EN_REVISION"
                            ? "warning"
                            : "secondary"
                      }
                    >
                      {formatEstado(item.estado)}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-[var(--color-fg4)]">Liquidez</p>
                      <p className="tnum font-medium text-[var(--color-fg1)]">
                        {formatPeso(getSnapshotNumber(item.snapshot, "liquidez"))}
                      </p>
                    </div>
                    <div>
                      <p className="text-[var(--color-fg4)]">Ajustes</p>
                      <p className="tnum font-medium text-[var(--color-fg1)]">
                        {item._count.ajustes}
                      </p>
                    </div>
                    <div>
                      <p className="text-[var(--color-fg4)]">Elimin.</p>
                      <p className="tnum font-medium text-[var(--color-fg1)]">
                        {item._count.eliminaciones}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <LineChart className="h-4 w-4 text-green-600" />
              Planificacion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.planes.length === 0 ? (
              <p className="text-sm text-[var(--color-fg3)]">
                Sin presupuestos o forecasts aprobados.
              </p>
            ) : (
              dashboard.planes.map((item) => (
                <div key={item.id} className="rounded-lg bg-[var(--color-surface-muted)] p-3">
                  <p className="text-sm font-medium text-[var(--color-fg1)]">
                    {item.nombre}
                  </p>
                  <p className="text-xs text-[var(--color-fg3)]">
                    {item.periodo.codigo} - {item.escenario.nombre}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Aprobaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.workflows.length === 0 ? (
              <p className="text-sm text-[var(--color-fg3)]">
                No hay aprobaciones financieras pendientes.
              </p>
            ) : (
              dashboard.workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="rounded-lg bg-[var(--color-surface-muted)] p-3"
                >
                  <p className="text-sm font-medium text-[var(--color-fg1)]">
                    {workflow.entidadTipo}
                  </p>
                  <p className="text-xs text-[var(--color-fg3)]">
                    {formatEstado(workflow.estado)} - {formatFecha(workflow.solicitadoAt)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
