import * as React from "react";
import { cn } from "@/lib/utils";

const SectionCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]",
      className
    )}
    {...props}
  />
));
SectionCard.displayName = "SectionCard";

type SectionHeaderProps = Omit<React.HTMLAttributes<HTMLDivElement>, "title"> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
};

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, title, description, actions, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3",
        className
      )}
      {...props}
    >
      {(title || description) && (
        <div className="min-w-0 flex-1">
          {title && (
            <div className="text-[13px] font-semibold leading-tight text-[var(--color-fg1)]">
              {title}
            </div>
          )}
          {description && (
            <div className="mt-0.5 text-[11px] leading-tight text-[var(--color-fg3)]">
              {description}
            </div>
          )}
        </div>
      )}
      {children}
      {actions && (
        <div className="ml-auto flex items-center gap-1.5">{actions}</div>
      )}
    </div>
  )
);
SectionHeader.displayName = "SectionHeader";

const SectionBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4", className)} {...props} />
));
SectionBody.displayName = "SectionBody";

export { SectionCard, SectionHeader, SectionBody };
