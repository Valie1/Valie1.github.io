import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const css = fs.readFileSync(path.join(root, "app", "globals.css"), "utf8");
const checks = [
  ["mobile-only 760px scope", /@media\s*\(max-width:760px\)/],
  ["mobile design tokens", /--valie-mobile-surface:/],
  ["mobile section separators", /\.one-section \+ \.one-section::before/],
  ["mobile nav polish", /\.minimal-mobile-menu__links a::before/],
  ["hero phone art direction", /\.one-hero--video-wall::after/],
  ["about card polish", /\.about-redesign__body--editorial::after/],
  ["work tabs active underline", /\.unified-work-tabs button\.is-active::after/],
  ["review rail edge masks", /\.review-orbit::before[\s\S]*\.review-orbit::after/],
  ["contact accent cards", /\.one-contact-channel::before/],
  ["footer phone polish", /\.valie-footer__legal a:active/],
  ["cookie settings polish", /\.cookie-settings-choice\.is-selected/],
  ["legal page accent", /\.legal-hero::after/],
  ["small phone refinement", /@media\s*\(max-width:420px\)/],
  ["landscape refinement", /max-height:560px/],
  ["reduced motion fallback", /prefers-reduced-motion:reduce/],
];

let failures = 0;
for (const [label, regex] of checks) {
  const ok = regex.test(css);
  console.log(`${ok ? "PASS" : "FAIL"}: ${label}`);
  if (!ok) failures++;
}
if (failures) {
  console.error(`Mobile visual polish audit failed (${failures}).`);
  process.exit(1);
}
console.log(`Mobile visual polish audit passed (${checks.length}/${checks.length}).`);
