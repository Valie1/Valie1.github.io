import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicMedia = path.join(root, "public", "media");
const sourceRoots = ["app", "components", "lib", "content"];
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".css"]);
const sourceFiles = [];

function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, callback);
    else callback(full);
  }
}

for (const sourceRoot of sourceRoots) {
  walk(path.join(root, sourceRoot), (file) => {
    if (sourceExtensions.has(path.extname(file))) sourceFiles.push(file);
  });
}

const sourceText = sourceFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
const assets = [];
walk(publicMedia, (file) => {
  const relative = path.relative(path.join(root, "public"), file).replaceAll("\\", "/");
  assets.push({
    file,
    url: `/${relative}`,
    bytes: fs.statSync(file).size,
  });
});

const unused = assets.filter((asset) => !sourceText.includes(asset.url));
if (unused.length) {
  console.error("Dead asset audit FAILED — unreferenced files remain under public/media:");
  for (const asset of unused) {
    console.error(`  - ${asset.url} (${(asset.bytes / 1024).toFixed(1)} KB)`);
  }
  process.exit(1);
}

const totalBytes = assets.reduce((sum, asset) => sum + asset.bytes, 0);
console.log(`Dead asset audit passed — ${assets.length} referenced media files, ${(totalBytes / 1024 / 1024).toFixed(1)} MB total; no orphaned public/media assets.`);
