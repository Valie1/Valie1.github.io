import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const files = {
  layout: read("app/layout.tsx"),
  css: read("app/globals.css"),
  nav: read("components/SiteNav.tsx"),
  navRuntime: read("public/site-nav-runtime.js"),
  work: read("components/UnifiedWorkShowcase.tsx"),
  videoModal: read("components/OnePageVideoShowcase.tsx"),
  reviews: read("components/ClientReviews.tsx"),
  cookies: read("components/CookieConsent.tsx"),
  player: read("components/CustomVideoPlayer.tsx"),
  toolkit: read("components/CreativeToolkit.tsx"),
  scrollCues: read("components/HeroScrollCues.tsx"),
  a11y: read("lib/accessibility.ts"),
};

const checks = [
  ["skip link exists", files.layout.includes('className="skip-link"') && files.layout.includes('href="#main-content"')],
  ["skip target is programmatically focusable", files.layout.includes('id="main-content" tabIndex={-1}')],
  ["skip link has visible focus styling", /\.skip-link:focus[\s\S]*transform:translateY\(0\)/.test(files.css)],
  ["global focus-visible ring overrides legacy outline suppression", files.css.includes('body :is(a[href],a[data-valie-link-preview-lock],button,input,select,textarea,iframe,[role="slider"],[tabindex]):focus-visible')],
  ["reduced motion disables smooth scrolling", /prefers-reduced-motion:reduce[\s\S]*scroll-behavior:auto!important/.test(files.css)],
  ["forced-colors fallback exists", files.css.includes("@media(forced-colors:active)")],
  ["shared focus trap utility exists", files.a11y.includes("trapTabKey") && files.a11y.includes("getFocusableElements")],
  ["modal background isolation exists", files.a11y.includes("isolateDialog") && files.a11y.includes("child.inert = true")],
  ["video dialog traps/restores focus", files.videoModal.includes("trapTabKey") && files.videoModal.includes("restoreFocus(openerRef.current)") && files.videoModal.includes('aria-modal="true"')],
  ["review dialog traps/restores focus", files.reviews.includes("trapTabKey") && files.reviews.includes("restoreFocus(openerRef.current)") && files.reviews.includes('aria-modal="true"')],
  ["cookie settings traps focus when modal", files.cookies.includes("trapTabKey") && files.cookies.includes("settingsOpenerRef") && files.cookies.includes('aria-describedby="cookie-consent-description"')],
  ["mobile menu traps keyboard focus", files.navRuntime.includes('event.key !== "Tab"') && files.navRuntime.includes('event.preventDefault()') && files.navRuntime.includes('last.focus({ preventScroll: true })')],
  ["mobile menu exposes expanded state", files.nav.includes('aria-expanded="false"') && files.nav.includes('aria-controls="minimal-mobile-menu"') && files.navRuntime.includes('button.setAttribute("aria-expanded"')],
  ["work categories use real tab semantics", files.work.includes('role="tablist"') && files.work.includes('role="tab"') && files.work.includes('role="tabpanel"') && files.work.includes("aria-selected={activeTab === tab.id}")],
  ["work tabs support arrow/home/end keys", ["ArrowRight", "ArrowLeft", "Home", "End"].every((key) => files.work.includes(`event.key === "${key}"`))],
  ["work section has an accessible heading", files.work.includes('id="selected-work-title"') && files.work.includes('aria-labelledby="selected-work-title"')],
  ["about section uses a semantic heading", files.toolkit.includes('<h2 id="about-me-label"')],
  ["video player exposes region and control group", files.player.includes('role="region"') && files.player.includes('role="group" aria-label="Video controls"')],
  ["timeline has slider semantics and keyboard orientation", files.player.includes('role="slider"') && files.player.includes('aria-orientation="horizontal"')],
  ["volume exposes a spoken percentage", files.player.includes('aria-valuetext={`${Math.round((muted ? 0 : volume) * 100)} percent`}')],
  ["duplicate hero scroll cue is hidden from assistive tech", files.scrollCues.includes('className="hero-scroll-cue hero-scroll-cue--right"') && files.scrollCues.includes('aria-hidden="true"')],
];

let failed = 0;
for (const [label, ok] of checks) {
  if (ok) console.log(`✓ ${label}`);
  else {
    console.error(`✗ ${label}`);
    failed += 1;
  }
}

if (failed) {
  console.error(`\nAccessibility audit failed: ${failed}/${checks.length} checks failed.`);
  process.exit(1);
}
console.log(`\nAccessibility audit passed: ${checks.length}/${checks.length} checks.`);
