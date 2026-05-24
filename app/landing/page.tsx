"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  CheckCircle2, 
  Coins, 
  FileCheck2, 
  Globe2, 
  HelpCircle, 
  Layers, 
  Sparkles, 
  TrendingUp, 
  Zap 
} from "lucide-react";

export default function LandingPage() {
  // Estados para la Calculadora Interactiva de ROI
  const [filiales, setFiliales] = useState(4);
  const [horasManuales, setHorasManuales] = useState(15);
  const [costoHora, setCostoHora] = useState(30);

  // Fórmulas de cálculo de ahorro
  const totalHorasMensualesSin = filiales * horasManuales;
  const totalHorasMensualesCon = Math.ceil(totalHorasMensualesSin * 0.08); // Ahorra 92%
  const horasAhorradasMes = totalHorasMensualesSin - totalHorasMensualesCon;
  const costoAhorradoMes = horasAhorradasMes * costoHora;
  const costoAhorradoAno = costoAhorradoMes * 12;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070b12] via-[#0b1324] to-[#0d162d] text-slate-100 font-sans antialiased overflow-x-hidden selection:bg-teal-500/20 selection:text-teal-300">
      
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 bg-[#070b12]/80 backdrop-blur-md border-b border-slate-800/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <Layers className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Consoli<span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Flow</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <a href="#caracteristicas" className="hover:text-teal-400 transition-colors">Características</a>
            <a href="#calculadora" className="hover:text-teal-400 transition-colors">Simulador ROI</a>
            <a href="#precios" className="hover:text-teal-400 transition-colors">Planes</a>
            <a href="#faq" className="hover:text-teal-400 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="px-4 py-2 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/50 rounded-xl text-xs font-bold transition-all"
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/register" 
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/10 transition-all duration-300 transform active:scale-95"
            >
              Prueba Demo
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        
        {/* Glow de fondo */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/10 to-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-full text-[10px] font-bold text-teal-400 uppercase tracking-widest shadow-md">
          <Sparkles className="w-3.5 h-3.5" />
          NUEVO: Consolidación Multimoneda Inteligente
        </div>

        <h1 className="max-w-4xl mx-auto text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-white">
          Consolidación Financiera <br />
          <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
            y Auditoría Automática
          </span> <br />
          para Grupos en Chile y LATAM.
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400 leading-relaxed">
          Une la contabilidad de tus filiales, netea transacciones intercompany y reexpresa balances multimoneda en segundos con cumplimiento tributario chileno (RUT checksum) e IFRS.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link 
            href="/register" 
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-slate-950 font-extrabold text-sm rounded-xl shadow-xl shadow-cyan-500/15 transition-all duration-300 transform active:scale-95"
          >
            Comenzar Prueba Gratis
          </Link>
          <a 
            href="#calculadora" 
            className="w-full sm:w-auto px-8 py-3 bg-slate-900/60 border border-slate-850 hover:border-slate-800 hover:bg-slate-900/90 rounded-xl text-sm font-bold text-slate-200 transition-all"
          >
            Ver Ahorro Estimado
          </a>
        </div>

        {/* Mockup de la plataforma */}
        <div className="pt-12 max-w-5xl mx-auto">
          <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-2xl md:rounded-3xl shadow-2xl relative overflow-hidden">
            {/* Cabecera del Navegador Mock */}
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3 mb-3 px-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
              <span className="text-[10px] text-slate-600 font-mono ml-4 select-none">app.consoliflow.com/cfo/intercompany</span>
            </div>

            {/* Simulación simplificada de UI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2 text-left">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Holding Consolidado</span>
                <span className="text-lg font-bold text-slate-200 block mt-1">Chile, Brasil y USA</span>
                <div className="flex gap-2 mt-3">
                  <span className="text-[9px] bg-teal-950/50 text-teal-400 border border-teal-900/30 px-2 py-0.5 rounded font-mono">12 Filiales</span>
                  <span className="text-[9px] bg-cyan-950/50 text-cyan-400 border border-cyan-900/30 px-2 py-0.5 rounded font-mono">Multimoneda</span>
                </div>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Simulador FX Reexpresión</span>
                <span className="text-lg font-bold text-cyan-400 block mt-1">$945 CLP</span>
                <div className="w-full h-1 bg-slate-950 rounded-full mt-4 overflow-hidden">
                  <div className="w-2/3 h-full bg-cyan-400 rounded-full"></div>
                </div>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Auditoría IA ConsoliFlow</span>
                <span className="text-lg font-bold text-emerald-400 block mt-1">Escáner Activo</span>
                <div className="flex items-center gap-1.5 mt-3 text-[10px] text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Todos los RUT validados Módulo 11</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* 3. Características / Beneficios */}
      <section id="caracteristicas" className="py-20 md:py-28 bg-[#05080e]/60 border-y border-slate-850 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-teal-400">
              ¿Por qué elegir ConsoliFlow?
            </h2>
            <p className="max-w-xl mx-auto text-sm text-slate-400">
              Automatización de extremo a extremo diseñada para holdings de América Latina.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all duration-300 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-teal-950/50 text-teal-400 border border-teal-900/30 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-200">Reexpresión Cambiaria NIIF</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Convierte saldos extranjeros (USD, BRL, PEN) a pesos chilenos instantáneamente basándose en UF e índices cambiarios diarios de forma auditable.
              </p>
            </div>

            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all duration-300 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/50 text-cyan-400 border border-cyan-900/30 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-200">Neteo de Deudas Cruzadas</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Detecta y elimina automáticamente operaciones recíprocas y facturas cruzadas entre filiales para no inflar los balances de grupo.
              </p>
            </div>

            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all duration-300 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/50 text-emerald-400 border border-emerald-900/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-200">Auditor IA e Ingesta OCR</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Escanea tus libros auxiliares con algoritmos que localizan errores cambiarios y diferencias por impuestos de origen en segundos.
              </p>
            </div>

            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all duration-300 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-violet-950/50 text-violet-400 border border-violet-900/30 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-200">Cumplimiento Tributario</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Módulo incorporado de validación de RUTs chilenos bajo el algoritmo oficial Módulo 11 para asientos contables sin errores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Simulador de ROI (Calculadora Interactiva de Ahorro) */}
      <section id="calculadora" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-cyan-400">
            Simulador de Retorno (ROI)
          </h2>
          <p className="max-w-xl mx-auto text-sm text-slate-400">
            Calcula cuánto tiempo y costo operativo puede ahorrar tu holding mensualmente al automatizar con ConsoliFlow.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controles del Simulador (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 space-y-6 shadow-xl">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Número de Sociedades / Filiales:</span>
                <span className="text-teal-400 font-bold font-mono">{filiales}</span>
              </div>
              <input 
                type="range"
                min="2"
                max="20"
                value={filiales}
                onChange={(e) => setFiliales(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Horas de cierre manual al mes (por filial):</span>
                <span className="text-teal-400 font-bold font-mono">{horasManuales} hrs</span>
              </div>
              <input 
                type="range"
                min="5"
                max="40"
                value={horasManuales}
                onChange={(e) => setHorasManuales(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Costo promedio hora del analista (USD):</span>
                <span className="text-teal-400 font-bold font-mono">${costoHora} USD</span>
              </div>
              <input 
                type="range"
                min="15"
                max="100"
                value={costoHora}
                onChange={(e) => setCostoHora(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
            </div>

            <div className="text-[10px] text-slate-500 italic leading-relaxed pt-2 border-t border-slate-800">
              * Estimaciones basadas en benchmarks promedio de holdings en LATAM que migran de hojas de cálculo de Excel a conciliaciones ConsoliFlow.
            </div>
          </div>

          {/* Resultados de ROI (7 cols) */}
          <div className="lg:col-span-7 bg-slate-950/80 p-8 rounded-3xl border border-slate-850 flex flex-col justify-between gap-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Horas */}
              <div className="space-y-1 border-r border-slate-900 pr-4">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Tiempo de Cierre Mensual</span>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-2xl font-black text-slate-400 line-through font-mono">{totalHorasMensualesSin}</span>
                  <span className="text-slate-500 text-xs">/</span>
                  <span className="text-3xl font-black text-emerald-400 font-mono">{totalHorasMensualesCon} hrs</span>
                </div>
                <p className="text-[10px] text-slate-400 pt-1 leading-relaxed">
                  Con ConsoliFlow reduces tu jornada de consolidación en un <strong className="text-emerald-400">92%</strong>.
                </p>
              </div>

              {/* Ahorro Anual */}
              <div className="space-y-1 pl-0 md:pl-4">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Ahorro Económico Estimado</span>
                <div className="text-3xl font-black text-cyan-400 font-mono mt-2">
                  ${costoAhorradoAno.toLocaleString("es-CL")} USD
                </div>
                <span className="text-[9.5px] text-slate-500 font-semibold uppercase tracking-wider font-mono">Al Año</span>
                <p className="text-[10px] text-slate-400 pt-1 leading-relaxed">
                  Reducción de horas extras y auditorías complejas del holding.
                </p>
              </div>

            </div>

            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-850 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="space-y-0.5 text-left">
                <span className="text-[10px] text-slate-400 block font-bold">¿Listo para ver estos resultados en tu grupo?</span>
                <span className="text-[9.5px] text-slate-500">Demo disponible de forma inmediata sin compromisos.</span>
              </div>
              <Link 
                href="/register" 
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Probar ConsoliFlow
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Precios / Planes */}
      <section id="precios" className="py-20 md:py-28 bg-[#05080e]/60 border-y border-slate-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-emerald-450">
              Planes Flexibles Localizados
            </h2>
            <p className="max-w-xl mx-auto text-sm text-slate-400">
              Sin contratos forzosos. Precios transparentes calculados en UF para Chile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Starter */}
            <div className="bg-slate-900/40 p-8 rounded-3xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all space-y-6">
              <div className="space-y-2">
                <span className="text-[9px] bg-slate-950 border border-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">Starter</span>
                <h3 className="text-xl font-bold text-slate-200">Hasta 3 filiales</h3>
                <p className="text-xs text-slate-400">Ideal para holdings pequeños o grupos familiares iniciando consolidación.</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-3xl font-extrabold text-white font-mono">5 UF</span>
                <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">Al mes + IVA</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-400 border-t border-slate-850 pt-4">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" /> Consolidación Básica</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" /> Reexpresión CLP / USD</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" /> Validador de RUT</li>
                <li className="flex items-center gap-2 text-slate-600"><CheckCircle2 className="w-3.5 h-3.5 text-slate-700 shrink-0" /> Auditoría IA Completa</li>
              </ul>

              <Link href="/register" className="w-full py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-center font-bold text-xs rounded-xl block transition-all">
                Iniciar Plan Starter
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-slate-900/80 p-8 rounded-3xl border-2 border-cyan-500/60 flex flex-col justify-between hover:border-cyan-500 transition-all space-y-6 relative shadow-xl shadow-cyan-500/5">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                Recomendado
              </div>

              <div className="space-y-2">
                <span className="text-[9px] bg-cyan-950/50 text-cyan-400 border border-cyan-900/30 font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">Pro</span>
                <h3 className="text-xl font-bold text-slate-100">Hasta 8 filiales</h3>
                <p className="text-xs text-slate-400">Perfecto para medianas empresas con operaciones transfronterizas en LATAM.</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-3xl font-extrabold text-cyan-400 font-mono">15 UF</span>
                <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">Al mes + IVA</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-850 pt-4">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Consolidación Multimoneda</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Eliminación Intercompany</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Auditoría IA Básica</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Soporte Preferente 24/7</li>
              </ul>

              <Link href="/register" className="w-full py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-slate-950 text-center font-bold text-xs rounded-xl block transition-all shadow-md">
                Iniciar Plan Pro
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-slate-900/40 p-8 rounded-3xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all space-y-6">
              <div className="space-y-2">
                <span className="text-[9px] bg-slate-950 border border-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">Enterprise</span>
                <h3 className="text-xl font-bold text-slate-200">Ilimitadas filiales</h3>
                <p className="text-xs text-slate-400">Diseñado para corporaciones grandes que requieren integraciones a ERPs y SLAs dedicados.</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-3xl font-extrabold text-white font-mono">Personalizado</span>
                <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">A Medida</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-400 border-t border-slate-850 pt-4">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" /> Integración con SAP / Oracle / ERP</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" /> Consolidaciones Ilimitadas</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" /> Auditoría IA Personalizada</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" /> Gestor de Cuentas Dedicado</li>
              </ul>

              <a href="mailto:ventas@consoliflow.com?subject=ConsoliFlow%20Enterprise" className="w-full py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-center font-bold text-xs rounded-xl block transition-all">
                Contactar Ventas
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section id="faq" className="py-20 md:py-28 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-teal-400">
            Preguntas Frecuentes
          </h2>
          <p className="text-xs text-slate-500">Resolvemos tus dudas operativas.</p>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
            <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2"><HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" /> ¿Cómo maneja la plataforma la UF chilena?</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed pl-6">
              ConsoliFlow cuenta con una base indexada histórica diaria del valor de la UF para reexpresar deudas y límites presupuestarios de forma correcta a valor UF de cierre de cada periodo contable.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
            <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2"><HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" /> ¿Qué es la diferencia de conversión contable?</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed pl-6">
              Es un ajuste obligatorio por normas internacionales IFRS (NIIF) que surge al convertir activos y pasivos de filiales con monedas funcionales distintas (como el Real Brasileño) a la moneda de reporte del holding (Pesos Chilenos), el cual ConsoliFlow simula y calcula automáticamente.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
            <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2"><HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" /> ¿Se puede integrar con Softland, SAP o ERPs chilenos?</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed pl-6">
              Sí. Mediante nuestro importador robusto de asientos contables en CSV, puedes exportar el libro mayor de cualquier ERP del mercado local y cargarlo directamente en ConsoliFlow para iniciar el cierre consolidado.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-[#04060b] border-t border-slate-850 py-8 text-center text-[10.5px] text-slate-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center">
              <Layers className="w-2.5 h-2.5 text-slate-950" />
            </div>
            <span className="font-bold text-slate-400">ConsoliFlow LATAM © 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Términos de Servicio</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Política de Privacidad</a>
            <a href="mailto:soporte@consoliflow.com" className="hover:text-slate-400 transition-colors">Soporte</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
