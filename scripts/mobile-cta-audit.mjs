import fs from "node:fs";

const component = fs.readFileSync(new URL("../components/MobileContactCta.tsx", import.meta.url), "utf8");
const page = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

const checks = [
  [component.includes('href="#contact"'), "CTA does not point to #contact"],
  [component.includes('MOBILE_QUERY = "(max-width: 760px)"'), "CTA mobile breakpoint guard is missing"],
  [component.includes("heroBottom <= viewportHeight * 0.22"), "hero-exit visibility guard is missing"],
  [component.includes("contactTop <= viewportHeight * 0.9"), "contact-near hide guard is missing"],
  [component.includes("tabIndex={visible ? 0 : -1}"), "hidden CTA can still receive keyboard focus"],
  [page.includes("<MobileContactCta />"), "CTA is not mounted on the homepage"],
  [css.includes(".mobile-contact-cta{") && css.includes(".mobile-contact-cta__link"), "mobile CTA CSS is missing"],
  [css.includes("bottom:max(12px,env(safe-area-inset-bottom))"), "safe-area bottom protection is missing"],
  [css.includes("width:min(224px,calc(100dvw - 28px))"), "mobile viewport width guard is missing"],
  [css.includes("body:has(.cookie-consent-layer) .mobile-contact-cta"), "cookie-consent overlap guard is missing"],
  [css.includes("body:has(.one-video-modal) .mobile-contact-cta"), "video-modal overlap guard is missing"],
  [css.includes("body:has(.review-lightbox) .mobile-contact-cta"), "review-modal overlap guard is missing"],
  [css.includes("body:has(.minimal-site-nav.is-menu-open) .mobile-contact-cta"), "mobile-menu overlap guard is missing"],
];

const failed = checks.filter(([ok]) => !ok).map(([, message]) => message);
if (failed.length) {
  console.error("Mobile CTA audit FAILED:");
  for (const message of failed) console.error(`- ${message}`);
  process.exit(1);
}

console.log(`Mobile CTA audit passed (${checks.length}/${checks.length} guards).`);
