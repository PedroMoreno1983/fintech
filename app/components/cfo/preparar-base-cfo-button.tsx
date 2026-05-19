"use client";

import { useActionState, type ComponentProps } from "react";
import { Building2, Loader2 } from "lucide-react";
import { prepararBaseCfo } from "@/app/actions/cfo";
import { Button } from "@/app/components/ui/button";
import { useActionFeedback } from "@/app/components/ui/use-action-feedback";

const initialState = { errors: {}, success: false };

type Props = {
  label?: string;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
};

export function PrepararBaseCfoButton({
  label = "Preparar base CFO",
  variant = "default",
  size = "sm",
}: Props) {
  const [state, formAction, isPending] = useActionState(
    prepararBaseCfo,
    initialState
  );

  useActionFeedback(state, {
    successMessage: "Base CFO preparada",
  });

  return (
    <form action={formAction}>
      <Button type="submit" size={size} variant={variant} disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Preparando...
          </>
        ) : (
          <>
            <Building2 className="h-4 w-4" />
            {label}
          </>
        )}
      </Button>
    </form>
  );
}
