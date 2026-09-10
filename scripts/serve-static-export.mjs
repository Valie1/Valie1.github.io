import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "out");
const port = Number.parseInt(process.env.PORT || "3000", 10);
const mime = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".avif", "image/avif"],
  [".gif", "image/gif"],
  [".ico", "image/x-icon"],
  [".mp4", "video/mp4"],
  [".webm", "video/webm"],
  [".mp3", "audio/mpeg"],
  [".wav", "audio/wav"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".txt", "text/plain; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
]);

function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const normalized = path.posix.normalize(decoded).replace(/^\/+/, "");
  if (normalized.startsWith("..")) return null;
  let candidate = path.join(out, ...normalized.split("/"));
  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) candidate = path.join(candidate, "index.html");
  if (!fs.existsSync(candidate) && fs.existsSync(`${candidate}.html`)) candidate = `${candidate}.html`;
  if (!fs.existsSync(candidate)) candidate = path.join(out, "404.html");
  return candidate;
}

if (!fs.existsSync(path.join(out, "index.html"))) {
  console.error("Run npm run build:pages before npm run preview:pages.");
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const file = resolveFile(req.url || "/");
  if (!file || !file.startsWith(out)) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad request");
    return;
  }
  const ext = path.extname(file).toLowerCase();
  const status = file.endsWith(`${path.sep}404.html`) ? 404 : 200;
  res.writeHead(status, {
    "Content-Type": mime.get(ext) || "application/octet-stream",
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  });
  fs.createReadStream(file).pipe(res);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`VALIE GitHub Pages preview: http://localhost:${port}`);
});
