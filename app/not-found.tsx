import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "404 — Page Not Found",
  description: "This VALIE portfolio page could not be found. Return home or jump back into selected work, about, and contact.",
  path: "/404",
  noIndex: true,
});

const quickLinks = [
  ["01", "WORK", "/#work"],
  ["02", "ABOUT", "/#about"],
  ["03", "CONTACT", "/#contact"],
] as const;

export default function NotFound() {
  return (
    <main className="valie-404" aria-labelledby="valie-404-title">
      <div className="valie-404__ambient" aria-hidden="true" />

      <div className="valie-404__meta" aria-hidden="true">
        <span>ERROR / 404</span>
        <span>PAGE NOT FOUND</span>
      </div>

      <section className="valie-404__stage">
        <div className="valie-404__number" aria-hidden="true">
          <span>4</span>
          <span className="valie-404__zero">0</span>
          <span>4</span>
        </div>

        <div className="valie-404__message">
          <p className="valie-404__eyebrow"><i /> WRONG TURN</p>
          <h1 id="valie-404-title">THIS PAGE<br /><em>DOESN&apos;T EXIST.</em></h1>
          <p className="valie-404__copy">
            The link may be outdated, mistyped, or moved. The portfolio is still right where it should be.
          </p>

          <Link className="valie-404__home" href="/#top">
            <ArrowLeft size={15} aria-hidden="true" />
            <span>RETURN HOME</span>
          </Link>
        </div>
      </section>

      <nav className="valie-404__quick" aria-label="404 quick links">
        {quickLinks.map(([number, label, href]) => (
          <Link href={href} key={href}>
            <small>{number}</small>
            <strong>{label}</strong>
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        ))}
      </nav>

      <div className="valie-404__foot" aria-hidden="true">
        <span>VALIE / PORTFOLIO</span>
        <span>VIDEO EDITING · DESIGN · WEB</span>
      </div>
    </main>
  );
}
