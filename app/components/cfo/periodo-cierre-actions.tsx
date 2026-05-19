"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Lock, RotateCcw, ShieldCheck } from "lucide-react";
import { cambiarCierrePeriodoCfo } from "@/app/actions/cfo";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { useActionFeedback } from "@/app/components/ui/use-action-feedback";

const initialState = { errors: {}, success: false };

type Props = {
  estado: string;
  listoParaIniciar: boolean;
  listoParaCerrar: boolean;
};

type ActionConfig = {
  value: string;
  label: string;
  icon: typeof ShieldCheck;
  disabled?: boolean;
  variant?: "default" | "outline" | "secondary" | "destructive" | "warning";
};

function getActions({
  estado,
  listoParaIniciar,
  listoParaCerrar,
}: Props): ActionConfig[] {
  if (estado === "ABIERTO") {
    return [
      {
        value: "iniciar_cierre",
        label: "Iniciar cierre",
        icon: ShieldCheck,
        disabled: !listoParaIniciar,
      },
    ];
  }

  if (estado === "EN_CIERRE") {
    return [
      {
        value: "cerrar",
        label: "Cerrar periodo",
        icon: CheckCircle2,
        disabled: !listoParaCerrar,
      },
      {
        value: "reabrir",
        label: "Volver a abierto",
        icon: RotateCcw,
        variant: "outline",
      },
    ];
  }

  if (estado === "CERRADO") {
    return [
      {
        value: "bloquear",
        label: "Bloquear definitivo",
        icon: Lock,
        variant: "warning",
      },
      {
        value: "reabrir",
        label: "Reabrir",
        icon: RotateCcw,
        variant: "outline",
      },
    ];
  }

  return [];
}

export function PeriodoCierreActions(props: Props) {
  const [state, formAction, isPending] = useActionState(
    cambiarCierrePeriodoCfo,
    initialState
  );

  useActionFeedback(state, {
    successMessage: "Cierre financiero actualizado",
  });

  const actions = getActions(props);

  if (actions.length === 0) {
    return null;
  }

  return (
    <form action={formAction} className="space-y-3">
      <Textarea
        name="comentario"
        label="Comentario de cierre"
        placeholder="Salvedades, ajustes pendientes o motivo de reapertura"
        error={state.errors?.comentario?.[0]}
      />
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.value}
              type="submit"
              name="accion"
              value={action.value}
              size="sm"
              variant={action.variant}
              disabled={isPending || action.disabled}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              {action.label}
            </Button>
          );
        })}
      </div>
    </form>
  );
}
