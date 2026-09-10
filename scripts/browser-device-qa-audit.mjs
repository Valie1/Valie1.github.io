import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const css = read("app/globals.css");
const layout = read("app/layout.tsx");
const viewportRuntime = read("components/BrowserViewportRuntime.tsx");
const scrollLock = read("lib/browserRuntime.ts");
const videoModal = read("components/OnePageVideoShowcase.tsx");
const reviewModal = read("components/ClientReviews.tsx");
const player = read("components/CustomVideoPlayer.tsx");
const hero = read("components/HeroVideoWall.tsx");
const mobileCta = read("components/MobileContactCta.tsx");
const cookieConsent = read("components/CookieConsent.tsx");

const checks = [
  ["viewport-fit cover is enabled", /viewportFit:\s*["']cover["']/.test(layout)],
  ["visualViewport runtime is mounted", layout.includes("<BrowserViewportRuntime />") && viewportRuntime.includes("window.visualViewport")],
  ["visual viewport CSS height is used", css.includes("--valie-visual-height") && css.includes("var(--valie-visual-height)")],
  ["mobile menu is dynamic-viewport bounded", /\.minimal-mobile-menu\{[\s\S]*?--valie-visual-height/.test(css)],
  ["cookie panel respects dynamic viewport", css.includes(".cookie-consent") && css.includes("max-height:min(calc(var(--valie-visual-height) - 20px),620px)")],
  ["landscape-phone fallback exists", css.includes("max-height:540px") && css.includes("orientation:landscape")],
  ["safe-area insets cover blocking overlays", css.includes("safe-area-inset-top") && css.includes("safe-area-inset-bottom")],
  ["touch hover fallbacks exist", css.includes("@media(hover:none), (pointer:coarse)")],
  ["tap manipulation is normalized", css.includes("touch-action:manipulation")],
  ["modal outside click is pointer-based", videoModal.includes("onPointerDown") && reviewModal.includes("onPointerDown") && !videoModal.includes("onMouseDown={(event)") && !reviewModal.includes("onMouseDown={(event)")],
  ["touch modal scroll lock is geometry-neutral", !scrollLock.includes('body.style.position = "fixed"') && scrollLock.includes('document.addEventListener("touchmove"')],
  ["modal lock never rebases scroll position", !scrollLock.includes("window.scrollTo({ top: scrollY") && !scrollLock.includes("body.style.top =")],
  ["review carousel is hydration-stable and always-running", reviewModal.includes('className="review-orbit is-performance-paused"') && !reviewModal.includes("new IntersectionObserver") && !reviewModal.includes("orbitVisible") && css.includes(".review-orbit.is-performance-paused .review-orbit__track") && css.includes("animation-play-state:running!important")],
  ["legal portal uses preloaded fade/blur frames without parent geometry locking", layout.includes("<StaticLegalPortalRuntime />") && css.includes("body.cnh-policy-active #cnh-policy-portal") && css.includes("filter:blur(10px)") && !read("components/StaticLegalPortalRuntime.tsx").includes("body.style.overflow")],
  ["local video uses inline playback", player.includes("playsInline")],
  ["hero videos use inline playback", hero.includes("playsInline")],
  ["fullscreen includes WebKit fallback", player.includes("webkitEnterFullscreen") && player.includes("webkitRequestFullscreen")],
  ["mobile CTA listens to visual viewport", mobileCta.includes("visualViewport?.addEventListener(\"resize\"") && mobileCta.includes("keyboardLikelyOpen")],
  ["backdrop-filter fallback exists", css.includes("@supports not ((backdrop-filter:blur(2px))")],
  ["text autosizing is normalized", css.includes("-webkit-text-size-adjust:100%")],
  ["cookie settings portal escapes filtered ancestors", cookieConsent.includes('createPortal(layer, document.body)')],
  ["cookie settings is viewport centered", css.includes("justify-content:center!important") && css.includes("align-items:center!important")],
  ["Chrome fixed-position containing-block trap is disabled", css.includes("will-change:auto!important")],
  ["dynamic viewport has 100vh fallback", css.includes("@supports not (height:100dvh)")],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
if (failed.length) {
  console.error(`\nBrowser/device QA audit failed: ${failed.length}/${checks.length}`);
  process.exit(1);
}
console.log(`\nBrowser/device QA audit passed: ${checks.length}/${checks.length}`);
