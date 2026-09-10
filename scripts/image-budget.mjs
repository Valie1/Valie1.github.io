import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const content = JSON.parse(await readFile(path.join(root, "content", "portfolio.json"), "utf8"));
const limit = 180 * 1024;
let failed = false;

for (const project of content.projects.filter((item) => item.status === "published")) {
  const src = project.media?.hero;
  if (!src || /^https?:\/\//i.test(src) || src.startsWith("data:")) continue;
  const file = path.join(root, "public", src.replace(/^\//, ""));
  try {
    await access(file);
    const info = await stat(file);
    if (info.size > limit) {
      failed = true;
      console.error(`Image budget exceeded: ${project.slug} -> ${(info.size / 1024).toFixed(1)} KB (${src})`);
    }
  } catch {
    failed = true;
    console.error(`Missing project hero: ${project.slug} -> ${src}`);
  }
}

if (failed) process.exit(1);
console.log("Image budget OK — all published project hero images exist and are <= 180 KB.");
