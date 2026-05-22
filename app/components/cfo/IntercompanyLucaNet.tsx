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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-slate-100">
      
      {/* SECCIÓN IZQUIERDA: Mapa de Estructura Societaria y Flujos Cruzados (6 cols) */}
      <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Mapa Societario Intercompany
          </h2>
          <p className="text-xs text-slate-400">Estructura del grupo y flujos contables internos. Inspirado en LucaNet.</p>
        </div>

        {/* MOCK DE MAPA SOCIETARIO DE RED INTERACTIVO */}
        <div className="relative w-full h-[280px] bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between overflow-hidden">
          {/* Fondo de Grilla */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.1),rgba(255,255,255,0))]"></div>
          
          <div className="flex justify-between items-center z-10">
            <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Holding Consolidado</span>
            <span className="text-[10px] text-slate-500">2026.05 Activo</span>
          </div>

          {/* Gráfico de Red de Sociedades */}
          <div className="relative flex-1 flex items-center justify-center">
            
            {/* Sociedad Matriz (Centro Arriba) */}
            <div className="absolute top-4 bg-slate-900 border-2 border-cyan-400/80 p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg shadow-cyan-500/10 z-10 w-24">
              <span className="text-[9px] bg-cyan-950 text-cyan-400 font-bold px-1.5 py-0.5 rounded mb-1">MATRIZ</span>
              <span className="font-bold text-xs">Fintech SA</span>
              <span className="text-[8px] text-slate-500">Moneda: CLP</span>
            </div>

            {/* Conexión Izquierda (Matriz a Filial A) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line x1="50%" y1="25%" x2="25%" y2="70%" stroke="#1e293b" strokeWidth="2" />
              <line x1="50%" y1="25%" x2="75%" y2="70%" stroke="#1e293b" strokeWidth="2" />
              {/* Conexión Cruzada entre filiales (Flujo Intercompany) */}
              <path
                d="M 25% 70% Q 50% 65% 75% 70%"
                fill="none"
                stroke={operaciones.some(o => !o.conciliada) ? "#f59e0b" : "#06b6d4"}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className="animate-pulse"
              />
            </svg>

            {/* Filial A (Abajo Izquierda) */}
            <div className="absolute bottom-4 left-6 bg-slate-900 border border-slate-800 p-3 rounded-2xl flex flex-col items-center justify-center text-center w-28">
              <span className="text-[9px] bg-slate-800 text-slate-400 font-bold px-1.5 py-0.5 rounded mb-1">OPERATIVA CL</span>
              <span className="font-bold text-xs">Sociedad CL</span>
              <span className="text-[8px] text-slate-500">RUT: 76.234.567-8</span>
            </div>

            {/* Filial B (Abajo Derecha) */}
            <div className="absolute bottom-4 right-6 bg-slate-900 border border-slate-800 p-3 rounded-2xl flex flex-col items-center justify-center text-center w-28">
              <span className="text-[9px] bg-slate-800 text-slate-400 font-bold px-1.5 py-0.5 rounded mb-1">OPERATIVA BR</span>
              <span className="font-bold text-xs">Sociedad BR</span>
              <span className="text-[8px] text-slate-500">RUT: 77.890.123-K</span>
            </div>

            {/* Globo de Descalce Flotante en el medio de la flecha */}
            {operaciones.some(o => !o.conciliada) && (
              <div className="absolute bottom-16 bg-amber-500 text-slate-950 font-bold text-[9px] px-2 py-0.5 rounded-full shadow-md animate-bounce">
                Descalce: $50.000 CLP
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 z-10">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Neteado
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Descalce en revisión
            </span>
          </div>

        </div>

        {/* Panel de Botón de Eliminación LucaNet */}
        <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 block">Acción de Cierre Consolidado</span>
            <span className="text-xs font-bold text-slate-200">
              Eliminar Transacciones Internas Neteadas
            </span>
          </div>
          <button
            onClick={handleEjecutarEliminaciones}
            disabled={isPending}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/10 transition-all duration-300 transform active:scale-95 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600"
          >
            {isPending ? "Procesando LucaNet..." : "Aplicar Asientos Eliminación"}
          </button>
        </div>

        {/* Mensaje de Éxito de Conciliación animado */}
        {mensajeConciliacion && (
          <div className="p-4 bg-cyan-950/30 border border-cyan-800 text-cyan-300 rounded-2xl text-xs flex flex-col gap-1.5 shadow-lg shadow-cyan-500/5 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="font-bold uppercase tracking-wider">Eliminación LucaNet Exitosa</span>
            </div>
            <p>{mensajeConciliacion}</p>
          </div>
        )}

      </div>

      {/* SECCIÓN DERECHA: Listado y Detalle de Transacciones Intercompany (6 cols) */}
      <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 flex flex-col justify-between gap-6">
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
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] focus:border-cyan-500 focus:outline-none text-slate-300"
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
              operacionesFiltradas.map((op) => (
                <div 
                  key={op.id} 
                  className={`p-3 bg-slate-950 border rounded-xl space-y-2 hover:border-slate-700 transition-all ${
                    op.conciliada 
                      ? "border-slate-800/80" 
                      : "border-amber-800/40 shadow-sm shadow-amber-500/5"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300 font-bold">
                          {op.sociedadOrigen.codigo}
                        </span>
                        <span className="text-xs text-slate-400">→</span>
                        <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300 font-bold">
                          {op.sociedadDestino.codigo}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold block">{op.descripcion}</span>
                      <span className="text-[9px] font-mono text-slate-500 block">Doc ref: {op.documentoRef}</span>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="font-bold text-xs text-slate-200 block">
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

                  {/* Detalle del Asiento de Eliminación aplicado en el consolidado */}
                  {op.eliminaciones && op.eliminaciones.length > 0 && (
                    <div className="bg-slate-900/40 border border-slate-800 p-2.5 rounded-lg space-y-1 text-[10px]">
                      <span className="text-slate-500 font-bold uppercase tracking-wider text-[8px] block">
                        Asiento Eliminación LucaNet (Consolidación)
                      </span>
                      {op.eliminaciones.map((el) => (
                        <div key={el.id} className="flex justify-between items-center text-slate-400">
                          <span>Haber / Debe neteado:</span>
                          <span className="font-mono text-slate-300 font-semibold">
                            -${el.montoDebe.toLocaleString("es-CL")} CLP
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              ))
            )}
          </div>
        </div>

        {/* Nota explicativa de LucaNet */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-[10px] text-slate-500 leading-relaxed">
          <strong className="text-slate-400 block mb-1">Nota sobre Eliminaciones Intercompany:</strong>
          Para asegurar que las cuentas del grupo sean veraces y no inflar artificialmente las ventas, LucaNet elimina de manera automática las operaciones recíprocas (deudas y facturación interna) en los balances consolidados. Si existe una diferencia menor, se genera un asiento de ajuste de cuadre por la diferencia.
        </div>

      </div>
    </div>
  );
}
