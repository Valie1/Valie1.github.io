import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const exists = (rel) => fs.existsSync(path.join(root, rel));
const nextConfig = read("next.config.mjs");
const pkg = JSON.parse(read("package.json"));
const workflow = read(".github/workflows/deploy-pages.yml");
const prep = read("scripts/prepare-github-pages.mjs");
const productionEnv = read(".env.production");
const sourceRoots = ["app", "components", "lib"];
const sourceFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(?:ts|tsx|js|jsx|mjs)$/.test(entry.name)) sourceFiles.push(full);
  }
}
for (const rel of sourceRoots) if (exists(rel)) walk(path.join(root, rel));
const source = sourceFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
const failures = [];
const checks = [];
const check = (label, ok) => { checks.push([label, Boolean(ok)]); if (!ok) failures.push(label); };

check("Next static export is enabled", /output:\s*"export"/.test(nextConfig));
check("trailing-slash route folders are enabled", /trailingSlash:\s*true/.test(nextConfig));
check("Next Image server optimization is disabled", /images:\s*\{[\s\S]*unoptimized:\s*true/.test(nextConfig));
check("server redirects were removed", !/async\s+redirects\s*\(/.test(nextConfig));
check("server response headers were removed", !/async\s+headers\s*\(/.test(nextConfig));
check("server rewrites were removed", !/async\s+rewrites\s*\(/.test(nextConfig));
check("API route directory is absent", !exists("app/api"));
check("middleware is absent", !exists("middleware.ts") && !exists("middleware.js") && !exists("src/middleware.ts") && !exists("src/middleware.js"));
check("Server Actions are absent", !/(^|\n)\s*["']use server["']/.test(source));
check("request-time cookies and headers APIs are absent", !/\b(?:cookies|headers)\s*\(\s*\)/.test(source));
check("production site origin is valie1.github.io", productionEnv.trim() === "NEXT_PUBLIC_SITE_URL=https://valie1.github.io");
check("Pages workflow exists", exists(".github/workflows/deploy-pages.yml"));
check("Pages workflow builds the static export", workflow.includes("npm run build:pages") && workflow.includes("path: ./out"));
check("Pages workflow has deploy permissions", workflow.includes("pages: write") && workflow.includes("id-token: write"));
check("Pages workflow targets the VALIE production origin", workflow.includes("NEXT_PUBLIC_SITE_URL: https://valie1.github.io"));
check("Pages post-build creates .nojekyll", prep.includes('writeFileSync(path.join(out, ".nojekyll")'));
check("legacy static redirects are generated", ["work", "work/long-form", "work/short-form", "work/websites", "about", "contact"].every((value) => prep.includes(`["${value}",`)));
check("legacy project URLs recover through 404", prep.includes('p.indexOf("/projects/")===0') && prep.includes('location.replace("/#work")'));
check("Pages build command exists", pkg.scripts?.["build:pages"] === "next build && node scripts/prepare-github-pages.mjs");
check("Pages preview command exists", pkg.scripts?.["preview:pages"] === "node scripts/serve-static-export.mjs");
check("Pages audit is wired into deploy check", pkg.scripts?.["deploy:check"]?.includes("github-pages:audit"));
check("no GitHub project basePath is forced for the user site", !/\bbasePath\s*:/.test(nextConfig) && !/\bassetPrefix\s*:/.test(nextConfig));

for (const [label, ok] of checks) console.log(`${ok ? "PASS" : "FAIL"} — ${label}`);
if (failures.length) {
  console.error(`GitHub Pages audit failed: ${failures.length}/${checks.length}`);
  process.exit(1);
}
console.log(`GitHub Pages audit passed: ${checks.length}/${checks.length}.`);
