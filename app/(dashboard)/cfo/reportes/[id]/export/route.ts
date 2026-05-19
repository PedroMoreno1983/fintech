import { db } from "@/lib/db";
import { requireEmpresaSession } from "@/lib/session";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

function sanitizeFilename(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function escapeCsvValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (!/[",\n\r]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function formatEstado(value: string) {
  return value.replace(/_/g, " ").toLowerCase();
}

function decimalToString(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value);
}

export async function GET(_request: Request, { params }: RouteProps) {
  const session = await requireEmpresaSession();
  const { id } = await params;

  const reporte = await db.cfoReporte.findFirst({
    where: { id, empresaId: session.empresaId },
    include: {
      periodo: true,
      generadoPor: { select: { nombre: true, email: true } },
      aprobadoPor: { select: { nombre: true, email: true } },
      consolidacion: { select: { version: true, estado: true } },
      lineas: {
        orderBy: [{ orden: "asc" }, { etiqueta: "asc" }],
        include: {
          cuenta: { select: { codigo: true, nombre: true, tipo: true } },
          sociedad: { select: { codigo: true, razonSocial: true } },
        },
      },
    },
  });

  if (!reporte) {
    return new Response("Reporte no encontrado", { status: 404 });
  }

  const rows: string[] = [];
  const append = (
    section: string,
    item: string,
    value: string | number | null | undefined
  ) => {
    rows.push([section, item, value].map(escapeCsvValue).join(","));
  };

  rows.push(["seccion", "item", "valor"].map(escapeCsvValue).join(","));
  append("reporte", "id", reporte.id);
  append("reporte", "nombre", reporte.nombre);
  append("reporte", "tipo", formatEstado(reporte.tipo));
  append("reporte", "estado", formatEstado(reporte.estado));
  append("reporte", "version", reporte.version);
  append("reporte", "moneda", reporte.moneda);
  append("periodo", "codigo", reporte.periodo.codigo);
  append("periodo", "fechaInicio", reporte.periodo.fechaInicio.toISOString());
  append("periodo", "fechaFin", reporte.periodo.fechaFin.toISOString());
  append("control", "generadoPor", reporte.generadoPor.nombre);
  append("control", "generadoPorEmail", reporte.generadoPor.email ?? "");
  append("control", "generadoAt", reporte.createdAt.toISOString());
  append("control", "aprobadoPor", reporte.aprobadoPor?.nombre ?? "");
  append("control", "aprobadoPorEmail", reporte.aprobadoPor?.email ?? "");
  append("control", "aprobadoAt", reporte.aprobadoAt?.toISOString() ?? "");
  append(
    "consolidacion",
    "version",
    reporte.consolidacion ? reporte.consolidacion.version : ""
  );
  append(
    "consolidacion",
    "estado",
    reporte.consolidacion ? formatEstado(reporte.consolidacion.estado) : ""
  );

  rows.push("");
  rows.push(
    [
      "linea",
      "cuentaCodigo",
      "cuentaNombre",
      "cuentaTipo",
      "sociedadCodigo",
      "sociedadNombre",
      "etiqueta",
      "montoActual",
      "montoComparativo",
      "variacion",
      "variacionPct",
    ]
      .map(escapeCsvValue)
      .join(",")
  );

  reporte.lineas.forEach((linea) => {
    rows.push(
      [
        linea.orden,
        linea.cuenta?.codigo ?? "",
        linea.cuenta?.nombre ?? "",
        linea.cuenta?.tipo ?? "",
        linea.sociedad?.codigo ?? "",
        linea.sociedad?.razonSocial ?? "",
        linea.etiqueta,
        decimalToString(linea.montoActual),
        decimalToString(linea.montoComparativo),
        decimalToString(linea.variacion),
        decimalToString(linea.variacionPct),
      ]
        .map(escapeCsvValue)
        .join(",")
    );
  });

  const filename = `${sanitizeFilename(
    `cfo-${reporte.tipo}-${reporte.periodo.codigo}-v${reporte.version}-${reporte.id}`
  )}.csv`;

  return new Response(`\uFEFF${rows.join("\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
