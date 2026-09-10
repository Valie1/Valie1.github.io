import fs from "node:fs";

const runtime = fs.readFileSync(new URL("../components/StaticLegalPortalRuntime.tsx", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

const checks = [
  [runtime.includes("var clickY = window.scrollY || window.pageYOffset || 0;"), "legal click captures portfolio scroll before portal mutation"],
  [runtime.includes("show(path, anchor, clickY)"), "captured position is passed into the portal handoff"],
  [!runtime.includes("lockPortfolioScroll") && !runtime.includes("schedulePortfolioScrollLock"), "legal runtime does not fixed-lock parent geometry"],
  [!runtime.includes("function restoreScroll") && !runtime.includes("body.style.position = 'fixed'") && !runtime.includes("body.style.overflow = 'hidden'"), "legal runtime does not rebase parent scroll"],
  [runtime.includes("portal.classList.add('is-preparing')") && runtime.includes("requestAnimationFrame(function(){\n      requestAnimationFrame(function(){"), "fade entry commits two paint frames"],
  [runtime.includes("forceFrameTop(frame)") && runtime.includes("scrollRestoration = 'manual'"), "incoming legal frame starts at document top"],
  [css.includes("html:has(body.cnh-policy-active)::-webkit-scrollbar") && css.includes("overflow:visible!important"), "outer scrollbar is hidden without root geometry lock"],
  [css.includes(".cnh-policy-frame.is-entering") && css.includes(".cnh-policy-frame.is-leaving"), "legal page cross-fade states are present"],
];

const failed = checks.filter(([ok]) => !ok);
checks.forEach(([ok, label]) => console.log(`${ok ? "PASS" : "FAIL"}  ${label}`));
if (failed.length) process.exit(1);
console.log(`Legal no-jump audit passed: ${checks.length}/${checks.length}`);
