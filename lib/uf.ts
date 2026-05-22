/**
 * Utilidades para el manejo de UF (Unidad de Fomento) y USD (Dólar) chileno.
 * Proporciona valores históricos y proyectados deterministas para 2025 y 2026.
 */

// Valores base mensuales aproximados para la UF
// Permite calcular un valor diario interpolado linealmente
const UF_MESES: Record<number, Record<number, number>> = {
  2025: {
    1: 38100, // Enero
    2: 38220,
    3: 38350,
    4: 38480,
    5: 38600,
    6: 38710,
    7: 38830,
    8: 38950,
    9: 39080,
    10: 39200,
    11: 39320,
    12: 39450,
  },
  2026: {
    1: 39580,
    2: 39700,
    3: 39830,
    4: 39950,
    5: 40080,
    6: 40200,
    7: 40320,
    8: 40450,
    9: 40580,
    10: 40700,
    11: 40830,
    12: 40950,
  }
};

// Valor base del Dólar por mes (con variaciones diarias simuladas)
const USD_MESES: Record<number, Record<number, number>> = {
  2025: {
    1: 915,
    2: 922,
    3: 935,
    4: 942,
    5: 930,
    6: 948,
    7: 955,
    8: 962,
    9: 950,
    10: 940,
    11: 945,
    12: 958,
  },
  2026: {
    1: 960,
    2: 952,
    3: 965,
    4: 978,
    5: 970,
    6: 962,
    7: 958,
    8: 964,
    9: 972,
    10: 980,
    11: 975,
    12: 985,
  }
};

/**
 * Obtiene el valor de la UF para una fecha específica.
 * Si no está dentro de los años soportados, retorna un valor por defecto razonable.
 */
export function obtenerValorUF(fecha: Date = new Date()): number {
  const anio = fecha.getFullYear();
  const mes = fecha.getMonth() + 1; // 1-12
  const dia = fecha.getDate();

  // Validar rango soportado
  const anioValido = anio === 2025 || anio === 2026 ? anio : (anio < 2025 ? 2025 : 2026);
  const mesValido = mes;

  const baseActual = UF_MESES[anioValido][mesValido];
  
  // Para interpolar linealmente, buscamos el valor del siguiente mes
  let baseSiguiente = baseActual;
  if (mesValido === 12) {
    baseSiguiente = UF_MESES[anioValido === 2025 ? 2026 : 2026][anioValido === 2025 ? 1 : 12];
  } else {
    baseSiguiente = UF_MESES[anioValido][mesValido + 1];
  }

  // Interpolar de acuerdo al día del mes (asumiendo 30.5 días promedio)
  const factor = (dia - 1) / 30;
  const valorUF = baseActual + (baseSiguiente - baseActual) * factor;

  return Math.round(valorUF * 100) / 100;
}

/**
 * Obtiene el valor del USD para una fecha específica con variaciones diarias de mercado.
 */
export function obtenerValorUSD(fecha: Date = new Date()): number {
  const anio = fecha.getFullYear();
  const mes = fecha.getMonth() + 1;
  const dia = fecha.getDate();

  const anioValido = anio === 2025 || anio === 2026 ? anio : (anio < 2025 ? 2025 : 2026);
  const baseActual = USD_MESES[anioValido][mes];

  // Simular fluctuación diaria usando el día del mes
  // Esto genera una curva consistente (mismo valor para el mismo día)
  const fluctuacion = Math.sin(dia * 0.5) * 12 + Math.cos(dia * 1.5) * 5;
  const valorUSD = baseActual + fluctuacion;

  return Math.round(valorUSD * 100) / 100;
}

/**
 * Convierte un monto en CLP a UF para una fecha dada.
 */
export function convertirCLPaUF(montoCLP: number, fecha: Date = new Date()): number {
  const valorUF = obtenerValorUF(fecha);
  return Number((montoCLP / valorUF).toFixed(4));
}

/**
 * Convierte un monto en UF a CLP para una fecha dada.
 */
export function convertirUFaCLP(montoUF: number, fecha: Date = new Date()): number {
  const valorUF = obtenerValorUF(fecha);
  return Math.round(montoUF * valorUF);
}

/**
 * Convierte un monto en USD a CLP para una fecha dada.
 */
export function convertirUSDaCLP(montoUSD: number, fecha: Date = new Date()): number {
  const valorUSD = obtenerValorUSD(fecha);
  return Math.round(montoUSD * valorUSD);
}

/**
 * Convierte un monto en CLP a USD para una fecha dada.
 */
export function convertirCLPaUSD(montoCLP: number, fecha: Date = new Date()): number {
  const valorUSD = obtenerValorUSD(fecha);
  return Number((montoCLP / valorUSD).toFixed(2));
}
