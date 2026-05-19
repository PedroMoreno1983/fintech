import { cn } from "@/lib/utils";
import { Spark } from "./spark";

type DeltaTone = "up" | "down" | "flat";

type KpiProps = {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  deltaTone?: DeltaTone;
  deltaLabel?: string;
  spark?: number[];
  sparkColor?: string;
  className?: string;
};

const toneColor: Record<DeltaTone, string> = {
  up: "var(--color-success)",
  down: "var(--color-danger)",
  flat: "var(--color-fg3)",
};

export function Kpi({
  label,
  value,
  unit,
  delta,
  deltaTone = "flat",
  deltaLabel = "vs. semana",
  spark,
  sparkColor,
  className,
}: KpiProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]",
        className
      )}
    >
      <div className="text-[10.5px] font-medium uppercase tracking-[0.04em] text-[var(--color-fg3)]">
        {label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className="tnum text-2xl font-semibold leading-none tracking-tight text-[var(--color-fg1)]"
          style={{ letterSpacing: "-0.02em" }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-xs text-[var(--color-fg3)]">{unit}</span>
        )}
      </div>
      <div className="mt-0.5 flex items-center gap-2">
        {delta && (
          <span
            className="tnum text-[11px] font-medium"
            style={{ color: toneColor[deltaTone] }}
          >
            {delta}
          </span>
        )}
        <span className="text-[11px] text-[var(--color-fg4)]">
          {deltaLabel}
        </span>
      </div>
      {spark && spark.length > 1 && (
        <div className="mt-1">
          <Spark data={spark} color={sparkColor ?? "var(--color-primary)"} />
        </div>
      )}
    </div>
  );
}
