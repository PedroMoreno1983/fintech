"use client";

import Link from "next/link";
import { useActionState, useRef, useState, type ComponentProps } from "react";
import { Download, FileUp, Loader2 } from "lucide-react";
import { importarAsientosCfoCsv } from "@/app/actions/cfo";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { useActionFeedback } from "@/app/components/ui/use-action-feedback";

const initialState = { errors: {}, success: false };

type Props = {
  label?: string;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
};

export function ImportarCfoCsvDialog({
  label = "Importar asientos",
  variant = "outline",
  size = "sm",
}: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    importarAsientosCfoCsv,
    initialState
  );

  useActionFeedback(state, {
    successMessage: "Importacion CFO completada",
    onSuccess: () => {
      formRef.current?.reset();
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={size} variant={variant}>
          <FileUp className="h-4 w-4" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar asientos CFO</DialogTitle>
        </DialogHeader>

        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-[var(--color-fg1)]">
                CSV de mayor contable o comprobantes
              </p>
              <Badge variant="secondary">Debe = Haber</Badge>
            </div>
            <p className="mt-2 text-sm text-[var(--color-fg3)]">
              Cada fila representa una linea contable. El importador agrupa por
              sociedad, periodo, numero y fecha para crear asientos auditables.
            </p>
            <Link
              href="/templates/cfo-asientos.csv"
              target="_blank"
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              <Download className="h-4 w-4" />
              Descargar plantilla sugerida
            </Link>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-fg2)]">
              Archivo CSV *
            </label>
            <input
              name="archivo"
              type="file"
              accept=".csv,text/csv"
              className="block w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-fg2)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--color-primary-tint)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[var(--color-primary)] hover:file:opacity-90"
            />
            {state.errors?.archivo && (
              <p className="mt-1 text-sm text-[var(--color-danger)]">
                {state.errors.archivo[0]}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-dashed border-[var(--color-border-strong)] p-4 text-sm text-[var(--color-fg3)]">
            <p className="font-medium text-[var(--color-fg1)]">
              Encabezados aceptados
            </p>
            <p className="mt-2">
              `sociedadCodigo`, `periodo`, `fecha`, `numero`, `cuentaCodigo`,
              `debito`, `credito`, `glosa`, `terceroRut`, `terceroNombre`,
              `documentoTipo`, `documentoFolio`, `moneda`.
            </p>
            <p className="mt-2">
              Si no viene `sociedadCodigo`, usa MATRIZ. Si no viene `periodo`, lo
              infiere desde la fecha. Las cuentas deben existir en el plan CFO.
            </p>
          </div>

          {state.message && (
            <div
              className={`rounded-lg px-3 py-2 text-sm ${
                state.success
                  ? "border border-[var(--color-success)]/25 bg-[var(--color-success-soft)] text-[var(--color-success)]"
                  : "border border-[var(--color-danger)]/25 bg-[var(--color-danger-soft)] text-[var(--color-danger)]"
              }`}
            >
              {state.message}
            </div>
          )}

          <Button type="submit" disabled={isPending} className="h-12 w-full">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <FileUp className="h-4 w-4" />
                Importar CSV
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
