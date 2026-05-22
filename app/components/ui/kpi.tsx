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
  isLive?: boolean;
};

const toneColor: Record<DeltaTone, string> = {
  up: "var(--color-success)",
  down: "var(--color-danger)",
  flat: "var(--color-fg3)",
};

const toneBg: Record<DeltaTone, string> = {
  up: "rgba(16, 185, 129, 0.08)",
  down: "rgba(239, 68, 68, 0.08)",
  flat: "var(--color-surface-alt)",
};

export function Kpi({
  label,
  value,
  unit,
  delta,
  deltaTone = "flat",
  deltaLabel = "vs. periodo anterior",
  spark,
  sparkColor,
  className,
  isLive = true,
}: KpiProps) {
  return (
    <div
      className={cn(
        "premium-card group flex min-w-0 flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] hover:border-[var(--color-primary-hover)]/30 relative overflow-hidden",
        className
      )}
    >
      {/* Dynamic top gradient strip */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--color-fg3)]">
          {label}
        </span>
        {isLive && (
          <div className="flex items-center gap-1.5" title="Sincronizado en tiempo real">
            <span className="live-indicator" />
            <span className="text-[9px] font-bold text-[var(--color-fg4)] uppercase tracking-wider">Live</span>
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1">
        <span
          className="tnum text-3xl font-bold leading-none tracking-tight text-[var(--color-fg1)]"
          style={{ letterSpacing: "-0.03em" }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-sm font-semibold text-[var(--color-fg3)] ml-0.5">{unit}</span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 mt-2">
        <div className="flex items-center gap-1.5">
          {delta && (
            <span
              className="tnum rounded-md px-1.5 py-0.5 text-[10px] font-bold"
              style={{ color: toneColor[deltaTone], backgroundColor: toneBg[deltaTone] }}
            >
              {deltaTone === "up" && "+"}
              {delta}
            </span>
          )}
          <span className="text-[11px] font-medium text-[var(--color-fg3)] truncate max-w-[120px] sm:max-w-none">
            {deltaLabel}
          </span>
        </div>

        {spark && spark.length > 1 && (
          <div className="w-20 shrink-0 transition-transform duration-300 group-hover:scale-105">
            <Spark data={spark} color={sparkColor ?? "var(--color-primary)"} height={16} />
          </div>
        )}
      </div>
    </div>
  );
}
