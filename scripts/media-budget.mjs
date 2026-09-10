import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const content = JSON.parse(fs.readFileSync(path.join(root, "content/portfolio.json"), "utf8"));
const maxHoverBytes = 1.5 * 1024 * 1024;
const errors = [];

for (const project of content.projects || []) {
  if (!['long', 'short'].includes(project.category) || project.status !== 'published') continue;
  const hover = project.media?.hoverVideo;
  if (!hover) {
    errors.push(`${project.slug}: missing dedicated hoverVideo; full preview media must not be used for hover.`);
    continue;
  }
  if (!hover.startsWith('/')) continue;
  const file = path.join(root, 'public', hover.replace(/^\//, ''));
  if (!fs.existsSync(file)) {
    errors.push(`${project.slug}: hoverVideo file is missing: ${hover}`);
    continue;
  }
  const bytes = fs.statSync(file).size;
  if (bytes > maxHoverBytes) {
    errors.push(`${project.slug}: hoverVideo is ${(bytes / 1024 / 1024).toFixed(2)} MB; budget is 1.5 MB.`);
  }
}

if (errors.length) {
  console.error('Media budget failed:\n' + errors.map((x) => `- ${x}`).join('\n'));
  process.exit(1);
}
console.log('Media budget passed: every published video card uses a dedicated hover asset <= 1.5 MB.');
