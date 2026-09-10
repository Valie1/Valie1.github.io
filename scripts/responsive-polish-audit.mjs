import fs from "node:fs";
const css = fs.readFileSync("app/globals.css","utf8");
const checks = [
  ["responsive polish layer exists", css.includes("--valie-phone-radius:24px") && css.includes("@media (min-width:761px) and (max-width:1024px)")],
  ["tablet 761–1024 scope exists", css.includes("@media (min-width:761px) and (max-width:1024px)")],
  ["tablet Contact collapses to one column", css.includes(".one-contact-hub") && css.includes("grid-template-columns:1fr!important")],
  ["tablet legal layout collapses early", css.includes(".legal-layout") && css.includes("padding-top:40px!important")],
  ["tablet software uses two columns", css.includes("grid-template-columns:repeat(2,minmax(0,1fr))!important")],
  ["tablet final software card spans row", css.includes(".software-card:last-child") && css.includes("grid-column:1/-1!important")],
  ["phone gutter token exists", css.includes("--valie-phone-radius:24px")],
  ["phone hero CTAs are width constrained", css.includes("width:min(100%,350px)!important")],
  ["phone work tabs retain three-way capsule", css.includes(".unified-work-tabs button") && css.includes("font-size:6.3px!important")],
  ["phone website cards stay rounded", css.includes(".one-web-card:first-child") && css.includes("border-radius:16px!important")],
  ["phone reviews use viewport-safe card width", css.includes("calc(100vw - (var(--valie-mobile-gutter) * 2))")],
  ["phone Contact removes obsolete third grid column", css.includes("grid-template-columns:44px minmax(0,1fr)!important")],
  ["phone legal links are rounded", css.includes(".legal-index__docs a") && css.includes("border-radius:12px!important")],
  ["small-phone hero CTA stacks", css.includes("@media (max-width:380px)") && css.includes("flex-direction:column!important")],
  ["short landscape fallback exists", css.includes("@media (max-width:760px) and (max-height:560px) and (orientation:landscape)")],
  ["AFTER HOURS phone artwork is bounded", css.includes(".rk49-pose") && css.includes("max-width:104%!important")],
  ["responsive reduced-motion fallback exists", css.includes("@media (prefers-reduced-motion:reduce) and (max-width:1024px)")],
];
let failures=0;
for (const [label,ok] of checks){
  console.log(`${ok?"PASS":"FAIL"} — ${label}`);
  if(!ok) failures++;
}
if(failures){
  console.error(`Responsive polish audit failed: ${failures}/${checks.length}`);
  process.exit(1);
}
console.log(`Responsive polish audit passed: ${checks.length}/${checks.length}.`);
