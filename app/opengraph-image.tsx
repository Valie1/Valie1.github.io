import { ImageResponse } from "next/og";
import { site } from "@/lib/content";

export const dynamic = "force-static";

export const alt = `${site.name} — ${site.seo.defaultOgLabel}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#050505", color: "#f5f5f1", padding: "64px 72px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, letterSpacing: "0.14em" }}>
        <span>{site.name}</span><span>PORTFOLIO / {site.year}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 102, lineHeight: 0.86, letterSpacing: "-0.06em", fontWeight: 700 }}>VIDEO.</div>
        <div style={{ fontSize: 102, lineHeight: 0.86, letterSpacing: "-0.06em", fontWeight: 700 }}>DESIGN.</div>
        <div style={{ fontSize: 102, lineHeight: 0.86, letterSpacing: "-0.06em", fontWeight: 700 }}>EXPERIENCE.</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, color: "#9a9a96" }}>
        <span>{site.seo.defaultOgLabel}</span>
      </div>
    </div>,
    size,
  );
}
