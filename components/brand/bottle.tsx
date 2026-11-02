import type { Category } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

const PALETTES = [
  { body: "#F6E4DD", cap: "#2A1D1A", label: "#FFFFFF" },
  { body: "#EAD2C4", cap: "#B9796A", label: "#FBF7F4" },
  { body: "#FFFFFF", cap: "#9A5D50", label: "#F6E4DD" },
  { body: "#E9EEF2", cap: "#2A1D1A", label: "#FFFFFF" },
  { body: "#F3E7D3", cap: "#7A6660", label: "#FFFFFF" },
  { body: "#EFE0E8", cap: "#4A3833", label: "#FFFFFF" },
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

type Shape = "pump" | "dropper" | "jar" | "tube" | "tall";
function shapeFor(c: Category): Shape {
  switch (c) {
    case "cleanser":
    case "oil_cleanser":
      return "pump";
    case "serum":
    case "treatment":
    case "oil":
      return "dropper";
    case "moisturizer":
    case "mask":
      return "jar";
    case "sunscreen":
    case "eye":
    case "spot":
      return "tube";
    default:
      return "tall";
  }
}

/** A product drawn as a little bottle. Signature element #1. */
export function Bottle({
  category,
  seed,
  className,
  flag,
}: {
  category: Category;
  seed: string;
  className?: string;
  /** "clash" draws a coral ring, "ok" a lime one */
  flag?: "clash" | "ok" | null;
}) {
  const p = PALETTES[hash(seed) % PALETTES.length];
  const shape = shapeFor(category);
  const stroke = "rgba(42,29,26,0.12)";
  return (
    <svg viewBox="0 0 48 72" className={cn("h-16 w-auto drop-shadow-[0_6px_8px_rgba(42,29,26,0.12)]", className)} aria-hidden>
      {flag && (
        <ellipse cx="24" cy="68" rx="18" ry="3.2" fill={flag === "clash" ? "#D2553F" : "#C8FF3D"} opacity={flag === "clash" ? 0.35 : 0.8} />
      )}
      {shape === "pump" && (
        <g>
          <rect x="21" y="2" width="12" height="4" rx="2" fill={p.cap} />
          <rect x="22" y="5" width="4" height="9" fill={p.cap} />
          <rect x="18" y="12" width="12" height="8" rx="2" fill={p.cap} />
          <rect x="11" y="19" width="26" height="49" rx="8" fill={p.body} stroke={stroke} />
          <rect x="14" y="34" width="20" height="20" rx="3" fill={p.label} />
          <rect x="17" y="39" width="14" height="2.2" rx="1" fill={p.cap} opacity=".7" />
          <rect x="17" y="44" width="10" height="1.8" rx=".9" fill={p.cap} opacity=".35" />
        </g>
      )}
      {shape === "dropper" && (
        <g>
          <path d="M20 4a4 4 0 0 1 8 0v10h-8z" fill={p.cap} />
          <rect x="18" y="13" width="12" height="9" rx="2" fill={p.cap} opacity=".9" />
          <rect x="12" y="22" width="24" height="46" rx="9" fill={category === "oil" ? "#E8C9A0" : p.body} stroke={stroke} />
          <rect x="15" y="36" width="18" height="18" rx="3" fill={p.label} />
          <rect x="18" y="41" width="12" height="2.2" rx="1" fill={p.cap} opacity=".7" />
          <rect x="18" y="46" width="8" height="1.8" rx=".9" fill={p.cap} opacity=".35" />
          <ellipse cx="17" cy="30" rx="2" ry="5" fill="#fff" opacity=".5" />
        </g>
      )}
      {shape === "jar" && (
        <g>
          <rect x="5" y="30" width="38" height="11" rx="4" fill={p.cap} />
          <rect x="6" y="39" width="36" height="29" rx="9" fill={p.body} stroke={stroke} />
          <rect x="12" y="47" width="24" height="12" rx="3" fill={p.label} />
          <rect x="16" y="51" width="16" height="2.2" rx="1" fill={p.cap} opacity=".7" />
        </g>
      )}
      {shape === "tube" && (
        <g>
          <path d="M12 6h24l-3 50H15z" fill={p.body} stroke={stroke} />
          <rect x="11" y="3" width="26" height="5" rx="1.5" fill={p.body} stroke={stroke} />
          <rect x="16" y="56" width="16" height="12" rx="3" fill={p.cap} />
          <rect x="16" y="20" width="16" height="22" rx="3" fill={p.label} />
          <rect x="19" y="25" width="10" height="2.2" rx="1" fill={p.cap} opacity=".7" />
          <rect x="19" y="30" width="7" height="1.8" rx=".9" fill={p.cap} opacity=".35" />
        </g>
      )}
      {shape === "tall" && (
        <g>
          <rect x="17" y="2" width="14" height="12" rx="3" fill={p.cap} />
          <path d="M14 18c0-2.2 1.8-4 4-4h12c2.2 0 4 1.8 4 4v46a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4z" fill={p.body} stroke={stroke} />
          <rect x="17" y="32" width="14" height="22" rx="3" fill={p.label} />
          <rect x="19.5" y="37" width="9" height="2.2" rx="1" fill={p.cap} opacity=".7" />
          <ellipse cx="18.5" cy="26" rx="1.6" ry="5" fill="#fff" opacity=".55" />
        </g>
      )}
    </svg>
  );
}
