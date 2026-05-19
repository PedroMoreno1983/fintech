import { cn } from "@/lib/utils";
import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  className,
}: StatCardProps) {
  const TrendIcon = trend?.positive === false ? TrendingDown : TrendingUp;

  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] transition-colors hover:bg-[var(--color-surface-hover)]",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-[var(--color-fg3)]">
            {title}
          </p>
          <p className="tnum mt-2 text-2xl font-semibold leading-none text-[var(--color-fg1)]">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-[var(--color-fg3)]">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                "tnum mt-2 inline-flex items-center gap-1 text-xs font-medium",
                trend.positive !== false
                  ? "text-[var(--color-success)]"
                  : "text-[var(--color-danger)]"
              )}
            >
              <TrendIcon className="h-3 w-3" />
              {trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div
          className={cn(
            "ml-3 shrink-0 rounded-md p-2",
            iconBg ?? "bg-[var(--color-primary-tint)]"
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5",
              iconColor ?? "text-[var(--color-primary)]"
            )}
          />
        </div>
      </div>
    </div>
  );
}
