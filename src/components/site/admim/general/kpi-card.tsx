// src/components/admin/dashboard/kpi-card.tsx
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface KpiCardProps {
  label: string;
  value: number | string;
  hint?: string;
  icon: LucideIcon;
  tone?: "default" | "primary" | "warning" | "destructive" | "muted";
}

const toneClasses: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  default: "text-foreground",
  primary: "text-primary",
  warning: "text-amber-500",
  destructive: "text-destructive",
  muted: "text-muted-foreground",
};

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: KpiCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <p
            className={cn(
              "mt-2 font-serif text-3xl font-semibold leading-none tracking-tight tabular-nums sm:text-4xl",
              toneClasses[tone],
            )}
          >
            {value}
          </p>
          {hint && (
            <p className="mt-2 text-[11px] text-muted-foreground">{hint}</p>
          )}
        </div>

        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full",
            "border border-border bg-muted/40",
            toneClasses[tone],
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}