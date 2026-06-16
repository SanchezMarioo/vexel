import { ImageResponse } from "next/og";
import { identity } from "@/lib/portfolio/content";

export const alt = "Vexel — Desarrollador web freelance";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#050505",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#7b61ff",
              color: "#ffffff",
              fontSize: 40,
              fontWeight: 800,
            }}
          >
            V
          </div>
          <div style={{ color: "#ffffff", fontSize: 40, fontWeight: 700 }}>Vexel</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              color: "#ffffff",
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.1,
              maxWidth: 940,
            }}
          >
            {identity.headline}
          </div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 30 }}>
            Desarrollador web freelance · Respondo en menos de 24 h
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
