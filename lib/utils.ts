import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFecha(date: Date | string | null | undefined): string {
  if (!date) return "-";
  return format(new Date(date), "dd/MM/yyyy", { locale: es });
}

export function formatFechaHora(date: Date | string | null | undefined): string {
  if (!date) return "-";
  return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: es });
}

export function formatRelativo(date: Date | string | null | undefined): string {
  if (!date) return "-";
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
}

export function formatPeso(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "-";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(valor);
}

export function formatNumero(
  valor: number | null | undefined,
  decimales = 1
): string {
  if (valor === null || valor === undefined) return "-";
  return new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(valor);
}

export function formatKg(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "-";
  return `${formatNumero(valor, 0)} kg`;
}

export function toLocalInputDate(date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function toLocalInputDateTime(date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export const ROLES_LABELS: Record<string, string> = {
  SUPERADMIN: "Super Admin",
  EMPRESA_ADMIN: "Administrador",
  ADMIN_CAMPO: "Administrador",
  CAPATAZ: "Supervisor",
  OPERARIO: "Usuario",
  AGRONOMO: "Analista",
  ENCARGADO_PACKING: "Analista",
  ADMIN_FINANZAS: "Finanzas",
  PRESTADOR: "Proveedor",
  CLIENTE: "Cliente",
};

export const TIPO_LABOR_LABELS: Record<string, string> = {
  APLICACION_FITOSANITARIA: "Aplicacion Fitosanitaria",
  FERTILIZACION: "Fertilizacion",
  PODA: "Poda",
  RALEO: "Raleo",
  COSECHA_MANUAL: "Cosecha Manual",
  RIEGO_MANUAL: "Riego Manual",
  MONITOREO_SANITARIO: "Monitoreo Sanitario",
  PREPARACION_SUELO: "Preparacion de Suelo",
  TRASPLANTE: "Trasplante",
  DESHIERBE: "Deshierbe",
  OTRO: "Otro",
};

export const TIPO_RIEGO_LABELS: Record<string, string> = {
  GOTEO: "Goteo",
  ASPERSION: "Aspersion",
  SURCO: "Surco",
  MICROASPERSION: "Microaspersion",
  MANUAL: "Manual",
  OTRO: "Otro",
};

export const MODO_RIEGO_LABELS: Record<string, string> = {
  MANUAL: "Manual",
  AUTOMATICO: "Automatico",
};

export const UNIDAD_COSECHA_DIARIA_LABELS: Record<string, string> = {
  KG: "kg",
  CAJA: "cajas",
  BIN: "bins",
};

export const BSCAN_TIPO_REGISTRO_LABELS: Record<string, string> = {
  INGRESO: "Ingreso",
  MATERIAL_DIRECTO: "Material directo",
  MANO_OBRA_DIRECTA: "Mano de obra directa",
  COSTOS_INDIRECTOS: "Costos indirectos",
  GASTO_OPERACIONAL: "Gasto operacional",
};

export const BSCAN_CENTRO_GASTO_LABELS: Record<string, string> = {
  ADMINISTRACION: "Administracion",
  COMERCIAL: "Comercial",
  LOGISTICA: "Logistica",
  BODEGA: "Bodega",
  SERVICIOS_GENERALES: "Servicios generales",
  OPERACIONES: "Operaciones",
  OTRO: "Otro",
};

export const PROVEEDOR_SENSOR_LABELS: Record<string, string> = {
  GENERICO: "Generico",
  DAVIS: "Davis",
  WISECONN: "WiseConn",
  ESTACION_METEO: "Estacion meteo",
  OTRO: "Otro",
};

export const TIPO_LECTURA_SENSOR_LABELS: Record<string, string> = {
  HUMEDAD_SUELO: "Humedad de suelo",
  TEMPERATURA_AIRE: "Temperatura aire",
  HUMEDAD_AMBIENTE: "Humedad ambiente",
  LLUVIA_MM: "Lluvia",
  VIENTO_KMH: "Viento",
  DIRECCION_VIENTO: "Direccion viento",
  CAUDAL_RIEGO: "Caudal riego",
  PRESION_LINEA: "Presion linea",
  RADIACION_SOLAR: "Radiacion solar",
  ET0: "ET0",
  OTRO: "Otro",
};

export const PROVEEDOR_WHATSAPP_LABELS: Record<string, string> = {
  GENERICO: "Generico",
  META: "Meta",
  TWILIO: "Twilio",
  DIALOG360: "360dialog",
  BOTMAKER: "Botmaker",
  OTRO: "Otro",
};

export const TIPO_SUGERENCIA_WHATSAPP_LABELS: Record<string, string> = {
  GENERAL: "General",
  LABOR: "Labor",
  RIEGO: "Riego",
  SANIDAD: "Sanidad",
  COSECHA: "Cosecha",
  COMERCIAL: "Comercial",
};

export const AMBIENTE_SII_LABELS: Record<string, string> = {
  CERTIFICACION: "Certificacion",
  PRODUCCION: "Produccion",
};

export const SENTIDO_SII_LABELS: Record<string, string> = {
  COMPRA: "Compra",
  VENTA: "Venta",
};

export const FUENTE_CLASIFICACION_SII_LABELS: Record<string, string> = {
  ANY: "Cualquier texto",
  PARTY: "Proveedor o cliente",
  ITEM: "Nombre del item",
  DESCRIPTION: "Descripcion del item",
};

export const CATEGORIA_INSUMO_LABELS: Record<string, string> = {
  FERTILIZANTE: "Fertilizante",
  PESTICIDA: "Pesticida",
  HERBICIDA: "Herbicida",
  FUNGICIDA: "Fungicida",
  SEMILLA: "Semilla",
  COMBUSTIBLE: "Combustible",
  HERRAMIENTA: "Herramienta",
  MATERIAL_EMBALAJE: "Material de Embalaje",
  OTRO: "Otro",
};

export const CATEGORIA_SERVICIO_LABELS: Record<string, string> = {
  FUMIGACION: "Fumigacion",
  COSECHA_MECANIZADA: "Cosecha Mecanizada",
  TRANSPORTE: "Transporte",
  MAQUINARIA: "Maquinaria",
  ASESORIA_TECNICA: "Asesoria Tecnica",
  MANO_OBRA_TEMPORAL: "Mano de Obra Temporal",
  ANALISIS_SUELO: "Analisis de Suelo",
  RIEGO_TECNIFICADO: "Riego Tecnificado",
  OTRO: "Otro",
};

export const TIPO_APLICACION_LABELS: Record<string, string> = {
  FITOSANITARIA: "Fitosanitaria",
  FERTILIZACION_FOLIAR: "Fertilizacion Foliar",
  BIOESTIMULANTE: "Bioestimulante",
  CORRECTOR_CARENCIAL: "Corrector Carencial",
  DESINFECCION: "Desinfeccion",
  OTRO: "Otro",
};

export const METODO_APLICACION_LABELS: Record<string, string> = {
  PULVERIZACION_TERRESTRE: "Pulverizacion Terrestre",
  DRON: "Dron",
  MANUAL: "Manual",
  GOTEO: "Goteo",
  ESPOLVOREO: "Espolvoreo",
  OTRO: "Otro",
};

export const RIESGO_POLINIZADORES_LABELS: Record<string, string> = {
  NO_APLICA: "No aplica",
  BAJO: "Bajo",
  MODERADO: "Moderado",
  ALTO: "Alto",
};

export const ITEM_CUMPLIMIENTO_LABELS: Record<string, string> = {
  hojaSeguridad: "Hoja de seguridad verificada",
  epp: "EPP verificado",
  clima: "Condiciones climaticas confirmadas",
  avisoApicultores: "Aviso a apicultores registrado",
  senaletica: "Senaletica instalada",
};

export const ESTADO_APLICACION_LABELS: Record<string, string> = {
  PLANIFICADA: "Planificada",
  EN_VENTANA: "En ventana",
  EJECUTADA: "Ejecutada",
  CANCELADA: "Cancelada",
};

export const RIESGO_VENTANA_LABELS: Record<string, string> = {
  BAJO: "Bajo",
  MEDIO: "Medio",
  ALTO: "Alto",
  BLOQUEADA: "Bloqueada",
};

export const OUTCOME_MODELO_LABELS: Record<string, string> = {
  FAVORABLE: "Favorable",
  NEUTRO: "Neutro",
  DESFAVORABLE: "Desfavorable",
  INSUFICIENTE: "Insuficiente",
};

export const NIVEL_ALERTA_COLORS: Record<string, string> = {
  INFO: "text-blue-600 bg-blue-50 border-blue-200",
  WARNING: "text-yellow-700 bg-yellow-50 border-yellow-200",
  CRITICAL: "text-red-700 bg-red-50 border-red-200",
};

export const ESTADO_COLORS: Record<string, string> = {
  activo: "bg-green-100 text-green-800",
  inactivo: "bg-gray-100 text-gray-600",
  ACTIVO: "bg-green-100 text-green-800",
  INACTIVO: "bg-gray-100 text-gray-600",
  FINALIZADO: "bg-stone-100 text-stone-700",
  planificada: "bg-blue-100 text-blue-800",
  ejecutada: "bg-green-100 text-green-800",
  cancelada: "bg-red-100 text-red-800",
  en_progreso: "bg-yellow-100 text-yellow-800",
  PLANIFICADA: "bg-blue-100 text-blue-800",
  EN_VENTANA: "bg-emerald-100 text-emerald-800",
  EJECUTADA: "bg-green-100 text-green-800",
  CANCELADA: "bg-red-100 text-red-800",
  abierta: "bg-orange-100 text-orange-800",
  resuelta: "bg-green-100 text-green-800",
  BAJO: "bg-green-100 text-green-800",
  MEDIO: "bg-yellow-100 text-yellow-800",
  ALTO: "bg-orange-100 text-orange-800",
  BLOQUEADA: "bg-red-100 text-red-800",
  FAVORABLE: "bg-green-100 text-green-800",
  NEUTRO: "bg-slate-100 text-slate-700",
  DESFAVORABLE: "bg-red-100 text-red-800",
  INSUFICIENTE: "bg-gray-100 text-gray-600",
};

export const REGIONES_CHILE = [
  "Arica y Parinacota",
  "Tarapaca",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaiso",
  "Metropolitana",
  "O'Higgins",
  "Maule",
  "Nuble",
  "Biobio",
  "La Araucania",
  "Los Rios",
  "Los Lagos",
  "Aysen",
  "Magallanes",
];
