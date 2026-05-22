import { validarRut, formatearRut, limpiarRut } from "../lib/rut";
import { obtenerValorUF, obtenerValorUSD, convertirCLPaUF, convertirUFaCLP } from "../lib/uf";

console.log("=== PROBANDO HELPERS DE LOCALIZACIÓN CHILENA ===");

// 1. Probar RUT
const ruts = [
  { raw: "12.345.678-5", valido: true },
  { raw: "60.910.000-1", valido: true }, // Universidad de Chile
  { raw: "61.704.000-K", valido: true }, // Codelco
  { raw: "90.160.000-7", valido: true }, // Falabella
  { raw: "12345678-9", valido: false }, // Inválido
  { raw: "60.910.000-K", valido: false }, // Inválido
];

console.log("\n--- Pruebas de RUT (Módulo 11) ---");
for (const r of ruts) {
  const clean = limpiarRut(r.raw);
  const isValid = validarRut(r.raw);
  const formatted = formatearRut(r.raw);
  console.log(`RUT: ${r.raw.padEnd(15)} | Limpio: ${clean.padEnd(10)} | Formateado: ${formatted.padEnd(12)} | Válido: ${isValid} (Esperado: ${r.valido})`);
  if (isValid !== r.valido) {
    console.error(`❌ ERROR: Validación incorrecta para ${r.raw}`);
  } else {
    console.log(`✅ OK`);
  }
}

// 2. Probar UF y USD
console.log("\n--- Pruebas de UF e Indexación Histórica (2025-2026) ---");
const fechas = [
  new Date(2025, 0, 1),   // 1 Enero 2025
  new Date(2025, 4, 15),  // 15 Mayo 2025
  new Date(2025, 11, 31), // 31 Diciembre 2025
  new Date(2026, 5, 1),   // 1 Junio 2026
];

for (const f of fechas) {
  const uf = obtenerValorUF(f);
  const usd = obtenerValorUSD(f);
  const clpToUF = convertirCLPaUF(1000000, f);
  const ufToCLP = convertirUFaCLP(10, f);
  
  console.log(`Fecha: ${f.toLocaleDateString("es-CL")} | UF: $${uf.toLocaleString("es-CL")} | USD: $${usd.toLocaleString("es-CL")}`);
  console.log(`   $1.000.000 CLP a UF = ${clpToUF} UF`);
  console.log(`   10 UF a CLP         = $${ufToCLP.toLocaleString("es-CL")} CLP`);
}

console.log("\n=== PRUEBAS COMPLETADAS ===");
