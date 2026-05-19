"use client";

import { useEffect, useEffectEvent } from "react";
import { toast } from "sonner";

type ActionFeedbackState = {
  success?: boolean;
  message?: string;
};

type UseActionFeedbackOptions = {
  successMessage?: string;
  onSuccess?: () => void;
};

export function useActionFeedback(
  state: ActionFeedbackState,
  options: UseActionFeedbackOptions = {}
) {
  const handleSuccess = useEffectEvent(() => {
    if (options.successMessage) {
      toast.success(options.successMessage);
    }
    options.onSuccess?.();
  });

  const handleError = useEffectEvent(() => {
    if (state.message) {
      toast.error(state.message);
    }
  });

  useEffect(() => {
    if (state.success) {
      const timeoutId = window.setTimeout(() => {
        handleSuccess();
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    handleError();
  }, [state]);
}
