import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const errors = [];
const notes = [];

const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const exists = (rel) => fs.existsSync(path.join(root, rel));
const fail = (message) => errors.push(message);

for (const file of [
  "app/cookies/page.tsx",
  "components/CookieConsent.tsx",
  "lib/mediaConsent.ts",
]) {
  if (!exists(file)) fail(`Missing cookie/privacy implementation file: ${file}`);
}

if (!errors.length) {
  const layout = read("app/layout.tsx");
  const home = read("app/page.tsx");
  const footer = read("components/OnePageFooter.tsx");
  const player = read("components/CustomVideoPlayer.tsx");
  const showcase = read("components/OnePageVideoShowcase.tsx");
  const consent = read("components/CookieConsent.tsx");
  const consentLib = read("lib/mediaConsent.ts");
  const cookies = read("app/cookies/page.tsx");
  const privacy = read("app/privacy/page.tsx");
  const sitemap = read("app/sitemap.ts");

  if (layout.includes("<CookieConsent")) fail("CookieConsent must not be globally mounted in app/layout.tsx.");
  if (!home.includes("<CookieConsent isHome")) fail("Home route is missing page-scoped CookieConsent.");
  for (const legalPage of [cookies, privacy, read("app/policies/page.tsx")]) {
    if (legalPage.includes("<CookieConsent")) fail("Legal iframe routes must not mount duplicate CookieConsent runtimes.");
  }
  if (consent.includes("next/navigation") || consent.includes("usePathname")) fail("CookieConsent still depends on next/navigation route hooks.");
  const runtime = read("components/StaticLegalPortalRuntime.tsx");
  if (consent.includes("onSettingsTriggerClick")) fail("CookieConsent must not install a competing document-level Cookie Settings click handler.");
  if (!runtime.includes("window.__valieCookieSettingsPending = true") || !runtime.includes("valie:open-cookie-settings") || !consent.includes("__valieCookieSettingsPending")) fail("Hydration-safe Cookie Settings bridge/queue is missing.");
  if (!footer.includes('href="/cookies"')) fail("Footer is missing the Cookie Policy link.");
  if (footer.includes('"use client"') || footer.includes("useEffect") || footer.includes("useState")) fail("Footer legal controls must be server-rendered outside a hydration boundary.");
  if (!footer.includes('className="cookie-settings-trigger"') || !footer.includes("COOKIE SETTINGS")) fail("Footer is missing the stable COOKIE SETTINGS trigger.");
  if (!consent.includes("REJECT NON-ESSENTIAL") || !consent.includes("ALLOW MEDIA")) {
    fail("Consent UI must expose both reject and allow choices.");
  }
  if (!consentLib.includes('MEDIA_CONSENT_STORAGE_KEY = "valie-media-consent-v1"')) {
    fail("Consent preference storage key is missing or changed without updating the policy.");
  }

  if (/https:\/\/www\.youtube\.com\/embed/i.test(player)) {
    fail("CustomVideoPlayer still contains a standard youtube.com embed; use youtube-nocookie.com.");
  }
  if (!player.includes("https://www.youtube-nocookie.com/embed/")) {
    fail("YouTube privacy-enhanced embed domain is missing.");
  }
  if (!/mediaConsent\s*===\s*"allowed"\s*\?\s*\(\s*(?:<>\s*)?<iframe/s.test(player)) {
    fail("YouTube iframe is not statically gated behind mediaConsent === \"allowed\".");
  }
  if (!player.includes("ALLOW &amp; PLAY") || !player.includes("KEEP BLOCKED")) {
    fail("Contextual YouTube consent gate is incomplete.");
  }

  if (!showcase.includes('readMediaConsent() !== "allowed"')) {
    fail("YouTube preconnect warmup is not gated by media consent.");
  }
  if (showcase.includes('"https://www.youtube.com"')) {
    fail("Preconnect still targets regular youtube.com instead of privacy-enhanced media flow.");
  }

  for (const token of [
    "valie-media-consent-v1",
    "youtube-nocookie.com",
    "COOKIE SETTINGS",
  ]) {
    if (!cookies.includes(token)) fail(`Cookie Policy does not document ${token}.`);
  }
  if (!privacy.includes('href="/cookies"')) fail("Privacy Policy does not link to the Cookie Policy.");
  if (!sitemap.includes('absoluteUrl("/cookies")')) fail("Cookie Policy is missing from the sitemap.");

  const sourceRoots = ["app", "components"];
  let iframeCount = 0;
  const trackerPatterns = [
    /googletagmanager\.com/i,
    /google-analytics\.com/i,
    /\bgtag\s*\(/i,
    /\bfbq\s*\(/i,
    /connect\.facebook\.net/i,
    /static\.hotjar\.com/i,
    /posthog/i,
    /mixpanel/i,
  ];

  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
        const text = fs.readFileSync(full, "utf8");
        iframeCount += (text.match(/<iframe\b/g) || []).length;

        for (const pattern of trackerPatterns) {
          if (pattern.test(text)) fail(`Unexpected tracking/provider signature ${pattern} in ${path.relative(root, full)}.`);
        }
      }
    }
  };
  for (const rel of sourceRoots) walk(path.join(root, rel));
  if (iframeCount !== 2) fail(`Expected exactly two reviewed iframe implementations (YouTube player + same-origin legal portal), found ${iframeCount}.`);

  notes.push("no analytics/ad pixel signatures found");
  notes.push("YouTube iframe consent-gated");
  notes.push("youtube-nocookie.com enforced");
  notes.push("consent storage documented");
}

if (errors.length) {
  console.error("Cookie/privacy audit FAILED:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Cookie/privacy audit passed (${notes.join(", ")}).`);
