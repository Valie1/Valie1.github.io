import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const hero = read("components/HeroVideoWall.tsx");
const hover = read("components/HoverVideoThumbnail.tsx");
const portfolioImage = read("components/PortfolioImage.tsx");
const loadedImage = read("components/LoadedImage.tsx");
const css = read("app/globals.css");
const nextConfig = read("next.config.mjs");
const player = read("components/CustomVideoPlayer.tsx");

const checks = [
  ["Next.js compression stays enabled", /compress:\s*true/.test(nextConfig)],
  ["Hero videos do not preload full MP4s", /preload="none"/.test(hero)],
  ["Hero video sources attach lazily", /data-hero-src=/.test(hero) && /video\.src = src/.test(hero)],
  ["Hero playback is capped on constrained devices", /maxPlaying/.test(hero) && /constrainedDevice \? 2 : 4/.test(hero)],
  ["Save-Data can disable decorative hero playback", /saveData \|\| slowNetwork \? 0/.test(hero)],
  ["Off-screen hero video sources are unloaded", /unloadAll/.test(hero) && /removeAttribute\("src"\)/.test(hero)],
  ["Hover previews use lightweight lazy-attached sources", /preload="none"/.test(hover) && /el\.src = video/.test(hover)],
  ["Hover previews respect Save-Data and slow networks", /connection\?\.saveData/.test(hover) && /2g/.test(hover)],
  ["Local images use Next Image with responsive sizes", /<Image/.test(portfolioImage) && /sizes=\{sizes\}/.test(portfolioImage)],
  ["Fixed-size images preserve intrinsic dimensions", /width=\{width\}/.test(loadedImage) && /height=\{height\}/.test(loadedImage)],
  ["Non-priority images remain lazy-loaded", /loading=\{priority \? undefined : "lazy"\}/.test(portfolioImage) && /loading=\{priority \? undefined : "lazy"\}/.test(loadedImage)],
  ["Below-the-fold homepage sections can defer paint", /content-visibility:auto/.test(css) && /contain-intrinsic-size/.test(css)],
  ["YouTube embeds remain consent-gated", /mediaConsent === "allowed"/.test(player) && /youtube-nocookie\.com/.test(player)],
  ["YouTube iframe loading is deferred until player interaction", /loading="eager"/.test(player) && /mediaConsent === "allowed"/.test(player)],
  ["Large public media receives production cache policy", /source:\s*"\/media\/:path\*"/.test(nextConfig) && /s-maxage=31536000/.test(nextConfig)],
];

const failed = checks.filter(([, pass]) => !pass);
for (const [label, pass] of checks) console.log(`${pass ? "PASS" : "FAIL"} — ${label}`);

if (failed.length) {
  console.error(`Core Web Vitals readiness audit failed: ${failed.length}/${checks.length} checks.`);
  process.exit(1);
}

console.log(`Core Web Vitals readiness audit passed: ${checks.length}/${checks.length}. This is a source-level readiness guard; live LCP/INP/CLS still require measurement on the deployed URL.`);
