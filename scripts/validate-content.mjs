import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentPath = path.join(root, "content", "portfolio.json");
const data = JSON.parse(fs.readFileSync(contentPath, "utf8"));
const errors = [];
const warnings = [];
const categories = new Set(["long", "short", "web"]);

if (data.schemaVersion !== 1) errors.push("schemaVersion must be 1.");
if (!data.site?.name?.trim()) errors.push("site.name is required.");
if (!data.site?.email?.trim()) errors.push("site.email is required.");
if (!data.site?.seo?.title?.trim()) errors.push("site.seo.title is required.");
if (!data.site?.seo?.description?.trim()) errors.push("site.seo.description is required.");
if (!Array.isArray(data.site?.seo?.keywords) || !data.site.seo.keywords.length) errors.push("site.seo.keywords must contain values.");
if (!Array.isArray(data.projects)) errors.push("projects must be an array.");

const slugs = new Set();
const orders = new Set();
for (const [index, project] of (data.projects || []).entries()) {
  const key = `projects[${index}]`;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug || "")) errors.push(`${key}.slug must be kebab-case.`);
  if (slugs.has(project.slug)) errors.push(`${key}.slug duplicates ${project.slug}.`);
  slugs.add(project.slug);
  if (orders.has(project.order)) errors.push(`${key}.order duplicates ${project.order}.`);
  orders.add(project.order);
  if (!categories.has(project.category)) errors.push(`${key}.category is invalid.`);
  const isPublished = project.status === "published";
  if (isPublished && !project.title?.trim()) errors.push(`${key}.title is required for published projects.`);
  if (isPublished && !project.media?.hero?.trim()) errors.push(`${key}.media.hero is required for published projects.`);

  const localMedia = [project.media?.hero, ...(project.media?.frames || []).map((frame) => frame.src), project.media?.previewVideo]
    .filter((src) => typeof src === "string" && src.startsWith("/"));
  for (const src of localMedia) {
    const file = path.join(root, "public", src.replace(/^\//, ""));
    if (!fs.existsSync(file)) errors.push(`${key} references missing local media: ${src}`);
  }

  if (isPublished && !project.description?.trim()) warnings.push(`${project.slug}: published project has no description.`);
  if (isPublished && project.category === "web" && !project.website) errors.push(`${key}.website is required for published web projects.`);
}

if (errors.length) {
  console.error("Content validation failed:\n" + errors.map((item) => `  - ${item}`).join("\n"));
  process.exit(1);
}
console.log(`Content OK — ${data.projects.length} projects, ${data.projects.filter((project) => project.status === "published").length} published.`);
if (warnings.length) console.warn("Warnings:\n" + warnings.map((item) => `  - ${item}`).join("\n"));
