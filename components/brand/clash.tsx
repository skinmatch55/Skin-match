import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Two product pills joined by a dashed line with a ✕ (clash) or ✓ (good) node. Signature element #2. */
export function ClashLink({
  a,
  b,
  kind = "clash",
  className,
}: {
  a: string;
  b: string;
  kind?: "clash" | "caution" | "good";
  className?: string;
}) {
  const color = kind === "good" ? "var(--color-lime-deep)" : kind === "caution" ? "var(--color-amber)" : "var(--color-clash)";
  return (
    <div className={cn("flex items-center gap-0", className)}>
      <span className="min-w-0 max-w-[42%] rounded-2xl border border-line bg-white px-3 py-1.5 text-[13px] font-medium leading-tight text-ink shadow-sm line-clamp-2">
        {a}
      </span>
      <span className="relative mx-1 flex min-w-8 flex-1 items-center">
        <span className="h-0 w-full border-t-2 border-dashed" style={{ borderColor: color, opacity: 0.55 }} />
        <span
          className={cn(
            "absolute left-1/2 top-1/2 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full ring-4 ring-white",
            kind === "good" ? "bg-lime text-ink" : "text-white",
          )}
          style={kind === "good" ? undefined : { background: color }}
        >
          {kind === "good" ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <X className="h-3.5 w-3.5" strokeWidth={3} />}
        </span>
      </span>
      <span className="min-w-0 max-w-[42%] rounded-2xl border border-line bg-white px-3 py-1.5 text-[13px] font-medium leading-tight text-ink shadow-sm line-clamp-2">
        {b}
      </span>
    </div>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    avoid: { label: "Cancel each other out", cls: "bg-clash-soft text-clash" },
    separate: { label: "Never together", cls: "bg-clash-soft text-clash" },
    caution: { label: "Go easy", cls: "bg-amber-soft text-amber" },
  };
  const m = map[severity] ?? map.caution;
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold", m.cls)}>{m.label}</span>;
}

/** Progress ring with lime stroke. */
export function Ring({ value, size = 96, stroke = 8, children }: { value: number; size?: number; stroke?: number; children?: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--color-line)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--color-ink)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(100, Math.max(0, value)) / 100)}
          style={{ transition: "stroke-dashoffset 300ms ease-out" }}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--color-lime)"
          strokeWidth={stroke - 4}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(100, Math.max(0, value)) / 100)}
          style={{ transition: "stroke-dashoffset 300ms ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}
