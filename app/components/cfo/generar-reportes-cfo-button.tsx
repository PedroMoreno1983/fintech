"use client";

import { useActionState, type ComponentProps } from "react";
import { FileBarChart, Loader2 } from "lucide-react";
import { generarReportesCfo } from "@/app/actions/cfo";
import { Button } from "@/app/components/ui/button";
import { useActionFeedback } from "@/app/components/ui/use-action-feedback";

const initialState = { errors: {}, success: false };

type Props = {
  label?: string;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
};

export function GenerarReportesCfoButton({
  label = "Generar reportes",
  variant = "outline",
  size = "sm",
}: Props) {
  const [state, formAction, isPending] = useActionState(
    generarReportesCfo,
    initialState
  );

  useActionFeedback(state, {
    successMessage: "Reportes CFO generados",
  });

  return (
    <form action={formAction}>
      <Button type="submit" size={size} variant={variant} disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generando...
          </>
        ) : (
          <>
            <FileBarChart className="h-4 w-4" />
            {label}
          </>
        )}
      </Button>
    </form>
  );
}
