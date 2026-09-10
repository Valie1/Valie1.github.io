import fs from "node:fs";
import path from "node:path";

const targets = [
  ".next",
  ".turbo",
  ".swc",
  "tsconfig.tsbuildinfo",
  path.join("node_modules", ".cache"),
];

for (const relative of targets) {
  const target = path.join(process.cwd(), relative);
  if (!fs.existsSync(target)) continue;
  fs.rmSync(target, { recursive: true, force: true });
  console.log(`Removed stale local cache: ${relative}`);
}

console.log("Local Next.js development caches are clean.");
