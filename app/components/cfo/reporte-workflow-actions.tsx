"use client";

import { useActionState } from "react";
import {
  Archive,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Send,
  Undo2,
  XCircle,
} from "lucide-react";
import {
  cambiarEstadoReporteCfo,
  comentarReporteCfo,
} from "@/app/actions/cfo";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { useActionFeedback } from "@/app/components/ui/use-action-feedback";

const initialState = { errors: {}, success: false };

type WorkflowAction = {
  value: string;
  label: string;
  icon: typeof Send;
  variant?: "default" | "outline" | "secondary" | "destructive" | "warning";
};

type Props = {
  reporteId: string;
  estado: string;
};

function getActions(estado: string): WorkflowAction[] {
  if (estado === "BORRADOR" || estado === "GENERADO") {
    return [
      {
        value: "solicitar_revision",
        label: "Enviar a revision",
        icon: Send,
        variant: "default",
      },
    ];
  }

  if (estado === "EN_REVISION") {
    return [
      {
        value: "aprobar",
        label: "Aprobar",
        icon: CheckCircle2,
        variant: "default",
      },
      {
        value: "rechazar",
        label: "Rechazar",
        icon: XCircle,
        variant: "destructive",
      },
    ];
  }

  if (estado === "APROBADO") {
    return [
      {
        value: "publicar",
        label: "Publicar",
        icon: CheckCircle2,
        variant: "default",
      },
      {
        value: "archivar",
        label: "Archivar",
        icon: Archive,
        variant: "outline",
      },
    ];
  }

  if (estado === "PUBLICADO") {
    return [
      {
        value: "archivar",
        label: "Archivar",
        icon: Archive,
        variant: "outline",
      },
    ];
  }

  if (estado === "ARCHIVADO") {
    return [
      {
        value: "reabrir",
        label: "Reabrir",
        icon: Undo2,
        variant: "secondary",
      },
    ];
  }

  return [];
}

export function CfoReporteWorkflowActions({ reporteId, estado }: Props) {
  const [workflowState, workflowAction, workflowPending] = useActionState(
    cambiarEstadoReporteCfo,
    initialState
  );
  const [commentState, commentAction, commentPending] = useActionState(
    comentarReporteCfo,
    initialState
  );

  useActionFeedback(workflowState, {
    successMessage: "Flujo de aprobacion actualizado",
  });
  useActionFeedback(commentState, {
    successMessage: "Comentario agregado",
  });

  const actions = getActions(estado);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Gobierno del reporte
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <form action={workflowAction} className="space-y-3">
          <input type="hidden" name="reporteId" value={reporteId} />
          <Textarea
            name="comentario"
            label="Comentario de decision"
            placeholder="Motivo, salvedad o instruccion para el cierre financiero"
            error={workflowState.errors?.comentario?.[0]}
          />
          <div className="flex flex-wrap gap-2">
            {actions.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.value}
                  type="submit"
                  name="accion"
                  value={item.value}
                  size="sm"
                  variant={item.variant}
                  disabled={workflowPending}
                >
                  {workflowPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  {item.label}
                </Button>
              );
            })}
          </div>
        </form>

        <form action={commentAction} className="space-y-3 border-t border-[var(--color-border)] pt-4">
          <input type="hidden" name="reporteId" value={reporteId} />
          <Input
            name="titulo"
            label="Titulo del comentario"
            placeholder="Analisis ejecutivo"
          />
          <Textarea
            name="contenido"
            label="Comentario financiero"
            placeholder="Lectura de desviaciones, riesgos, supuestos o decisiones pendientes"
            error={commentState.errors?.contenido?.[0]}
          />
          <Button type="submit" size="sm" variant="outline" disabled={commentPending}>
            {commentPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MessageSquare className="h-4 w-4" />
            )}
            Agregar comentario
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
