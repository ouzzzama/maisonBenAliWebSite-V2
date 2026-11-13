import * as React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  trend,
  icon,
  tone = "plain",
}: {
  label: string;
  value: string;
  hint?: string;
  trend?: { value: string; positive?: boolean };
  icon?: React.ReactNode;
  tone?: "plain" | "coral" | "ink" | "green";
}) {
  const tones: Record<string, string> = {
    plain: "bg-white border-ink/8 text-ink",
    coral: "bg-coral text-white border-coral",
    ink: "bg-ink text-white border-ink",
    green: "bg-[#15483d] text-white border-[#15483d]",
  };
  const soft = tone === "plain" ? "text-muted" : "text-white/65";
  const head = tone === "plain" ? "text-ink/55" : "text-white/75";

  return (
    <div
      className={cn(
        "rounded-3xl border p-4 shadow-[0_2px_10px_rgba(18,43,67,0.04)] sm:p-5",
        tones[tone]
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={cn("text-[10.5px] font-semibold uppercase tracking-[0.12em]", head)}>
          {label}
        </p>
        {icon ? (
          <span
            className={cn(
              "grid size-8 place-items-center rounded-xl",
              tone === "plain" ? "bg-ink/5 text-ink/60" : "bg-white/15 text-white"
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-[26px] font-semibold leading-none tracking-[-0.03em] sm:text-[28px]">
        {value}
      </p>
      <div className="mt-2 flex items-center gap-2">
        {trend ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold",
              tone === "plain"
                ? trend.positive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
                : "bg-white/18 text-white"
            )}
          >
            {trend.positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {trend.value}
          </span>
        ) : null}
        {hint ? <span className={cn("text-[11px]", soft)}>{hint}</span> : null}
      </div>
    </div>
  );
}
