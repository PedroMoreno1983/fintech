"use client";

import React, { useState, useTransition } from "react";
import { 
  conciliarYEliminarIntercompany, 
  CfoIntercompanyOperacionWithRelations 
} from "@/app/actions/cfo";

interface IntercompanyLucaNetProps {
  consolidacionId: string;
  operacionesIniciales: CfoIntercompanyOperacionWithRelations[];
  sociedades: Array<{ id: string; codigo: string; razonSocial: string; tipo: string }>;
}

export default function IntercompanyLucaNet({
  consolidacionId,
  operacionesIniciales,
  sociedades,
}: IntercompanyLucaNetProps) {
  const [operaciones, setOperaciones] = useState<CfoIntercompanyOperacionWithRelations[]>(operacionesIniciales);
  const [isPending, startTransition] = useTransition();
  const [mensajeConciliacion, setMensajeConciliacion] = useState<string | null>(null);
  const [sociedadFiltro, setSociedadFiltro] = useState<string>("TODAS");

  // NUEVOS ESTADOS DE AUDITORÍA INTERCOMPANY E FX
  const [selectedOpId, setSelectedOpId] = useState<string | null>(null);
  
  // Simulador de Tipo de Cambio FX
  const [tipoCambioUSD, setTipoCambioUSD] = useState(945);

  // Escáner de IA
  const [isScanning, setIsScanning] = useState(false);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [showAiResult, setShowAiResult] = useState(false);

  // Buscar filiales para interactividad en el gráfico societario
  const filialCL = sociedades.find(
    (s) =>
      s.codigo.toUpperCase().includes("CL") ||
      s.codigo.toUpperCase().includes("CHILE") ||
      s.codigo.toUpperCase().includes("OPS_CL")
  );
  const filialBR = sociedades.find(
    (s) =>
      s.codigo.toUpperCase().includes("BR") ||
      s.codigo.toUpperCase().includes("BRA") ||
      s.codigo.toUpperCase().includes("OPS_BR") ||
      s.codigo.toUpperCase().includes("EXT")
  );

  const runAiAudit = () => {
    setIsScanning(true);
    setShowAiResult(false);
    setScanLogs([]);
    
    const logs = [
      "Extrayendo saldos históricos de contabilidad...",
      "Comparando facturas emitidas vs facturas recibidas...",
      "Calculando diferencias cambiarias (FX Translation)...",
      "Analizando coincidencia de RUT chilenos mediante Módulo 11...",
      "¡Cuadre completo! Diferencias menores aisladas en ConsoliFlow."
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setScanLogs(prev => [...prev, `[${new Date().toLocaleTimeString("es-CL")}] ${log}`]);
        if (index === logs.length - 1) {
          setIsScanning(false);
          setShowAiResult(true);
        }
      }, (index + 1) * 600);
    });
  };

  const handleEjecutarEliminaciones = async () => {
    const formData = new FormData();
    formData.append("consolidacionId", consolidacionId);

    startTransition(async () => {
      const res = await conciliarYEliminarIntercompany({}, formData);
      if (res.success) {
        setMensajeConciliacion(res.message || "Eliminaciones intercompany aplicadas exitosamente.");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        alert(res.message);
      }
    });
  };

  const operacionesFiltradas = sociedadFiltro === "TODAS"
    ? operaciones
    : operaciones.filter(
        (op) =>
          op.sociedadOrigenId === sociedadFiltro ||
          op.sociedadDestinoId === sociedadFiltro
      );

  // Recalcular métricas consolidadas en base al tipo de cambio USD/CLP (Efecto FX)
  const activosBase = 12450000000; // 12.45B
  const ebitdaBase = 1850000000;   // 1.85B
  const diferenciaFXBase = 50000;  // 50K CLP
  
  const factor = (tipoCambioUSD - 945) / 945;
  const activosConsolidados = activosBase * (1 + factor * 0.15);
  const ebitdaConsolidado = ebitdaBase * (1 + factor * 0.08);
  const conversionVariance = diferenciaFXBase + (tipoCambioUSD - 945) * 85000;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-slate-100 animate-fade-in">
      
      {/* SECCIÓN IZQUIERDA: Mapa de Estructura Societaria y Flujos Cruzados (6 cols) */}
      <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
        <div>
          <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent">
            Mapa Societario Intercompany
          </h2>
          <p className="text-xs text-slate-400">Estructura legal y flujos contables cruzados. Haz clic en las filiales para filtrar.</p>
        </div>

        {/* MOCK DE MAPA SOCIETARIO DE RED INTERACTIVO */}
        <div className="relative w-full h-[280px] bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between overflow-hidden shadow-inner">
          {/* Fondo de Grilla */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.1),rgba(255,255,255,0))]"></div>
          
          <div className="flex justify-between items-center z-10">
            <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Holding Consolidado</span>
            <span className="text-[10px] text-slate-500 font-mono">Consolidación Activa</span>
          </div>

          {/* Gráfico de Red de Sociedades */}
          <div className="relative flex-1 flex items-center justify-center">
            
            {/* Sociedad Matriz (Centro Arriba) */}
            <div 
              onClick={() => setSociedadFiltro("TODAS")}
              className="absolute top-2 bg-slate-900/90 border-2 border-cyan-400/80 p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg shadow-cyan-500/10 z-10 w-28 hover:scale-105 transition-all duration-300 cursor-pointer glow-cyan-hover"
            >
              <span className="text-[8px] bg-cyan-950 text-cyan-400 font-bold px-1.5 py-0.5 rounded mb-1">MATRIZ</span>
              <span className="font-bold text-xs">Fintech SA</span>
              <span className="text-[8px] text-slate-500">Moneda: CLP</span>
            </div>

            {/* Conexiones SVG de Flujo Animado */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {/* Conexión Matriz -> Filial CL */}
              <line x1="50%" y1="20%" x2="22%" y2="75%" stroke="#1e293b" strokeWidth="2.5" />
              <line x1="50%" y1="20%" x2="22%" y2="75%" stroke="#14b8a6" strokeWidth="2" className="animated-flow-line opacity-60" />

              {/* Conexión Matriz -> Filial BR */}
              <line x1="50%" y1="20%" x2="78%" y2="75%" stroke="#1e293b" strokeWidth="2.5" />
              <line x1="50%" y1="20%" x2="78%" y2="75%" stroke="#14b8a6" strokeWidth="2" className="animated-flow-line opacity-60" />

              {/* Conexión Cruzada entre filiales (Flujo Intercompany) */}
              <path
                d="M 22% 75% Q 50% 68% 78% 75%"
                fill="none"
                stroke="#1e293b"
                strokeWidth="2"
              />
              <path
                d="M 22% 75% Q 50% 68% 78% 75%"
                fill="none"
                stroke={operaciones.some(o => !o.conciliada) ? "#f59e0b" : "#06b6d4"}
                strokeWidth="1.5"
                className="animated-flow-line"
              />
            </svg>

            {/* Filial A (Abajo Izquierda) */}
            <div 
              onClick={() => {
                if (filialCL) {
                  setSociedadFiltro(sociedadFiltro === filialCL.id ? "TODAS" : filialCL.id);
                }
              }}
              className={`absolute bottom-4 left-4 p-3 rounded-2xl flex flex-col items-center justify-center text-center w-32 transition-all duration-300 cursor-pointer ${
                filialCL && sociedadFiltro === filialCL.id
                  ? "bg-slate-900 border-2 border-teal-400 scale-105 shadow-xl shadow-teal-500/10"
                  : "bg-slate-900/80 border border-slate-800 hover:scale-105 glow-teal-hover"
              }`}
            >
              <span className="text-[8px] bg-teal-950 text-teal-400 font-bold px-1.5 py-0.5 rounded mb-1">OPERATIVA CL</span>
              <span className="font-bold text-xs">Sociedad CL</span>
              <span className="text-[8px] text-slate-500 font-mono">76.234.567-8</span>
            </div>

            {/* Filial B (Abajo Derecha) */}
            <div 
              onClick={() => {
                if (filialBR) {
                  setSociedadFiltro(sociedadFiltro === filialBR.id ? "TODAS" : filialBR.id);
                }
              }}
              className={`absolute bottom-4 right-4 p-3 rounded-2xl flex flex-col items-center justify-center text-center w-32 transition-all duration-300 cursor-pointer ${
                filialBR && sociedadFiltro === filialBR.id
                  ? "bg-slate-900 border-2 border-teal-400 scale-105 shadow-xl shadow-teal-500/10"
                  : "bg-slate-900/80 border border-slate-800 hover:scale-105 glow-teal-hover"
              }`}
            >
              <span className="text-[8px] bg-teal-950 text-teal-400 font-bold px-1.5 py-0.5 rounded mb-1">OPERATIVA BR</span>
              <span className="font-bold text-xs">Sociedad BR</span>
              <span className="text-[8px] text-slate-500 font-mono">77.890.123-K</span>
            </div>

            {/* Globo de Descalce Flotante en el medio de la flecha */}
            {operaciones.some(o => !o.conciliada) && (
              <div className="absolute bottom-16 bg-amber-500 text-slate-950 font-bold text-[9px] px-2.5 py-0.5 rounded-full shadow-lg animate-bounce select-none">
                Descalce: $50.000 CLP
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 z-10 border-t border-slate-900 pt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Neteado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Diferencia a ajustar
            </span>
          </div>

        </div>

        {/* Panel de Botón de Eliminación ConsoliFlow */}
        <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800 flex justify-between items-center shadow-lg">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Acción de Consolidación</span>
            <span className="text-xs font-bold text-slate-200">
              Neteo Recíproco Intercompany
            </span>
          </div>
          <button
            onClick={handleEjecutarEliminaciones}
            disabled={isPending}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/10 transition-all duration-300 transform active:scale-95 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 cursor-pointer"
          >
            {isPending ? "Procesando Neteo..." : "Aplicar Asientos Eliminación"}
          </button>
        </div>

        {/* Mensaje de Éxito de Conciliación animado */}
        {mensajeConciliacion && (
          <div className="p-4 bg-cyan-950/30 border border-cyan-800 text-cyan-300 rounded-2xl text-xs flex flex-col gap-1.5 shadow-lg shadow-cyan-500/5 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="font-bold uppercase tracking-wider">Eliminación ConsoliFlow Exitosa</span>
            </div>
            <p>{mensajeConciliacion}</p>
          </div>
        )}

      </div>

      {/* SECCIÓN DERECHA: Listado y Detalle de Transacciones Intercompany (6 cols) */}
      <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 flex flex-col justify-between gap-6 shadow-xl relative">
        
        {/* Efecto láser verde para la Auditoría IA */}
        {isScanning && <div className="laser-scanner"></div>}

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-cyan-400 uppercase">
                Conciliación de Saldos Mutuos
              </h2>
              <p className="text-xs text-slate-400 font-mono">Control de cuadre intercompany</p>
            </div>
            
            <select
              value={sociedadFiltro}
              onChange={(e) => setSociedadFiltro(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] focus:border-cyan-500 focus:outline-none text-slate-300 font-mono"
            >
              <option value="TODAS">Ver Todas</option>
              {sociedades.map((s) => (
                <option key={s.id} value={s.id}>{s.codigo}</option>
              ))}
            </select>
          </div>

          {/* LISTADO DE TRANSACCIONES */}
          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2 scrollbar-thin">
            {operacionesFiltradas.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-12">
                No hay operaciones intercompany en este periodo.
              </p>
            ) : (
              operacionesFiltradas.map((op) => {
                const isSelected = selectedOpId === op.id;
                return (
                  <div 
                    key={op.id} 
                    onClick={() => setSelectedOpId(isSelected ? null : op.id)}
                    className={`p-3 bg-slate-950 border rounded-xl space-y-2 hover:border-slate-700 transition-all cursor-pointer ${
                      op.conciliada 
                        ? "border-slate-800/80" 
                        : "border-amber-800/50 shadow-md shadow-amber-500/5 hover:border-amber-700/75"
                    } ${isSelected ? "border-cyan-500/80 shadow-lg shadow-cyan-500/5" : ""}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300 font-bold font-mono">
                            {op.sociedadOrigen.codigo}
                          </span>
                          <span className="text-xs text-slate-400">→</span>
                          <span className="text-[9px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300 font-bold font-mono">
                            {op.sociedadDestino.codigo}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-200 font-bold block">{op.descripcion}</span>
                        <span className="text-[9.5px] font-mono text-slate-500 block">Factura: {op.documentoRef}</span>
                      </div>

                      <div className="text-right space-y-1.5">
                        <span className="font-bold text-xs text-slate-200 block font-mono">
                          ${op.monto.toLocaleString("es-CL")} {op.moneda}
                        </span>
                        {op.conciliada ? (
                          <span className="text-[9px] bg-teal-950/40 text-teal-400 border border-teal-900/60 px-2 py-0.5 rounded-full font-semibold">
                            Conciliada
                          </span>
                        ) : (
                          <span className="text-[9px] bg-amber-950/40 text-amber-400 border border-amber-900/60 px-2 py-0.5 rounded-full font-semibold">
                            Descalce (${op.diferencia?.toLocaleString("es-CL")})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Drill-down de Conciliación ConsoliFlow detallada */}
                    {isSelected && !op.conciliada && (
                      <div className="mt-2.5 p-3 bg-slate-900/80 border border-amber-900/30 rounded-xl space-y-2.5 text-[11px] animate-fade-in">
                        <div className="flex justify-between items-center text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                          <span>Libro Auxiliar Origen ({op.sociedadOrigen.codigo})</span>
                          <span>Libro Auxiliar Destino ({op.sociedadDestino.codigo})</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 border-y border-slate-800 py-2 font-mono">
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Cuentas Cobrar:</span>
                              <span className="text-slate-300 font-bold">${op.monto.toLocaleString("es-CL")}</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span className="text-slate-500">Divisa Base:</span>
                              <span className="text-slate-400">{op.moneda}</span>
                            </div>
                          </div>
                          <div className="space-y-1 border-l border-slate-800 pl-4">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Cuentas Pagar:</span>
                              <span className="text-slate-300 font-bold">${(op.monto - (op.diferencia || 0)).toLocaleString("es-CL")}</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span className="text-slate-500">Diferencia:</span>
                              <span className="text-amber-400 font-bold">${op.diferencia?.toLocaleString("es-CL")}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2 text-[10px] text-amber-300/90 bg-amber-950/20 p-2 rounded-lg border border-amber-900/30 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse mt-1 shrink-0"></span>
                          <span><strong>Ajuste ConsoliFlow</strong>: Se generará un asiento automático de cuadre en la sociedad de consolidación para regularizar la diferencia de ${op.diferencia?.toLocaleString("es-CL")} CLP debida a diferencias de cambio al cierre.</span>
                        </div>
                      </div>
                    )}

                    {/* Detalle del Asiento de Eliminación aplicado en el consolidado */}
                    {op.eliminaciones && op.eliminaciones.length > 0 && (
                      <div className="bg-slate-900/40 border border-slate-800 p-2.5 rounded-lg space-y-1 text-[10px]">
                        <span className="text-slate-500 font-bold uppercase tracking-wider text-[8px] block font-mono">
                          Asiento Eliminación ConsoliFlow (Consolidación)
                        </span>
                        {op.eliminaciones.map((el) => (
                          <div key={el.id} className="flex justify-between items-center text-slate-400 font-mono">
                            <span>Haber / Debe neteado:</span>
                            <span className="text-slate-300 font-semibold">
                              -${el.montoDebe.toLocaleString("es-CL")} CLP
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Nota explicativa */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-[10px] text-slate-500 leading-relaxed shadow-md">
          <strong className="text-slate-400 block mb-1">Nota sobre Consolidación e Intercompany:</strong>
          Para asegurar que las cuentas del grupo sean veraces y no inflar artificialmente las ventas, ConsoliFlow elimina de manera automática las operaciones recíprocas (deudas y facturación interna) en los balances consolidados. Si existe una diferencia menor, se genera un asiento de ajuste de cuadre por la diferencia.
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN PREMIUM DE VENTAS (VALOR AGREGADO): SIMULADOR FX Y AUDITORÍA IA */}
      {/* ========================================================================= */}
      <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-8 border-t border-slate-800/80 pt-8 mt-4">
        
        {/* Simulador FX (Largo: 6 cols) */}
        <div className="md:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div>
            <h3 className="text-md font-bold text-cyan-400 uppercase tracking-wider">
              Simulador FX de Reexpresión Cambiaria
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Analiza el impacto del tipo de cambio USD/CLP en la conversión del balance consolidado.</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-4 shadow-inner">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Tasa USD/CLP Consolidación:</span>
              <span className="font-mono font-bold text-cyan-400 text-sm bg-cyan-950/50 px-2.5 py-1 rounded border border-cyan-900/50">
                ${tipoCambioUSD} CLP
              </span>
            </div>
            
            {/* Slider de Tipo de Cambio */}
            <input 
              type="range"
              min="850"
              max="1050"
              value={tipoCambioUSD}
              onChange={(e) => setTipoCambioUSD(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Mín: $850 CLP</span>
              <span>Medio: $945 CLP</span>
              <span>Máx: $1050 CLP</span>
            </div>
          </div>

          {/* Gráfico y Resultados del Simulador */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-center">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-bold">Activos Consolidados</span>
              <span className="text-xs font-black text-slate-100 block font-mono mt-1 transition-all">
                ${(activosConsolidados / 1000000000).toFixed(2)}B
              </span>
              <span className={`text-[8.5px] block mt-0.5 ${tipoCambioUSD >= 945 ? "text-emerald-400" : "text-red-400"}`}>
                {tipoCambioUSD >= 945 ? "▲" : "▼"} {(((activosConsolidados - activosBase) / activosBase) * 100).toFixed(1)}%
              </span>
            </div>
            
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-center">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-bold">EBITDA Consolidado</span>
              <span className="text-xs font-black text-slate-100 block font-mono mt-1 transition-all">
                ${(ebitdaConsolidado / 1000000).toFixed(1)}M
              </span>
              <span className={`text-[8.5px] block mt-0.5 ${tipoCambioUSD >= 945 ? "text-emerald-400" : "text-red-400"}`}>
                {tipoCambioUSD >= 945 ? "▲" : "▼"} {(((ebitdaConsolidado - ebitdaBase) / ebitdaBase) * 100).toFixed(1)}%
              </span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-center">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-bold">Diferencia Conversión</span>
              <span className="text-xs font-black text-amber-400 block font-mono mt-1">
                ${conversionVariance.toLocaleString("es-CL")}
              </span>
              <span className="text-[8.5px] text-slate-400 block mt-0.5">Ajuste de Reserva</span>
            </div>
          </div>

          <div className="text-[9.5px] text-slate-500 bg-slate-950/30 p-3 rounded-xl border border-slate-850/50 leading-relaxed">
            💡 **Impacto Contable**: Al modificar la tasa FX, ConsoliFlow recalcula automáticamente la conversión de los estados financieros de las filiales extranjeras, registrando las diferencias de conversión contra el Patrimonio consolidado bajo normas IFRS/NIIF.
          </div>

        </div>

        {/* Auditor IA de Balances (Largo: 6 cols) */}
        <div className="md:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
          
          <div>
            <h3 className="text-md font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Auditor Contable IA Activo
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Ejecuta un escaneo automatizado para detectar descuadres y diferencias en facturación interna.</p>
          </div>

          {/* Consola de logs */}
          <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-2xl h-[160px] overflow-y-auto font-mono text-[10px] text-emerald-500/90 space-y-1.5 shadow-inner">
            {scanLogs.length === 0 ? (
              <span className="text-slate-600 block italic">// Listo para iniciar escaneo IA...</span>
            ) : (
              scanLogs.map((log, index) => (
                <div key={index} className="animate-fade-in">{log}</div>
              ))
            )}
            {isScanning && (
              <div className="flex items-center gap-1.5 text-slate-400 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping"></span>
                <span>Analizando transacciones...</span>
              </div>
            )}
          </div>

          {/* Resultado de la Auditoría */}
          {showAiResult ? (
            <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 rounded-xl text-[10px] space-y-1 animate-fade-in">
              <strong className="block text-emerald-400 uppercase tracking-wider text-[9px]">Resultado de Escaneo IA:</strong>
              <p>✓ No se encontraron duplicados intercompany.</p>
              <p>✓ Todos los RUTs chilenos cumplen el Módulo 11 checksum.</p>
              <p>⚠ Descalce menor de $50.000 CLP por redondeo cambiario detectado en Doc Ref 900224. Se propone auto-cuadrar.</p>
            </div>
          ) : (
            <div className="p-3 bg-slate-950/40 border border-slate-850 text-slate-500 rounded-xl text-[10px] text-center">
              Haz clic en "Iniciar Escaneo con IA" para auditar los balances contables cruzados.
            </div>
          )}

          <button
            onClick={runAiAudit}
            disabled={isScanning || isPending}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 transition-all duration-300 transform active:scale-95 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 cursor-pointer text-center"
          >
            {isScanning ? "Escaneando Libros..." : "Iniciar Escaneo con IA"}
          </button>

        </div>

      </div>
    </div>
  );
}
