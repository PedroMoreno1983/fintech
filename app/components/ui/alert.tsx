import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

const alertIcons = {
  default: Info,
  destructive: XCircle,
  success: CheckCircle,
  warning: AlertTriangle,
};

const alertStyles: Record<keyof typeof alertIcons, string> = {
  default:
    "bg-[var(--color-info-soft)] border-[var(--color-info-soft)] text-[var(--color-info)]",
  destructive:
    "bg-[var(--color-danger-soft)] border-[var(--color-danger-soft)] text-[var(--color-danger)]",
  success:
    "bg-[var(--color-success-soft)] border-[var(--color-success-soft)] text-[var(--color-success)]",
  warning:
    "bg-[var(--color-warn-soft)] border-[var(--color-warn-soft)] text-[var(--color-warn)]",
};

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof alertStyles;
  title?: string;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", title, children, ...props }, ref) => {
    const Icon = alertIcons[variant];
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-md border p-4",
          alertStyles[variant],
          className
        )}
        {...props}
      >
        <div className="flex gap-3">
          <Icon className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            {title && <p className="font-medium mb-1">{title}</p>}
            <div className="text-sm">{children}</div>
          </div>
        </div>
      </div>
    );
  }
);
Alert.displayName = "Alert";

export { Alert };
