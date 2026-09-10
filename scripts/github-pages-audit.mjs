import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const exists = (rel) => fs.existsSync(path.join(root, rel));
const nextConfig = read("next.config.mjs");
const failures = [];
const checks = [];
const check = (label, ok) => {
  checks.push([label, Boolean(ok)]);
  if (!ok) failures.push(label);
};

check("Next static export is enabled", /output:\s*["']export["']/.test(nextConfig));
check("trailing-slash route folders are enabled", /trailingSlash:\s*true/.test(nextConfig));
check("Next Image server optimization is disabled", /images:\s*\{[\s\S]*?unoptimized:\s*true/.test(nextConfig));
check("server redirects are absent", !/async\s+redirects\s*\(/.test(nextConfig));
check("server response headers are absent", !/async\s+headers\s*\(/.test(nextConfig));
check("server rewrites are absent", !/async\s+rewrites\s*\(/.test(nextConfig));
check("API route directory is absent", !exists("app/api"));
check("middleware is absent", !exists("middleware.ts") && !exists("middleware.js") && !exists("src/middleware.ts") && !exists("src/middleware.js"));

const outExists = exists("out");
check("static export directory exists", outExists);

if (outExists) {
  const required = [
    "out/index.html",
    "out/privacy/index.html",
    "out/cookies/index.html",
    "out/policies/index.html",
    "out/404.html",
    "out/.nojekyll",
    "out/work/index.html",
    "out/work/long-form/index.html",
    "out/work/short-form/index.html",
    "out/work/websites/index.html",
    "out/about/index.html",
    "out/contact/index.html",
  ];
  for (const file of required) check(`${file} exists`, exists(file));
  check("Next static assets exist", exists("out/_next"));
}

for (const [label, ok] of checks) console.log(`${ok ? "PASS" : "FAIL"} — ${label}`);
if (failures.length) {
  console.error(`GitHub Pages export verification failed: ${failures.length}/${checks.length}`);
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}
console.log(`GitHub Pages export verification passed: ${checks.length}/${checks.length}.`);
