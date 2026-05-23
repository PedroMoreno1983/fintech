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

// Nuevos Imports de Localización y Módulos Premium
import { obtenerTarjetas } from "@/app/actions/controlling";
import { obtenerOperacionesIntercompany } from "@/app/actions/cfo";
import { obtenerValorUF, obtenerValorUSD } from "@/lib/uf";
import { db } from "@/lib/db";
import TarjetasMoss from "@/app/components/cfo/TarjetasMoss";
import IntercompanyLucaNet from "@/app/components/cfo/IntercompanyLucaNet";

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

export default async function CfoPage(props: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const searchParams = await props.searchParams;
  const currentTab = searchParams.tab || "resumen";

  const session = await requireEmpresaSession();
  const dashboard = await getCfoDashboard(session.empresaId);

  // Obtener UF e USD del día
  const hoy = new Date();
  const ufHoy = obtenerValorUF(hoy);
  const usdHoy = obtenerValorUSD(hoy);

  // Consultas adicionales según tab
  let tarjetas: any[] = [];
  let usuarios: any[] = [];
  let sociedades: any[] = [];
  let centrosCosto: any[] = [];
  let consolidacion: any = null;
  let operacionesIntercompany: any[] = [];

  if (currentTab === "consolidacion" || currentTab === "lucanet") {
    [consolidacion, operacionesIntercompany, sociedades] = await Promise.all([
      db.cfoConsolidacion.findFirst({
        where: { empresaId: session.empresaId },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      }),
      obtenerOperacionesIntercompany(),
      db.cfoSociedad.findMany({
        where: { empresaId: session.empresaId, activa: true },
        select: { id: true, codigo: true, razonSocial: true, tipo: true },
        orderBy: { codigo: "asc" },
      }),
    ]);
  }


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
    <div className="mx-auto flex max-w-[1320px] flex-col gap-6 p-5 lg:p-6 text-slate-100">
      {/* Cabecera Premium */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between border-b border-slate-800/60 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[22px] font-bold leading-tight tracking-tight text-slate-100 bg-gradient-to-r from-slate-100 via-slate-300 to-slate-400 bg-clip-text text-transparent">
              Plataforma CFO ConsoliFlow
            </h1>
            <span className="text-[9px] font-bold bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
              LATAM
            </span>
          </div>
          <p className="mt-1 max-w-3xl text-[13px] text-slate-400">
            Consolidación intercompany automática, conciliación multi-entidad en tiempo real y auditoría financiera inteligente.
          </p>
          <p className="mt-2 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-teal-400">
            Periodo activo: {dashboard.periodoActual} -{" "}
            {formatEstado(dashboard.estadoPeriodo)}
          </p>
        </div>


        <div className="flex flex-col sm:flex-row items-end gap-3">
          {/* Mini-ticker dinámico chileno */}
          <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl px-4 py-2 text-[11px] backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
              <span className="text-slate-400">UF Hoy:</span>
              <span className="font-mono font-bold text-slate-200">${ufHoy.toLocaleString("es-CL")}</span>
            </div>
            <div className="h-3 w-px bg-slate-800"></div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-slate-400">USD Hoy:</span>
              <span className="font-mono font-bold text-slate-200">${usdHoy.toLocaleString("es-CL")} CLP</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <GenerarReportesCfoButton />
            <ImportarCfoCsvDialog />
            <PrepararBaseCfoButton
              label={dashboard.isBootstrapped ? "Actualizar base CFO" : "Preparar base CFO"}
            />
          </div>
        </div>
      </div>

      {/* Selector de Pestañas Premium */}
      <div className="flex border-b border-slate-800/80 gap-1.5 -mt-2">
        <Link
          href="?tab=resumen"
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 border-b-2 -mb-[2px] ${
            currentTab === "resumen"
              ? "border-teal-500 text-teal-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Resumen General
        </Link>
        <Link
          href="?tab=consolidacion"
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 border-b-2 -mb-[2px] ${
            currentTab === "consolidacion" || currentTab === "lucanet"
              ? "border-teal-500 text-teal-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Consolidación Intercompany
        </Link>
      </div>


      {/* Contenido condicional */}
      {currentTab === "resumen" && (
        <div className="flex flex-col gap-6">
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

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Kpi
              label="Ingresos"
              value={formatPeso(dashboard.totals.ingresos)}
              delta="4.2%"
              deltaLabel="vs. mes anterior"
              deltaTone="up"
              spark={[15, 18, 14, 21, 26, 24, 29]}
              sparkColor="var(--color-success)"
            />
            <Kpi
              label="EBITDA"
              value={formatPeso(dashboard.totals.ebitda)}
              delta="1.8%"
              deltaLabel="vs. mes anterior"
              deltaTone={dashboard.totals.ebitda >= 0 ? "up" : "down"}
              spark={[8, 11, 7, 13, 15, 12, 18]}
              sparkColor="var(--color-primary)"
            />
            <Kpi
              label="Liquidez"
              value={formatPeso(dashboard.totals.liquidez)}
              delta="0.5%"
              deltaLabel="vs. mes anterior"
              deltaTone={dashboard.totals.liquidez >= 0 ? "up" : "down"}
              spark={[10, 12, 11, 14, 13, 15, 17]}
              sparkColor="var(--color-info)"
            />
            <Kpi
              label="ESG"
              value={dashboard.counts.esgIndicadores}
              delta="2"
              deltaLabel="nuevos KPI"
              deltaTone="up"
              spark={[2, 4, 3, 5, 6, 6, 8]}
              sparkColor="var(--color-warn)"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <Card id="reporting" className="bg-slate-900/40 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Landmark className="h-4 w-4 text-teal-400" />
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
                        className="rounded-lg border border-slate-800 bg-slate-950/40 p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900/60 border border-slate-800">
                              <Icon className="h-4 w-4 text-slate-300" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-200">
                                {item.label}
                              </p>
                              <p className="text-xs text-slate-500">
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

            <Card id="consolidacion" className="bg-slate-900/40 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Scale className="h-4 w-4 text-cyan-400" />
                  Estado financiero consolidado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-teal-950/20 border border-teal-900/50 px-3 py-2.5 text-xs">
                    <p className="text-teal-400 font-semibold mb-0.5">Activos</p>
                    <p className="text-sm font-bold text-slate-200">
                      {formatPeso(dashboard.totals.activos)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-red-950/20 border border-red-900/50 px-3 py-2.5 text-xs">
                    <p className="text-red-400 font-semibold mb-0.5">Pasivos</p>
                    <p className="text-sm font-bold text-slate-200">
                      {formatPeso(dashboard.totals.pasivos)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-blue-950/20 border border-blue-900/50 px-3 py-2.5 text-xs">
                    <p className="text-blue-400 font-semibold mb-0.5">Costos</p>
                    <p className="text-sm font-bold text-slate-200">
                      {formatPeso(dashboard.totals.costos)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-amber-950/20 border border-amber-900/50 px-3 py-2.5 text-xs">
                    <p className="text-amber-400 font-semibold mb-0.5">Gastos</p>
                    <p className="text-sm font-bold text-slate-200">
                      {formatPeso(dashboard.totals.gastos)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CalendarCheck className="h-4 w-4 text-teal-400" />
                    Cierre financiero mensual
                  </CardTitle>
                  <p className="mt-1 text-xs text-slate-500">
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
                  <div className="rounded-lg border border-slate-800 p-3 bg-slate-950/20">
                    <p className="text-xs text-slate-500">Asientos</p>
                    <p className="tnum mt-1 text-lg font-bold text-slate-200">
                      {dashboard.cierre.asientos}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-800 p-3 bg-slate-950/20">
                    <p className="text-xs text-slate-500">Importaciones</p>
                    <p className="tnum mt-1 text-lg font-bold text-slate-200">
                      {dashboard.cierre.importaciones}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-800 p-3 bg-slate-950/20">
                    <p className="text-xs text-slate-500">Reportes</p>
                    <p className="tnum mt-1 text-lg font-bold text-slate-200">
                      {dashboard.cierre.reportes}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-800 p-3 bg-slate-950/20">
                    <p className="text-xs text-slate-500">Aprobaciones</p>
                    <p className="tnum mt-1 text-lg font-bold text-slate-200">
                      {dashboard.cierre.workflowsPendientes}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-950/40 border border-slate-850 p-4 flex flex-col justify-between">
                  {dashboard.cierre.cerradoAt && (
                    <p className="text-xs text-slate-500">
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
                      <p className="text-xs text-slate-400 mt-2">
                        Importa asientos para iniciar el cierre del periodo.
                      </p>
                    )}
                  {dashboard.cierre.estado === "EN_CIERRE" &&
                    !dashboard.cierre.listoParaCerrar && (
                      <p className="text-xs text-slate-400 mt-2">
                        Genera reportes y resuelve aprobaciones pendientes antes de cerrar.
                      </p>
                    )}
                  {dashboard.cierre.estado === "BLOQUEADO" && (
                    <p className="text-xs text-slate-400 mt-2">
                      El periodo esta bloqueado. No se aceptan nuevas importaciones.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="bg-slate-900/40 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4 text-violet-400" />
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
                        className="rounded-lg border border-slate-800 p-3 bg-slate-950/20"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-200">
                              {asiento.descripcion ?? asiento.numero ?? "Asiento contable"}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {asiento.sociedad.codigo} - {asiento.sociedad.razonSocial}
                            </p>
                          </div>
                          <Badge variant="outline">{formatFecha(asiento.fecha)}</Badge>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {asiento.lineas.map((linea) => (
                            <Badge key={linea.id} variant="secondary" className="text-[10px] bg-slate-900 border-slate-800">
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

            <Card className="bg-slate-900/40 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-amber-400" />
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
                        className="rounded-lg border border-slate-800 p-3 bg-slate-950/20"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-200">
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
                        <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
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
            <Card className="bg-slate-900/40 border-slate-800">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileSpreadsheet className="h-4 w-4 text-teal-400" />
                    Importaciones
                  </CardTitle>
                  <ImportarCfoCsvDialog label="Importar" variant="outline" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboard.importaciones.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Sin cargas financieras procesadas.
                  </p>
                ) : (
                  dashboard.importaciones.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg bg-slate-950/40 border border-slate-800 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-200">
                            {item.nombreArchivo ?? item.fuente?.nombre ?? "Importacion CFO"}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
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
                      <p className="mt-2 text-[10px] text-slate-500">
                        {formatFecha(item.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/40 border-slate-800">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileBarChart className="h-4 w-4 text-blue-400" />
                    Reportes
                  </CardTitle>
                  <GenerarReportesCfoButton label="Generar" variant="outline" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboard.reportes.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Sin reportes financieros generados.
                  </p>
                ) : (
                  dashboard.reportes.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg bg-slate-950/40 border border-slate-800 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-200">
                            {item.nombre}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
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
                        <p className="text-[10px] text-slate-500">
                          {formatFecha(item.createdAt)}
                        </p>
                        <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-blue-400 hover:text-blue-300">
                          <Link href={`/cfo/reportes/${item.id}`}>
                            Abrir
                            <ArrowUpRight className="h-3 w-3 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/40 border-slate-800">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <GitMerge className="h-4 w-4 text-cyan-400" />
                    Consolidaciones
                  </CardTitle>
                  <GenerarConsolidacionCfoButton />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboard.consolidaciones.length === 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500">
                      Sin ciclos de consolidacion creados.
                    </p>
                    <GenerarConsolidacionCfoButton label="Crear primera" />
                  </div>
                ) : (
                  dashboard.consolidaciones.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg bg-slate-950/40 border border-slate-800 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-200">
                            {item.periodo.codigo} v{item.version}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
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
                          <p className="text-slate-500 text-[10px]">Liquidez</p>
                          <p className="tnum font-semibold text-slate-300">
                            {formatPeso(getSnapshotNumber(item.snapshot, "liquidez"))}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px]">Ajustes</p>
                          <p className="tnum font-semibold text-slate-300">
                            {item._count.ajustes}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px]">Elimin.</p>
                          <p className="tnum font-semibold text-slate-300">
                            {item._count.eliminaciones}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/40 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <LineChart className="h-4 w-4 text-green-400" />
                  Planificacion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboard.planes.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Sin presupuestos o forecasts aprobados.
                  </p>
                ) : (
                  dashboard.planes.map((item) => (
                    <div key={item.id} className="rounded-lg bg-slate-950/40 border border-slate-800 p-3">
                      <p className="text-sm font-semibold text-slate-200">
                        {item.nombre}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {item.periodo.codigo} - {item.escenario.nombre}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/40 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                  Aprobaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboard.workflows.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No hay aprobaciones financieras pendientes.
                  </p>
                ) : (
                  dashboard.workflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className="rounded-lg bg-slate-950/40 border border-slate-800 p-3"
                    >
                      <p className="text-sm font-semibold text-slate-200">
                        {workflow.entidadTipo}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatEstado(workflow.estado)} - {formatFecha(workflow.solicitadoAt)}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {currentTab === "moss" && (
        <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 shadow-2xl">
          <TarjetasMoss
            tarjetasIniciales={tarjetas}
            usuarios={usuarios}
            sociedades={sociedades}
            centrosCosto={centrosCosto}
          />
        </div>
      )}

      {(currentTab === "consolidacion" || currentTab === "lucanet") && (
        <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 shadow-2xl">
          {consolidacion ? (
            <IntercompanyLucaNet
              consolidacionId={consolidacion.id}
              operacionesIniciales={operacionesIntercompany}
              sociedades={sociedades}
            />
          ) : (
            <div className="text-center py-12 space-y-4">
              <GitMerge className="h-12 w-12 text-slate-600 mx-auto animate-pulse" />
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="font-bold text-base text-slate-200">Ciclo de Consolidación Inactivo</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Para poder visualizar el mapa de deudas intercompany y aplicar asientos de eliminación recíproca de ConsoliFlow,
                  debes primero generar una consolidación en el periodo activo.
                </p>
              </div>
              <GenerarConsolidacionCfoButton label="Generar Consolidación Ahora" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

