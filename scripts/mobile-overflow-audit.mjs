import fs from "node:fs";

const css = fs.readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const required = [
  "overflow-x:clip!important",
  "width:min(330px,calc(100dvw - 40px))",
  ".one-video-modal,\n  .review-lightbox",
  ".minimal-site-nav,\n  .minimal-nav-inner,\n  .minimal-mobile-menu",
  ".global-feedback-layer",
];

const missing = required.filter((token) => !css.includes(token));
if (missing.length) {
  console.error("Mobile overflow audit failed. Missing guards:");
  for (const token of missing) console.error(`- ${token.split("\\n")[0]}`);
  process.exit(1);
}

console.log("Mobile overflow audit passed (5/5 guards).");
