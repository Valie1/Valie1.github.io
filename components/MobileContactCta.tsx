"use client";

import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

const MOBILE_QUERY = "(max-width: 760px)";

export default function MobileContactCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const visualViewport = window.visualViewport;
    let frame = 0;

    const updateVisibility = () => {
      frame = 0;

      if (!media.matches) {
        setVisible(false);
        return;
      }

      const hero = document.getElementById("top");
      const contact = document.getElementById("contact");
      if (!hero || !contact) {
        setVisible(false);
        return;
      }

      const layoutViewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const viewportHeight = visualViewport?.height || layoutViewportHeight;
      const heroBottom = hero.getBoundingClientRect().bottom;
      const contactTop = contact.getBoundingClientRect().top;
      const keyboardLikelyOpen = Boolean(visualViewport && viewportHeight < layoutViewportHeight * 0.72);



      const hasLeftHero = heroBottom <= viewportHeight * 0.22;
      const contactIsNear = contactTop <= viewportHeight * 0.9;

      setVisible(hasLeftHero && !contactIsNear && !keyboardLikelyOpen);
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateVisibility);
    };

    updateVisibility();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    window.addEventListener("orientationchange", requestUpdate, { passive: true });
    window.addEventListener("hashchange", requestUpdate);
    media.addEventListener?.("change", requestUpdate);
    visualViewport?.addEventListener("resize", requestUpdate, { passive: true });
    visualViewport?.addEventListener("scroll", requestUpdate, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("orientationchange", requestUpdate);
      window.removeEventListener("hashchange", requestUpdate);
      media.removeEventListener?.("change", requestUpdate);
      visualViewport?.removeEventListener("resize", requestUpdate);
      visualViewport?.removeEventListener("scroll", requestUpdate);
    };
  }, []);

  return (
    <div
      className={`mobile-contact-cta ${visible ? "is-visible" : ""}`}
      aria-hidden={!visible}
    >
      <a
        className="mobile-contact-cta__link"
        href="#contact"
        tabIndex={visible ? 0 : -1}
        aria-label="Contact Valie about a project"
      >
        <span className="mobile-contact-cta__status" aria-hidden="true" />
        <span className="mobile-contact-cta__copy">
          <small>PROJECT INQUIRY</small>
          <strong>CONTACT ME</strong>
        </span>
        <span className="mobile-contact-cta__arrow" aria-hidden="true">
          <ArrowUpRight size={17} strokeWidth={1.9} />
        </span>
      </a>
    </div>
  );
}
