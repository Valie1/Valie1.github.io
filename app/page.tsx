import type { Metadata } from "next";
import { ArrowDown } from "lucide-react";
import HeroScrollCues from "@/components/HeroScrollCues";
import OnePageContact from "@/components/OnePageContact";
import HeroVideoWall from "@/components/HeroVideoWall";
import CreativeToolkit from "@/components/CreativeToolkit";
import OnePageFooter from "@/components/OnePageFooter";
import ClientReviews from "@/components/ClientReviews";
import UnifiedWorkShowcase from "@/components/UnifiedWorkShowcase";
import MobileContactCta from "@/components/MobileContactCta";
import CookieConsent from "@/components/CookieConsent";
import { getProjectsByCategory, site } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ path: "/" });

export default function HomePage() {
  const longForm = getProjectsByCategory("long");
  const shortForm = getProjectsByCategory("short");
  const websites = getProjectsByCategory("web");

  return (
    <>
      <CookieConsent isHome />
      <main className="one-page-portfolio">
      <section id="top" className="one-hero one-hero--video-wall">
        <HeroVideoWall projects={[...longForm, ...shortForm]} />
        <div className="one-hero-center one-hero-center--delayed">
          <p className="one-hero-kicker">VIDEO EDITOR / WEB DESIGNER</p>
          <h1>EDIT.<br /><span>DESIGN.</span><br />BUILD.</h1>
          <p className="one-hero-intro">{site.hero.intro}</p>
          <div className="one-hero-actions valie-hero-cta-pair">
            <a className="one-primary-button valie-hero-glint valie-hero-glint--work" href="#work">
              <span className="valie-glint-stroke" aria-hidden="true" />
              <span className="valie-glint-gloss" aria-hidden="true" />
              <span className="valie-glint-label">VIEW WORK <ArrowDown size={13} /></span>
            </a>
            <a className="valie-hero-glint valie-hero-glint--contact" href="#contact">
              <span className="valie-glint-stroke" aria-hidden="true" />
              <span className="valie-glint-gloss" aria-hidden="true" />
              <span className="valie-glint-label">CONTACT</span>
            </a>
          </div>
        </div>
        <HeroScrollCues />
      </section>

      <section id="about" className="one-section one-work-index one-work-index--toolkit" aria-label="About and creative toolkit">
        <CreativeToolkit />
      </section>

      <UnifiedWorkShowcase longForm={longForm} shortForm={shortForm} websites={websites} />

      <section id="reviews" className="one-section one-reviews" aria-labelledby="reviews-title">
        <ClientReviews />
      </section>

      <OnePageContact />
      <OnePageFooter />
        <MobileContactCta />
      </main>
    </>
  );
}
