/**
 * Utilidades para el manejo de RUT (Rol Único Tributario) chileno
 */

/**
 * Limpia un RUT eliminando puntos, guiones y espacios, convirtiendo la K a mayúscula.
 */
export function limpiarRut(rut: string): string {
  if (!rut) return "";
  return rut.replace(/[^0-9kK]/g, "").toUpperCase();
}

/**
 * Valida un RUT chileno usando el algoritmo de Módulo 11.
 */
export function validarRut(rut: string): boolean {
  if (!rut || typeof rut !== "string") return false;

  const rutLimpio = limpiarRut(rut);
  if (rutLimpio.length < 8 || rutLimpio.length > 9) return false;

  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);

  // Validar que el cuerpo sea solo números
  if (!/^[0-9]+$/.test(cuerpo)) return false;

  return calcularDv(cuerpo) === dv;
}

/**
 * Calcula el dígito verificador para un cuerpo de RUT dado.
 */
export function calcularDv(cuerpo: string): string {
  let suma = 0;
  let multiplicador = 2;

  // Recorrer el cuerpo de derecha a izquierda
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i), 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = 11 - (suma % 11);
  if (resto === 11) return "0";
  if (resto === 10) return "K";
  return resto.toString();
}

/**
 * Formatea un RUT a su representación estándar: 12.345.678-9 o 1.234.567-8.
 */
export function formatearRut(rut: string): string {
  const rutLimpio = limpiarRut(rut);
  if (!rutLimpio) return "";

  if (rutLimpio.length < 2) return rutLimpio;

  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);

  // Formatear cuerpo con puntos
  let cuerpoFormateado = "";
  let cont = 0;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    cuerpoFormateado = cuerpo.charAt(i) + cuerpoFormateado;
    cont++;
    if (cont === 3 && i !== 0) {
      cuerpoFormateado = "." + cuerpoFormateado;
      cont = 0;
    }
  }

  return `${cuerpoFormateado}-${dv}`;
}
