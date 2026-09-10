import fs from "node:fs";

const scrollLock = fs.readFileSync(new URL("../lib/browserRuntime.ts", import.meta.url), "utf8");
const legal = fs.readFileSync(new URL("../components/StaticLegalPortalRuntime.tsx", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

const checks = [
  [!scrollLock.includes('body.style.position = "fixed"') && !scrollLock.includes("body.style.position = 'fixed'"), "shared modal lock never fixes body"],
  [!scrollLock.includes("body.style.top ="), "shared modal lock never writes body top"],
  [scrollLock.includes('document.addEventListener("wheel"') && scrollLock.includes('document.addEventListener("touchmove"'), "background wheel and touch scrolling are guarded"],
  [legal.includes("portal.classList.add('is-preparing')") && legal.includes("requestAnimationFrame"), "legal portal fade uses committed frame states"],
  [legal.includes("forceFrameTop(frame)") && legal.includes("scrollRestoration = 'manual'"), "legal frames reset to top"],
  [!legal.includes("body.style.position = 'fixed'") && !legal.includes("function restoreScroll"), "legal portal never fixes or restores parent geometry"],
  [css.includes("body.cnh-policy-active #cnh-policy-portal") && css.includes("html:has(body.cnh-policy-active)::-webkit-scrollbar"), "legal overlay and scrollbar guards are present"],
  [css.includes("html.video-modal-locked,") && css.includes("html.review-modal-locked,"), "review/video lock guards remain present"],
];

const failed = checks.filter(([ok]) => !ok);
checks.forEach(([ok, label]) => console.log(`${ok ? "PASS" : "FAIL"}  ${label}`));
if (failed.length) process.exit(1);
console.log(`Overlay no-jump audit passed: ${checks.length}/${checks.length}`);
