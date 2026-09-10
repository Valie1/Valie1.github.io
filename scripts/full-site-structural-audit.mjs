import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const exists = (rel) => fs.existsSync(path.join(root, rel));
const walk = (dir, out = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
};

const failures = [];
const pass = (label, ok, detail = "") => {
  if (ok) console.log(`PASS — ${label}`);
  else {
    failures.push(label);
    console.error(`FAIL — ${label}${detail ? `: ${detail}` : ""}`);
  }
};

const packageJson = JSON.parse(read("package.json"));
const allFiles = walk(root);
const sourceFiles = allFiles.filter((file) => /\.(?:tsx?|jsx?|mjs|css|json)$/.test(file));
const runtimeFiles = sourceFiles.filter((file) => !file.includes(`${path.sep}scripts${path.sep}`));
const runtimeText = runtimeFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");

pass("single stable dev command exists", packageJson.scripts?.["dev:portfolio"] === "next dev -p 3000");
pass("no stale pass-specific dev scripts remain", !Object.keys(packageJson.scripts || {}).some((key) => /^dev:122/.test(key)));
pass("generated TypeScript build cache is absent", !exists("tsconfig.tsbuildinfo"));
const passVerificationFiles = fs.readdirSync(root).filter((name) => /^PASS122(?:\..*)?-VERIFICATION\.txt$/.test(name));
pass("legacy pass documentation is absent", !fs.readdirSync(root).some((name) => name.startsWith("SIMPLE-PASS-")) && passVerificationFiles.length <= 1);
pass("legacy chart studio code is absent", !/chart-studio/i.test(runtimeText));
pass("legacy localhost build stamp cannot render", read("components/BrowserViewportRuntime.tsx").includes("LEGACY_STAMP_SELECTOR") && read("app/globals.css").includes(".rk49-build-stamp,[data-build-stamp]"));
pass("no debugger statements remain", !/\bdebugger\s*;/.test(runtimeText));
pass("no empty image sources remain", !/<img[^>]+src\s*=\s*["']\s*["']/i.test(runtimeText));
pass("stable AFTER HOURS preview key is used", read("components/RenKotoneSecret.tsx").includes('afterHoursPreview'));
pass("known short-form hero poster resolves", exists("public/media/work-posters/sequence-01-1.webp"));

const assetPatterns = [
  /["'`](\/(?:media|easter-egg)\/[^"'`?#)\s]+)["'`]/g,
  /url\(["']?(\/(?:media|easter-egg)\/[^"'`)#?\s]+)["']?\)/g,
];
const missing = new Set();
for (const file of sourceFiles) {
  const text = fs.readFileSync(file, "utf8");
  for (const rx of assetPatterns) {
    rx.lastIndex = 0;
    for (const match of text.matchAll(rx)) {
      const ref = match[1];
      if (ref.includes(":path*")) continue;
      const target = path.join(root, "public", ref.replace(/^\//, ""));
      if (!fs.existsSync(target)) missing.add(ref);
    }
  }
}
pass("all local public asset references resolve", missing.size === 0, [...missing].join(", "));

if (failures.length) {
  console.error(`\nStructural audit failed: ${failures.length} issue(s).`);
  process.exit(1);
}
console.log("\nFull-site structural audit passed.");
