import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "info" | "warn" | "danger" | "success" | "neutral";

const toneBg: Record<Tone, string> = {
  primary: "var(--color-primary-tint)",
  info: "var(--color-info-soft)",
  warn: "var(--color-warn-soft)",
  danger: "var(--color-danger-soft)",
  success: "var(--color-success-soft)",
  neutral: "var(--color-surface-muted)",
};
const toneFg: Record<Tone, string> = {
  primary: "var(--color-primary)",
  info: "var(--color-info)",
  warn: "var(--color-warn)",
  danger: "var(--color-danger)",
  success: "var(--color-success)",
  neutral: "var(--color-fg2)",
};

export function RowIcon({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-md",
        className
      )}
      style={{ background: toneBg[tone], color: toneFg[tone] }}
    >
      {children}
    </span>
  );
}

const ListRow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    divided?: boolean;
  }
>(({ className, divided = true, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-3 px-4 py-3",
      divided &&
        "border-b border-[var(--color-border-light)] last:border-b-0",
      className
    )}
    {...props}
  />
));
ListRow.displayName = "ListRow";

export { ListRow };
