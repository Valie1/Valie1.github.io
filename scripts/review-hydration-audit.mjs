import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const reviews = read("components/ClientReviews.tsx");
const css = read("app/globals.css");

const checks = [
  ["review orbit class is deterministic", reviews.includes('className="review-orbit is-performance-paused"')],
  ["old visibility state is absent", !reviews.includes("orbitVisible")],
  ["old intersection observer is absent", !reviews.includes("new IntersectionObserver")],
  ["legacy class cannot pause the rail", css.includes(".review-orbit.is-performance-paused .review-orbit__track") && css.includes("animation-play-state:running!important")],
  ["review modal still uses a body portal", reviews.includes("createPortal(") && reviews.includes("document.body")],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
if (failed.length) {
  console.error(`\nReview hydration audit failed: ${failed.length}/${checks.length}`);
  process.exit(1);
}
console.log(`\nReview hydration audit passed: ${checks.length}/${checks.length}`);
