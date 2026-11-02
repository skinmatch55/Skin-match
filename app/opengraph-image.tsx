import { ImageResponse } from "next/og";

export const alt = "Skinmatch: two of your products might cancel out";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  const pill = (t: string) => (
    <div style={{ display: "flex", padding: "14px 26px", borderRadius: 999, background: "#fff", border: "2px solid #EADFD8", fontSize: 30, color: "#2A1D1A" }}>{t}</div>
  );
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(135deg,#F6E4DD,#FBF7F4 60%)", fontFamily: "serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 36, color: "#2A1D1A" }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: "#2A1D1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 22, height: 22, borderRadius: 999, background: "#C8FF3D" }} />
          </div>
          Skinmatch
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, lineHeight: 1.02, color: "#2A1D1A", letterSpacing: -2 }}>Two of your products</div>
          <div style={{ display: "flex", fontSize: 84, lineHeight: 1.1, color: "#2A1D1A", letterSpacing: -2 }}>
            might <span style={{ background: "#C8FF3D", padding: "0 12px", marginLeft: 18 }}>cancel out.</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {pill("Retinol 0.5%")}
          <div style={{ width: 120, borderTop: "4px dashed #D2553F", display: "flex", justifyContent: "center", position: "relative" }}>
            <div style={{ position: "absolute", top: -24, width: 44, height: 44, borderRadius: 999, background: "#D2553F", color: "#fff", fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>×</div>
          </div>
          {pill("2% BHA Exfoliant")}
          <div style={{ marginLeft: 40, fontSize: 30, color: "#7A6660" }}>Your routine check is ready.</div>
        </div>
      </div>
    ),
    size,
  );
}
