"use client";

import React, { useState, useTransition } from "react";
import { 
  crearTarjetaCorporativa, 
  modificarEstadoTarjeta, 
  modificarLimiteTarjeta, 
  procesarTransaccionTarjeta, 
  cargarComprobanteGasto,
  CfoTarjetaCorporativaWithRelations 
} from "@/app/actions/controlling";
import { CfoEstadoTarjeta, CfoTipoTarjeta, CfoEstadoTransaccion } from "@/app/generated/prisma";

interface TarjetasMossProps {
  tarjetasIniciales: CfoTarjetaCorporativaWithRelations[];
  usuarios: Array<{ id: string; nombre: string; email: string }>;
  sociedades: Array<{ id: string; codigo: string; razonSocial: string }>;
  centrosCosto: Array<{ id: string; codigo: string; nombre: string }>;
}

export default function TarjetasMoss({
  tarjetasIniciales,
  usuarios,
  sociedades,
  centrosCosto,
}: TarjetasMossProps) {
  const [tarjetas, setTarjetas] = useState<CfoTarjetaCorporativaWithRelations[]>(tarjetasIniciales);
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState<CfoTarjetaCorporativaWithRelations | null>(
    tarjetasIniciales[0] || null
  );
  const [isPending, startTransition] = useTransition();
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [mensajeSimulador, setMensajeSimulador] = useState<{ texto: string; success: boolean } | null>(null);

  // NUEVOS ESTADOS PREMIUM
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const [uploadingTxId, setUploadingTxId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Formulario Crear Tarjeta State
  const [usuarioId, setUsuarioId] = useState("");
  const [sociedadId, setSociedadId] = useState("");
  const [centroCostoId, setCentroCostoId] = useState("");
  const [limiteCLP, setLimiteCLP] = useState("1000000");
  const [limiteUF, setLimiteUF] = useState("");
  const [tipoTarjeta, setTipoTarjeta] = useState("VIRTUAL");

  // Formulario Simulador State
  const [comercioSimulado, setComercioSimulado] = useState("Amazon AWS");
  const [montoSimulado, setMontoSimulado] = useState("45000");
  const [categoriaSimulada, setCategoriaSimulada] = useState("Software & SaaS");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const factor = 12; // Ángulo máximo de inclinación
    setRotateX(-(y / (box.height / 2)) * factor);
    setRotateY((x / (box.width / 2)) * factor);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const startSimulatedUpload = async (txId: string, file: File) => {
    setUploadingTxId(txId);
    setUploadProgress(0);
    setUploadSuccess(false);

    // Simular incremento de progreso
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    // Esperar fin de simulación de barra
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const formData = new FormData();
    formData.append("transaccionId", txId);
    formData.append("comprobante", file);

    startTransition(async () => {
      const res = await cargarComprobanteGasto({}, formData);
      if (res.success) {
        setUploadSuccess(true);
        setTimeout(() => {
          setUploadingTxId(null);
          window.location.reload();
        }, 1200);
      } else {
        alert(res.message || "Error al subir comprobante");
        setUploadingTxId(null);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent, txId: string) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      startSimulatedUpload(txId, file);
    }
  };

  const handleCrearTarjeta = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("usuarioId", usuarioId);
    formData.append("sociedadId", sociedadId);
    formData.append("centroCostoId", centroCostoId);
    formData.append("limiteMensualCLP", limiteCLP);
    if (limiteUF) formData.append("limiteUF", limiteUF);
    formData.append("tipo", tipoTarjeta);

    startTransition(async () => {
      const res = await crearTarjetaCorporativa({}, formData);
      if (res.success) {
        alert(res.message);
        window.location.reload();
      } else {
        alert(res.message || "Error al crear la tarjeta");
      }
    });
  };

  const handleCambiarEstado = async (tarjetaId: string, nuevoEstado: CfoEstadoTarjeta) => {
    const formData = new FormData();
    formData.append("tarjetaId", tarjetaId);
    formData.append("estado", nuevoEstado);

    startTransition(async () => {
      const res = await modificarEstadoTarjeta({}, formData);
      if (res.success) {
        setTarjetas(prev => 
          prev.map(t => t.id === tarjetaId ? { ...t, estado: nuevoEstado } : t)
        );
        setTimeout(() => window.location.reload(), 800);
      } else {
        alert(res.message);
      }
    });
  };

  const handleSimularCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tarjetaSeleccionada) return;

    const formData = new FormData();
    formData.append("tarjetaId", tarjetaSeleccionada.id);
    formData.append("comercio", comercioSimulado);
    formData.append("monto", montoSimulado);
    formData.append("categoria", categoriaSimulada);

    startTransition(async () => {
      const res = await procesarTransaccionTarjeta({}, formData);
      if (res.success) {
        setMensajeSimulador({ texto: res.message || "", success: true });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMensajeSimulador({ texto: res.message || "Transacción rechazada", success: false });
      }
    });
  };

  const handleSubirComprobante = async (transaccionId: string) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*,application/pdf";
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      startSimulatedUpload(transaccionId, file);
    };
    fileInput.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-slate-100 animate-fade-in">
      {/* SECCIÓN IZQUIERDA: Tarjetas y Control (Largo: 7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Selector y Emisión */}
        <div className="flex justify-between items-center bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-xl">
          <div>
            <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Tarjetas Corporativas Inteligentes
            </h2>
            <p className="text-xs text-slate-400">Emisión al instante y alertas de controlling por presupuesto.</p>
          </div>
          <button
            onClick={() => setMostrarCrear(!mostrarCrear)}
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-semibold text-xs rounded-xl shadow-lg shadow-teal-500/10 transition-all duration-300 transform active:scale-95 cursor-pointer"
          >
            {mostrarCrear ? "Ver Tarjetas" : "Emitir Tarjeta"}
          </button>
        </div>

        {mostrarCrear ? (
          /* Formulario Crear Tarjeta */
          <form onSubmit={handleCrearTarjeta} className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 space-y-4 shadow-xl">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-teal-400">Emisión de Tarjeta Corporativa</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Colaborador Titular</label>
                <select
                  required
                  value={usuarioId}
                  onChange={(e) => setUsuarioId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:border-teal-500 focus:outline-none text-slate-200"
                >
                  <option value="">Seleccionar...</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>{u.nombre} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Tipo de Tarjeta</label>
                <select
                  value={tipoTarjeta}
                  onChange={(e) => setTipoTarjeta(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:border-teal-500 focus:outline-none text-slate-200"
                >
                  <option value="VIRTUAL">Virtual (Uso inmediato)</option>
                  <option value="FISICA">Física (Despacho a oficina)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Sociedad Asociada</label>
                <select
                  value={sociedadId}
                  onChange={(e) => setSociedadId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:border-teal-500 focus:outline-none text-slate-200"
                >
                  <option value="">Ninguna...</option>
                  {sociedades.map((s) => (
                    <option key={s.id} value={s.id}>{s.razonSocial} ({s.codigo})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Centro de Costo</label>
                <select
                  value={centroCostoId}
                  onChange={(e) => setCentroCostoId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:border-teal-500 focus:outline-none text-slate-200"
                >
                  <option value="">Ninguno...</option>
                  {centrosCosto.map((cc) => (
                    <option key={cc.id} value={cc.id}>{cc.nombre} ({cc.codigo})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Límite Mensual (CLP)</label>
                <input
                  required
                  type="number"
                  value={limiteCLP}
                  onChange={(e) => setLimiteCLP(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:border-teal-500 focus:outline-none text-slate-200"
                  placeholder="Ej: 1000000"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Límite UF (Opcional)</label>
                <input
                  type="number"
                  step="0.1"
                  value={limiteUF}
                  onChange={(e) => setLimiteUF(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:border-teal-500 focus:outline-none text-slate-200"
                  placeholder="Ej: 25"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-all duration-300 cursor-pointer"
            >
              {isPending ? "Procesando..." : "Emitir Tarjeta Corporativa"}
            </button>
          </form>
        ) : (
          /* Listado de Tarjetas Activas con Visual 3D */
          <div className="space-y-6">
            {tarjetas.length === 0 ? (
              <div className="bg-slate-950 border border-slate-800/80 rounded-3xl p-12 text-center shadow-inner">
                <p className="text-sm text-slate-500">No hay tarjetas emitidas. Haz clic en "Emitir Tarjeta" para empezar.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Lista de Tarjetas (Largo: 7 cols) */}
                <div className="md:col-span-7 space-y-3 max-h-[380px] overflow-y-auto pr-2 scrollbar-thin">
                  {tarjetas.map((t) => {
                    const ratio = t.gastadoMensual / t.limiteMensualCLP;
                    const percent = Math.min(ratio * 100, 100);
                    const isNearLimit = ratio >= 0.8;

                    return (
                      <div
                        key={t.id}
                        onClick={() => {
                          setTarjetaSeleccionada(t);
                          setIsFlipped(false);
                        }}
                        className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col gap-3 ${
                          tarjetaSeleccionada?.id === t.id
                            ? "bg-gradient-to-r from-slate-800/90 to-slate-900/70 border-teal-500/80 shadow-lg shadow-teal-500/5 glow-teal-hover"
                            : "bg-slate-900/40 border-slate-800/90 hover:border-slate-700/80 hover:bg-slate-900/60"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${t.estado === "ACTIVA" ? "bg-teal-400" : "bg-red-400"}`}></span>
                              <span className="font-semibold text-xs text-slate-200">{t.titular}</span>
                            </div>
                            <span className="font-mono text-[10.5px] text-slate-400 tracking-wider block">{t.numeroEnmascarado}</span>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-medium">Gastado mensual</span>
                            <span className="font-bold text-xs text-slate-100">
                              ${t.gastadoMensual.toLocaleString("es-CL")}
                            </span>
                            <span className="text-[9.5px] text-slate-500 block">
                              Límite: ${t.limiteMensualCLP.toLocaleString("es-CL")}
                            </span>
                          </div>
                        </div>

                        {/* Presupuesto Visual Gauge */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] text-slate-500 px-0.5">
                            <span>Consumo de límite</span>
                            <span className={isNearLimit ? "text-amber-400 font-bold" : "text-teal-400"}>
                              {percent.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                            <div 
                              className={`h-full rounded-full transition-all duration-700 ${
                                isNearLimit
                                  ? "bg-gradient-to-r from-amber-500 to-red-500 animate-pulse"
                                  : "bg-gradient-to-r from-teal-500 to-emerald-400"
                              }`}
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <span className="text-[9px] bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 text-slate-400">{t.tipo}</span>
                          {t.centroCosto && (
                            <span className="text-[9px] bg-teal-950/30 px-2 py-0.5 rounded border border-teal-900/30 text-teal-400 font-mono">{t.centroCosto.codigo}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Vista 3D de Tarjeta Seleccionada (Largo: 5 cols) */}
                {tarjetaSeleccionada && (
                  <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950 border border-slate-900 rounded-3xl space-y-5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none"></div>
                    
                    {/* Tarjeta 3D Interactiva */}
                    <div 
                      onClick={() => setIsFlipped(!isFlipped)}
                      onMouseMove={!isFlipped ? handleMouseMove : undefined}
                      onMouseLeave={handleMouseLeave}
                      className="relative w-full max-w-[280px] h-[160px] cursor-pointer perspective mx-auto"
                    >
                      <div 
                        className="relative w-full h-full duration-700 preserve-3d shadow-2xl rounded-2xl transition-transform"
                        style={{
                          transform: isFlipped 
                            ? "rotateY(180deg)" 
                            : `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
                        }}
                      >
                        
                        {/* Cara Frontal (Glassmorphism Premium) */}
                        <div className="absolute w-full h-full backface-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950/70 to-slate-950 border border-slate-700/50 p-4 flex flex-col justify-between shadow-xl select-none">
                          <div className="card-shine"></div>
                          
                          {/* Cabecera Tarjeta */}
                          <div className="flex justify-between items-start z-10">
                            <div>
                              <span className="text-[9.5px] uppercase font-black tracking-widest text-teal-400">FINTECH CFO</span>
                              <span className="text-[7px] block text-slate-500 tracking-wider">PREMIUM CARD</span>
                            </div>
                            
                            {/* Contactless waves SVG */}
                            <svg className="w-5 h-5 text-slate-400/50 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <path d="M3.5 15a4.9 4.9 0 0 1 0-6" />
                              <path d="M6.5 17a8.9 8.9 0 0 1 0-10" />
                              <path d="M9.5 19a12.9 12.9 0 0 1 0-14" />
                            </svg>
                          </div>
                          
                          {/* Chip Dorado SVG y Red Contable */}
                          <div className="flex justify-between items-center z-10 -mt-2">
                            <svg className="w-9 h-7 rounded-md bg-gradient-to-r from-yellow-600 via-amber-400 to-yellow-600 border border-yellow-700/40 p-1 shadow-inner" viewBox="0 0 32 24">
                              <rect x="2" y="2" width="28" height="20" rx="2" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
                              <line x1="8" y1="2" x2="8" y2="22" stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
                              <line x1="16" y1="2" x2="16" y2="22" stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
                              <line x1="24" y1="2" x2="24" y2="22" stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
                              <line x1="2" y1="8" x2="30" y2="8" stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
                              <line x1="2" y1="16" x2="30" y2="16" stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
                            </svg>
                          </div>
                          
                          {/* Datos Tarjeta */}
                          <div className="space-y-1 z-10">
                            <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-slate-200 block drop-shadow">
                              {tarjetaSeleccionada.numeroEnmascarado}
                            </span>
                            <div className="flex justify-between items-end">
                              <div>
                                <span className="text-[6.5px] text-slate-500 block font-bold">TITULAR</span>
                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wide">{tarjetaSeleccionada.titular}</span>
                              </div>
                              
                              {/* Holograma Visa */}
                              <div className="relative w-8 h-5 rounded-md bg-gradient-to-tr from-cyan-400 via-pink-400 to-yellow-300 opacity-90 border border-slate-200/20 overflow-hidden shadow flex items-center justify-center">
                                <span className="font-mono text-[7px] font-black italic text-slate-900 tracking-tighter">VISA</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Cara Trasera (Giro) */}
                        <div className="absolute w-full h-full my-rotate-y-180 backface-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-700/60 p-4 flex flex-col justify-between shadow-xl">
                          <div className="h-6 w-full bg-slate-950 -mx-4 mt-2"></div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="bg-slate-300 text-slate-950 font-mono text-[9px] px-2 py-0.5 rounded font-bold shadow-inner">
                              CVV: •••
                            </div>
                            <span className="text-[8px] text-slate-500 font-mono tracking-wider">FIRMA AUTORIZADA</span>
                          </div>
                          <div className="flex justify-between items-center text-[7px] text-slate-500 font-medium">
                            <span>Soporte: +56 2 2400 9000</span>
                            <span className="text-teal-400 font-bold">MOSS CONTROL</span>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Acciones de la Tarjeta Seleccionada */}
                    <div className="w-full space-y-3 z-10">
                      <div className="flex justify-between text-xs border-b border-slate-800/80 pb-2">
                        <span className="text-slate-400">Estado de Operación</span>
                        <span className={`font-bold ${tarjetaSeleccionada.estado === "ACTIVA" ? "text-teal-400" : "text-red-400"}`}>
                          {tarjetaSeleccionada.estado}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        {tarjetaSeleccionada.estado === "ACTIVA" ? (
                          <button
                            onClick={() => handleCambiarEstado(tarjetaSeleccionada.id, CfoEstadoTarjeta.BLOQUEADA)}
                            disabled={isPending}
                            className="flex-1 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/80 text-red-300 hover:text-red-200 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                          >
                            Bloquear
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCambiarEstado(tarjetaSeleccionada.id, CfoEstadoTarjeta.ACTIVA)}
                            disabled={isPending}
                            className="flex-1 py-1.5 bg-teal-950/40 hover:bg-teal-900/60 border border-teal-800/80 text-teal-300 hover:text-teal-200 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                          >
                            Activar
                          </button>
                        )}
                        {tarjetaSeleccionada.estado === "ACTIVA" && (
                          <button
                            onClick={() => handleCambiarEstado(tarjetaSeleccionada.id, CfoEstadoTarjeta.SUSPENDIDA)}
                            disabled={isPending}
                            className="flex-1 py-1.5 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/80 text-amber-300 hover:text-amber-200 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                          >
                            Suspender
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* FEED DE TRANSACCIONES */}
        {tarjetaSeleccionada && (
          <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-teal-400 flex items-center justify-between">
              <span>Últimos Cargos de {tarjetaSeleccionada.titular}</span>
              <span className="text-xs text-slate-500 font-mono">Consolidación en Tiempo Real</span>
            </h3>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              {tarjetaSeleccionada.transacciones?.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No hay transacciones registradas para esta tarjeta.</p>
              ) : (
                tarjetaSeleccionada.transacciones?.map((tx) => {
                  const isUploadingThis = uploadingTxId === tx.id;
                  return (
                    <div key={tx.id} className="space-y-2">
                      <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex justify-between items-center hover:border-slate-700 transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-200">{tx.comercio}</span>
                            <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 font-semibold">{tx.categoria}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 block">
                            {new Date(tx.fecha).toLocaleDateString("es-CL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="font-bold text-xs text-slate-200 block">
                              ${tx.montoCLP.toLocaleString("es-CL")}
                            </span>
                            {tx.montoUF && (
                              <span className="text-[10px] text-slate-400 block font-mono">{tx.montoUF} UF</span>
                            )}
                          </div>

                          <div>
                            {tx.estado === "APROBADA" && (
                              <span className="text-[10px] bg-teal-950/40 text-teal-400 border border-teal-900/60 px-2.5 py-1 rounded-full font-semibold">
                                Aprobada
                              </span>
                            )}
                            {tx.estado === "RECHAZADA" && (
                              <span className="text-[10px] bg-red-950/40 text-red-400 border border-red-900/60 px-2.5 py-1 rounded-full font-semibold">
                                Rechazada
                              </span>
                            )}
                            {tx.estado === "REQUERIR_COMPROBANTE" && !isUploadingThis && (
                              <button
                                onClick={() => handleSubirComprobante(tx.id)}
                                disabled={isPending || !!uploadingTxId}
                                className="text-[10px] bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-2.5 py-1 rounded-full animate-pulse transition-all shadow-md shadow-amber-500/10 cursor-pointer"
                              >
                                Cargar Boleta
                              </button>
                            )}
                            {isUploadingThis && (
                              <span className="text-[10px] text-teal-400 font-bold animate-pulse">
                                Cargando...
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Dropzone Interactiva Drag & Drop */}
                      {tx.estado === "REQUERIR_COMPROBANTE" && (isUploadingThis || uploadingTxId === null) && (
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, tx.id)}
                          onClick={() => {
                            if (!isUploadingThis) {
                              handleSubirComprobante(tx.id);
                            }
                          }}
                          className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all duration-300 ${
                            isUploadingThis
                              ? "bg-teal-950/20 border-teal-500/80 text-teal-300"
                              : isDragOver
                                ? "bg-teal-950/30 border-teal-400/80 text-teal-200 shadow-lg shadow-teal-500/10"
                                : "bg-slate-950/40 border-slate-800/80 hover:border-teal-950/60 hover:bg-teal-950/5 text-slate-500 hover:text-slate-400"
                          }`}
                        >
                          {isUploadingThis ? (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-xs font-semibold px-2">
                                <span>{uploadSuccess ? "¡Cargado con éxito!" : "Subiendo comprobante..."}</span>
                                <span className="font-mono">{uploadProgress}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    uploadSuccess ? "bg-emerald-400" : "bg-gradient-to-r from-teal-500 to-cyan-400"
                                  }`}
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                              {uploadSuccess && (
                                <span className="text-[9.5px] text-emerald-400 block font-semibold animate-fade-in">✓ Boleta validada con éxito</span>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1.5 py-1">
                              <p className="text-[10.5px] font-bold text-slate-300">Arrastra aquí tu boleta o haz clic para subir</p>
                              <p className="text-[9px] text-slate-500">Formatos permitidos: JPG, PNG, PDF hasta 10MB</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>

      {/* SECCIÓN DERECHA: Simulador Interactive (Largo: 5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        
        <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <div>
            <h2 className="text-md font-bold tracking-tight text-teal-400 uppercase">
              Simulador de Comercio
            </h2>
            <p className="text-xs text-slate-400">Prueba la lógica de alertas presupuestarias de Moss en tiempo real.</p>
          </div>

          {!tarjetaSeleccionada ? (
            <div className="p-4 bg-slate-950 rounded-2xl text-center text-xs text-slate-500 border border-slate-850">
              Debes seleccionar o crear una tarjeta primero para simular.
            </div>
          ) : (
            <form onSubmit={handleSimularCompra} className="space-y-4">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 text-xs shadow-inner">
                <span className="text-slate-400 block">Tarjeta Seleccionada</span>
                <span className="font-bold text-slate-200">{tarjetaSeleccionada.titular}</span>
                <span className="font-mono text-slate-400 block mt-0.5">{tarjetaSeleccionada.numeroEnmascarado}</span>
                {tarjetaSeleccionada.centroCosto && (
                  <span className="text-[10px] text-teal-400 block mt-1 font-mono">
                    CC: {tarjetaSeleccionada.centroCosto.nombre} ({tarjetaSeleccionada.centroCosto.codigo})
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Comercio / Proveedor</label>
                <input
                  required
                  type="text"
                  value={comercioSimulado}
                  onChange={(e) => setComercioSimulado(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:border-teal-500 focus:outline-none text-slate-200"
                  placeholder="Ej: Amazon AWS, Uber, Starbucks"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Monto de Compra (CLP)</label>
                <input
                  required
                  type="number"
                  value={montoSimulado}
                  onChange={(e) => setMontoSimulado(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:border-teal-500 focus:outline-none text-slate-200"
                  placeholder="Ej: 50000"
                />
                <span className="text-[10px] text-slate-500 italic">
                  Las compras mayores a $15.000 requerirán boleta de manera obligatoria.
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Categoría del Gasto</label>
                <select
                  value={categoriaSimulada}
                  onChange={(e) => setCategoriaSimulada(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:border-teal-500 focus:outline-none text-slate-200"
                >
                  <option value="Software & SaaS">Software & SaaS</option>
                  <option value="Servicios de Marketing">Servicios de Marketing</option>
                  <option value="Viajes y Viáticos">Viajes y Viáticos</option>
                  <option value="Oficina y Logística">Oficina y Logística</option>
                  <option value="General">General</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isPending || tarjetaSeleccionada.estado !== "ACTIVA"}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold rounded-xl text-xs transition-all duration-300 transform active:scale-95 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 shadow-md shadow-emerald-500/5 cursor-pointer"
              >
                {isPending ? "Procesando transacción..." : "Enviar Simulación de Compra"}
              </button>
            </form>
          )}

          {/* BANNER DETALLADO DE RESULTADO DEL SIMULADOR */}
          {mensajeSimulador && (
            <div className={`p-4 rounded-2xl border text-xs shadow-lg animate-fade-in ${
              mensajeSimulador.success 
                ? "bg-teal-950/30 border-teal-800/80 text-teal-300 animate-pulse"
                : "bg-red-950/30 border-red-800/80 text-red-300"
            }`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${mensajeSimulador.success ? "bg-teal-400" : "bg-red-400"}`}></span>
                <span className="font-bold uppercase tracking-wider">
                  {mensajeSimulador.success ? "Compra Autorizada" : "Compra Denegada"}
                </span>
              </div>
              <p className="leading-relaxed">{mensajeSimulador.texto}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );

}
