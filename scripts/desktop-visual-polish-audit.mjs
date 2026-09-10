import fs from "node:fs";

const css = fs.readFileSync("app/globals.css", "utf8");
const checks = [
  ["desktop polish layer exists", css.includes("--valie-desktop-max:1340px") && css.includes("@media (min-width:761px)")],
  ["desktop scope starts above mobile breakpoint", css.includes("@media (min-width:761px)")],
  ["shared desktop max-width token exists", css.includes("--valie-desktop-max:1340px")],
  ["desktop nav glass polish exists", css.includes(".minimal-site-nav") && css.includes("backdrop-filter:blur(18px)")],
  ["desktop nav links are rounded", css.includes(".minimal-site-links") && css.includes("border-radius:999px!important")],
  ["hero kicker is capsule styled", css.includes(".one-hero-kicker") && css.includes("min-height:27px!important")],
  ["about/software use rounded shared cards", css.includes(".creative-toolkit--pass54 .about-redesign--editorial") && css.includes("border-radius:26px!important")],
  ["software cards have desktop hover polish", css.includes(".creative-toolkit--pass54 .software-card:hover")],
  ["work selector is full capsule", css.includes(".unified-work-tabs") && css.includes("width:min(760px,calc(100% - 48px))!important")],
  ["work cards lift on desktop hover", css.includes(".reference-media-card:hover") && css.includes("translateY(-6px)!important")],
  ["review cards have polished rounded frame", css.includes(".review-card") && css.includes("border-radius:20px!important")],
  ["contact channels remain pill-shaped", css.includes(".one-contact-channel") && css.includes("min-height:82px!important")],
  ["footer legal controls use rounded hover targets", css.includes(".valie-footer__legal a") && css.includes("border-radius:999px!important")],
  ["legal index is rounded", css.includes(".legal-index__sticky") && css.includes("border-radius:24px!important")],
  ["tablet desktop fallback exists", css.includes("@media (min-width:761px) and (max-width:1120px)")],
  ["desktop reduced-motion fallback exists", css.includes("@media (prefers-reduced-motion:reduce) and (min-width:761px)")],
];

let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} — ${label}`);
  if (!ok) failed += 1;
}
if (failed) {
  console.error(`Desktop visual polish audit failed: ${failed}/${checks.length}`);
  process.exit(1);
}
console.log(`Desktop visual polish audit passed: ${checks.length}/${checks.length}.`);
