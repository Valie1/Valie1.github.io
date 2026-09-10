import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];
const notes = [];
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const content = JSON.parse(read("content/portfolio.json"));

const serializedContent = JSON.stringify(content);
const forbiddenContent = [
  "Portfolio Sample",
  "Short-form editing sample",
  "Connect the form to your preferred backend before launch.",
  "/wide-poster.svg",
  "/vertical-poster.svg",
];
for (const value of forbiddenContent) {
  if (serializedContent.includes(value)) errors.push(`Placeholder content still present: ${value}`);
}

if ("disciplines" in content) errors.push("Unused legacy discipline navigation block is still present in portfolio.json.");
if (content.site?.hero?.primaryCta || content.site?.hero?.secondaryCta) errors.push("Unused legacy hero CTA navigation is still present in portfolio.json.");
if ((content.site?.socials || []).some((item) => !String(item?.url || "").trim())) errors.push("Social navigation contains an empty URL.");

const sourceRoots = ["app", "components", "lib"];
const sourceFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(?:ts|tsx|js|jsx)$/.test(entry.name)) sourceFiles.push(full);
  }
}
for (const rel of sourceRoots) walk(path.join(root, rel));

const sourceText = sourceFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
const forbiddenSource = [
  /href\s*=\s*["']#["']/,
  /\|\|\s*["']#["']/,
  /interactive-examples\.mdn\.mozilla\.net/i,
  /https:\/\/example\.com/i,
  /\/wide-poster\.svg/i,
  /\/vertical-poster\.svg/i,
];
for (const pattern of forbiddenSource) {
  if (pattern.test(sourceText)) errors.push(`Dead/placeholder source pattern remains: ${pattern}`);
}

const publicTargetText = [
  read("app/layout.tsx"),
  read("app/page.tsx"),
  read("components/UnifiedWorkShowcase.tsx"),
  read("components/OnePageContact.tsx"),
].join("\n");
const ids = new Set([...publicTargetText.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]));
const internalHashLinks = [...sourceText.matchAll(/href\s*=\s*["'](?:\/)?#([a-z0-9-]+)["']/gi)].map((match) => match[1]);
for (const target of new Set(internalHashLinks)) {
  if (!ids.has(target)) errors.push(`Internal navigation points to missing #${target}.`);
}

const siteNav = read("components/SiteNav.tsx");
for (const [target, label] of [
  ["/#work", "WORK"],
  ["/#about", "ABOUT"],
  ["/#reviews", "REVIEWS"],
  ["/#contact", "CONTACT"],
]) {
  if (!siteNav.includes(`["${target}", "${label}"]`)) errors.push(`Primary navigation is missing ${label} → ${target}.`);
}

if (fs.existsSync(path.join(root, "components/WebsitePreview.tsx"))) errors.push("Unused WebsitePreview demo component still exists.");
for (const asset of ["public/wide-poster.svg", "public/vertical-poster.svg"]) {
  if (fs.existsSync(path.join(root, asset))) errors.push(`Unused placeholder asset still exists: ${asset}`);
}

if (errors.length) {
  console.error("Production cleanup audit failed:\n" + errors.map((item) => `  - ${item}`).join("\n"));
  process.exit(1);
}

notes.push(`${internalHashLinks.length} internal hash-link references checked.`);
notes.push(`${ids.size} public anchor targets found.`);
console.log(`Production cleanup OK — ${notes.join(" ")}`);
