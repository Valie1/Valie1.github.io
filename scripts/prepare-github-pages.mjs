import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const out = path.join(root, "out");

if (!fs.existsSync(out)) {
  console.error("Static export output was not found at ./out.");
  process.exit(1);
}

const redirects = new Map([
  ["work", "/#work"],
  ["work/long-form", "/#long-form"],
  ["work/short-form", "/#short-form"],
  ["work/websites", "/#websites"],
  ["about", "/#about"],
  ["contact", "/#contact"],
]);

function redirectDocument(target) {
  const safeTarget = JSON.stringify(target);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${target}"><title>Redirecting…</title><script>location.replace(${safeTarget})</script></head><body></body></html>`;
}

for (const [route, target] of redirects) {
  const dir = path.join(out, ...route.split("/"));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), redirectDocument(target));
}

fs.writeFileSync(path.join(out, ".nojekyll"), "");

const notFoundPath = path.join(out, "404.html");
if (fs.existsSync(notFoundPath)) {
  let html = fs.readFileSync(notFoundPath, "utf8");
  const fallback = `<script>(function(){var p=location.pathname.replace(/\\/+$/,"");var m={"/work":"/#work","/work/long-form":"/#long-form","/work/short-form":"/#short-form","/work/websites":"/#websites","/about":"/#about","/contact":"/#contact"};if(m[p]){location.replace(m[p]);return}if(p.indexOf("/projects/")===0){location.replace("/#work")}})()</script>`;
  html = html.includes("</head>") ? html.replace("</head>", `${fallback}</head>`) : `${fallback}${html}`;
  fs.writeFileSync(notFoundPath, html);
}

const required = [
  "index.html",
  "privacy/index.html",
  "cookies/index.html",
  "policies/index.html",
  "404.html",
  ".nojekyll",
];

const missing = required.filter((file) => !fs.existsSync(path.join(out, file)));
if (!fs.existsSync(path.join(out, "_next"))) missing.push("_next/");
if (missing.length) {
  console.error(`GitHub Pages export is incomplete: ${missing.join(", ")}`);
  process.exit(1);
}

console.log(`GitHub Pages export prepared at ${out}.`);
