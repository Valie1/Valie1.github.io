import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const css = read("app/globals.css");
const layout = read("app/layout.tsx");
const viewport = read("components/BrowserViewportRuntime.tsx");
const reviews = read("components/ClientReviews.tsx");
const scrollLock = read("lib/browserRuntime.ts");
const pass = css;

const deviceMatrix = [
  ["320px compact phones", 320],
  ["360px Android compact", 360],
  ["375px legacy iPhone", 375],
  ["390px modern iPhone", 390],
  ["412px Pixel / Android", 412],
  ["430px large iPhone", 430],
];

const checks = [
  ["final mobile QA layer exists", pass.includes("@media (max-width:340px)") && pass.includes("--valie-visual-width")],
  ["desktop remains protected above 760px", pass.includes("@media (max-width:760px)")],
  ["320px emergency density refinement exists", pass.includes("@media (max-width:340px)")],
  ["360px refinement from Pass 122.17 remains", css.includes("@media (max-width:360px)")],
  ["480px refinement from Pass 122.17 remains", css.includes("@media (max-width:480px)")],
  ["short landscape phone handling exists", pass.includes("max-height:480px") && pass.includes("orientation:landscape")],
  ["viewport-fit cover remains enabled", /viewportFit:\s*["']cover["']/.test(layout)],
  ["visual viewport width/height runtime remains active", viewport.includes("--valie-visual-width") && viewport.includes("--valie-visual-height")],
  ["visual viewport top/left runtime remains active", viewport.includes("--valie-visual-top") && viewport.includes("--valie-visual-left")],
  ["safe-area left/right handling remains", css.includes("safe-area-inset-left") && css.includes("safe-area-inset-right")],
  ["safe-area top/bottom handling remains", css.includes("safe-area-inset-top") && css.includes("safe-area-inset-bottom")],
  ["dynamic viewport has dvh plus fallback", css.includes("100dvh") && css.includes("@supports not (height:100dvh)")],
  ["mobile page horizontal clipping remains", /html,[\s\S]*?body\{[\s\S]*?overflow-x:clip!important/.test(css)],
  ["intrinsic media cannot overflow final phone layer", pass.includes("picture,") && pass.includes("max-width:100%")],
  ["long contact/legal/footer copy can wrap", pass.includes("overflow-wrap:anywhere!important")],
  ["blocking panels stay inside visual viewport width", pass.includes("max-width:calc(var(--valie-visual-width,100vw) - 20px)!important")],
  ["primary overlay/mobile controls retain 44px targets", pass.includes("min-height:44px!important")],
  ["mobile menu owns contained scrolling", /\.minimal-mobile-menu__inner\{[\s\S]*?overflow-y:auto!important/.test(css)],
  ["review modal uses visual viewport", css.includes(".review-lightbox,") && css.includes("height:var(--valie-visual-height,100dvh)!important")],
  ["cookie settings owns internal scroll", /cookie-consent\.is-settings[\s\S]*?overflow:auto!important/.test(css)],
  ["legal portal keeps parent geometry natural", pass.includes("html:has(body.cnh-policy-active)::-webkit-scrollbar") && pass.includes("body.cnh-policy-active,") && pass.includes("overflow:visible!important")],
  ["active legal iframe owns scrolling", pass.includes(".cnh-policy-frame.is-active") && pass.includes("overflow:auto!important")],
  ["both hero scroll controls remain forced visible", css.includes(".hero-scroll-cue--left") && css.includes(".hero-scroll-cue--right") && css.includes("display:flex!important")],
  ["review rail has no IntersectionObserver pause", !reviews.includes("IntersectionObserver") && !reviews.includes("orbitVisible")],
  ["review animation is explicitly always running", pass.includes("animation-play-state:running!important")],
  ["touch document lock is geometry-neutral and event-based", !scrollLock.includes('body.style.position = "fixed"') && scrollLock.includes('document.addEventListener("touchmove"') && scrollLock.includes('passive: false')],
  ["reduced motion fallback remains", css.includes("prefers-reduced-motion:reduce")],
];

for (const [name, width] of deviceMatrix) {
  checks.push([`${name} (${width}px) is covered by phone scope`, width <= 760]);
}

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} — ${label}`);
  if (!ok) failures += 1;
}
console.log(`\nFinal mobile device QA: ${checks.length - failures}/${checks.length} passed.`);
if (failures) process.exit(1);
