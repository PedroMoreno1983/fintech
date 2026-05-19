import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 h-5 text-[11px] font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-primary-tint)] text-[var(--color-primary)]",
        secondary: "bg-[var(--color-surface-muted)] text-[var(--color-fg2)]",
        destructive: "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
        warning: "bg-[var(--color-warn-soft)] text-[var(--color-warn)]",
        info: "bg-[var(--color-info-soft)] text-[var(--color-info)]",
        success: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
        outline: "border border-[var(--color-border-strong)] text-[var(--color-fg2)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
