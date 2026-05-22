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

  // Actualizar tarjeta seleccionada después de cambios
  const actualizarTarjetaSeleccionada = (tarjetaId: string, updatedTarjetas: CfoTarjetaCorporativaWithRelations[]) => {
    const found = updatedTarjetas.find((t) => t.id === tarjetaId);
    if (found) {
      setTarjetaSeleccionada(found);
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
        // En producción recargaríamos del servidor, aquí simulamos refrescando localmente
        alert(res.message);
        // Recargar la página o recargar tarjetas (mocked local refresh)
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

      const formData = new FormData();
      formData.append("transaccionId", transaccionId);
      formData.append("comprobante", file);

      startTransition(async () => {
        const res = await cargarComprobanteGasto({}, formData);
        if (res.success) {
          alert(res.message);
          window.location.reload();
        } else {
          alert(res.message);
        }
      });
    };
    fileInput.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-slate-100">
      {/* SECCIÓN IZQUIERDA: Tarjetas y Control (Largo: 7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Selector y Emisión */}
        <div className="flex justify-between items-center bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800">
          <div>
            <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              Tarjetas Corporativas Inteligentes
            </h2>
            <p className="text-xs text-slate-400">Inspirado en Moss. Monitoreo por Centro de Costos.</p>
          </div>
          <button
            onClick={() => setMostrarCrear(!mostrarCrear)}
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-semibold text-xs rounded-xl shadow-lg shadow-teal-500/10 transition-all duration-300 transform active:scale-95"
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
              className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-all duration-300"
            >
              {isPending ? "Procesando..." : "Emitir Tarjeta Corporativa"}
            </button>
          </form>
        ) : (
          /* Listado de Tarjetas Activas con Visual 3D */
          <div className="space-y-6">
            {tarjetas.length === 0 ? (
              <div className="bg-slate-950 border border-slate-800/80 rounded-3xl p-12 text-center">
                <p className="text-sm text-slate-500">No hay tarjetas emitidas. Haz clic en "Emitir Tarjeta" para empezar.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Carrusel/Lista de Tarjetas */}
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2 scrollbar-thin">
                  {tarjetas.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setTarjetaSeleccionada(t)}
                      className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex justify-between items-center ${
                        tarjetaSeleccionada?.id === t.id
                          ? "bg-gradient-to-r from-slate-800/80 to-slate-900/60 border-teal-500/80 shadow-md shadow-teal-500/5"
                          : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${t.estado === "ACTIVA" ? "bg-teal-400" : "bg-red-400"}`}></span>
                          <span className="font-semibold text-xs text-slate-200">{t.titular}</span>
                        </div>
                        <span className="font-mono text-xs text-slate-400 tracking-wider block">{t.numeroEnmascarado}</span>
                        <div className="flex gap-2">
                          <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-400">{t.tipo}</span>
                          {t.centroCosto && (
                            <span className="text-[10px] bg-teal-950/40 px-2 py-0.5 rounded text-teal-400">{t.centroCosto.codigo}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Gastado mensual</span>
                        <span className="font-bold text-xs text-slate-200">
                          ${t.gastadoMensual.toLocaleString("es-CL")}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Límite: ${t.limiteMensualCLP.toLocaleString("es-CL")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Vista 3D de Tarjeta Seleccionada */}
                {tarjetaSeleccionada && (
                  <div className="flex flex-col items-center justify-center p-6 bg-slate-950 border border-slate-800 rounded-3xl space-y-4">
                    {/* Tarjeta 3D */}
                    <div className="group relative w-full max-w-[280px] h-[160px] cursor-pointer perspective">
                      <div className="relative w-full h-full duration-700 preserve-3d group-hover:my-rotate-y-180 shadow-2xl rounded-2xl">
                        
                        {/* Cara Frontal (Glassmorphism Premium) */}
                        <div className="absolute w-full h-full backface-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-950 border border-slate-700/60 p-4 flex flex-col justify-between shadow-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-widest text-teal-400">FINTECH CFO</span>
                              <span className="text-[8px] block text-slate-500">Corporate Card</span>
                            </div>
                            <span className="font-mono text-xs font-black italic text-teal-500">VISA</span>
                          </div>
                          
                          <div className="space-y-1">
                            <span className="font-mono text-sm font-semibold tracking-wider text-slate-200 block">
                              {tarjetaSeleccionada.numeroEnmascarado}
                            </span>
                            <div className="flex justify-between items-end">
                              <div>
                                <span className="text-[7px] text-slate-500 block">TITULAR</span>
                                <span className="text-[10px] font-bold text-slate-300 uppercase">{tarjetaSeleccionada.titular}</span>
                              </div>
                              <div>
                                <span className="text-[7px] text-slate-500 block">LIMIT</span>
                                <span className="text-[9px] font-bold text-slate-300">
                                  {tarjetaSeleccionada.limiteUF ? `${tarjetaSeleccionada.limiteUF} UF` : `$${(tarjetaSeleccionada.limiteMensualCLP / 1000000).toFixed(1)}M`}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Cara Trasera (Giro) */}
                        <div className="absolute w-full h-full my-rotate-y-180 backface-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-700/60 p-4 flex flex-col justify-between shadow-lg">
                          <div className="h-6 w-full bg-slate-950 -mx-4 mt-2"></div>
                          <div className="flex justify-between items-center">
                            <div className="bg-slate-300 text-slate-950 font-mono text-[9px] px-2 py-0.5 rounded">
                              CVV: •••
                            </div>
                            <span className="text-[8px] text-slate-500 font-mono">AUTHORIZED SIGNATURE</span>
                          </div>
                          <div className="flex justify-between items-center text-[7px] text-slate-500">
                            <span>Soporte: +56 2 2400 9000</span>
                            <span className="text-teal-400">MOSS CONTROL</span>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Acciones de la Tarjeta Seleccionada */}
                    <div className="w-full space-y-3">
                      <div className="flex justify-between text-xs border-b border-slate-800 pb-2">
                        <span className="text-slate-400">Estado</span>
                        <span className={`font-bold ${tarjetaSeleccionada.estado === "ACTIVA" ? "text-teal-400" : "text-red-400"}`}>
                          {tarjetaSeleccionada.estado}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        {tarjetaSeleccionada.estado === "ACTIVA" ? (
                          <button
                            onClick={() => handleCambiarEstado(tarjetaSeleccionada.id, CfoEstadoTarjeta.BLOQUEADA)}
                            disabled={isPending}
                            className="flex-1 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-300 hover:text-red-200 text-xs font-semibold rounded-lg transition-all"
                          >
                            Bloquear Tarjeta
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCambiarEstado(tarjetaSeleccionada.id, CfoEstadoTarjeta.ACTIVA)}
                            disabled={isPending}
                            className="flex-1 py-1.5 bg-teal-950/40 hover:bg-teal-900/60 border border-teal-800 text-teal-300 hover:text-teal-200 text-xs font-semibold rounded-lg transition-all"
                          >
                            Activar Tarjeta
                          </button>
                        )}
                        {tarjetaSeleccionada.estado === "ACTIVA" && (
                          <button
                            onClick={() => handleCambiarEstado(tarjetaSeleccionada.id, CfoEstadoTarjeta.SUSPENDIDA)}
                            disabled={isPending}
                            className="flex-1 py-1.5 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800 text-amber-300 hover:text-amber-200 text-xs font-semibold rounded-lg transition-all"
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
          <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-teal-400 flex items-center justify-between">
              <span>Últimos Cargos de {tarjetaSeleccionada.titular}</span>
              <span className="text-xs text-slate-500 font-mono">Filtrado por Tarjeta</span>
            </h3>

            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin">
              {tarjetaSeleccionada.transacciones?.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No hay transacciones registradas para esta tarjeta.</p>
              ) : (
                tarjetaSeleccionada.transacciones?.map((tx) => (
                  <div key={tx.id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex justify-between items-center hover:border-slate-700 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200">{tx.comercio}</span>
                        <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded text-slate-400">{tx.categoria}</span>
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
                          <span className="text-[10px] text-slate-400 block">{tx.montoUF} UF</span>
                        )}
                      </div>

                      <div>
                        {tx.estado === "APROBADA" && (
                          <span className="text-[10px] bg-teal-950/40 text-teal-400 border border-teal-900 px-2.5 py-1 rounded-full font-semibold">
                            Aprobada
                          </span>
                        )}
                        {tx.estado === "RECHAZADA" && (
                          <span className="text-[10px] bg-red-950/40 text-red-400 border border-red-900 px-2.5 py-1 rounded-full font-semibold">
                            Rechazada
                          </span>
                        )}
                        {tx.estado === "REQUERIR_COMPROBANTE" && (
                          <button
                            onClick={() => handleSubirComprobante(tx.id)}
                            disabled={isPending}
                            className="text-[10px] bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-2.5 py-1 rounded-full animate-pulse transition-all shadow-md shadow-amber-500/10"
                          >
                            Cargar Boleta
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* SECCIÓN DERECHA: Simulador Interactive (Largo: 5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        
        <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 space-y-4">
          <div>
            <h2 className="text-md font-bold tracking-tight text-teal-400 uppercase">
              Simulador de Comercio
            </h2>
            <p className="text-xs text-slate-400">Prueba la lógica de alertas presupuestarias de Moss en tiempo real.</p>
          </div>

          {!tarjetaSeleccionada ? (
            <div className="p-4 bg-slate-950 rounded-2xl text-center text-xs text-slate-500">
              Debes seleccionar o crear una tarjeta primero para simular.
            </div>
          ) : (
            <form onSubmit={handleSimularCompra} className="space-y-4">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 text-xs">
                <span className="text-slate-400 block">Tarjeta Seleccionada</span>
                <span className="font-bold text-slate-200">{tarjetaSeleccionada.titular}</span>
                <span className="font-mono text-slate-400 block mt-0.5">{tarjetaSeleccionada.numeroEnmascarado}</span>
                {tarjetaSeleccionada.centroCosto && (
                  <span className="text-[10px] text-teal-400 block mt-1">
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
                className="w-full py-2.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold rounded-xl text-xs transition-all duration-300 transform active:scale-95 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 shadow-md shadow-emerald-500/5"
              >
                {isPending ? "Procesando transacción..." : "Enviar Simulación de Compra"}
              </button>
            </form>
          )}

          {/* BANNER DETALLADO DE RESULTADO DEL SIMULADOR */}
          {mensajeSimulador && (
            <div className={`p-4 rounded-2xl border text-xs shadow-lg animate-fade-in ${
              mensajeSimulador.success 
                ? "bg-teal-950/30 border-teal-800/80 text-teal-300"
                : "bg-red-950/30 border-red-800/80 text-red-300"
            }`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${mensajeSimulador.success ? "bg-teal-400 animate-ping" : "bg-red-400"}`}></span>
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
