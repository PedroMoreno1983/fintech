import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <div className="mb-4 rounded-lg bg-[var(--color-surface-muted)] p-4">
        <Icon className="h-8 w-8 text-[var(--color-fg4)]" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-[var(--color-fg1)]">
        {title}
      </h3>
      {description && (
        <p className="mb-4 max-w-sm text-sm leading-6 text-[var(--color-fg3)]">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
