"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#000", color: "#f3f3ef", fontFamily: "Arial, sans-serif" }}>
        <main style={{ minHeight: "100svh", maxWidth: 720, margin: "0 auto", padding: "120px 24px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <p style={{ margin: "0 0 18px", color: "#777", fontSize: 10, letterSpacing: ".14em" }}>ERROR</p>
          <h1 style={{ margin: 0, fontSize: "clamp(42px,8vw,88px)", lineHeight: .95, letterSpacing: "-.055em", fontWeight: 600 }}>Something went wrong.</h1>
          <p style={{ maxWidth: 480, margin: "24px 0 0", color: "#888", fontSize: 14, lineHeight: 1.65 }}>The site could not finish loading.</p>
          <button type="button" onClick={reset} style={{ width: "max-content", marginTop: 30, padding: "11px 0 8px", border: 0, borderBottom: "1px solid #444", background: "transparent", color: "#f3f3ef", fontSize: 10, letterSpacing: ".12em", cursor: "pointer" }}>TRY AGAIN</button>
        </main>
      </body>
    </html>
  );
}
