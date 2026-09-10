import type { Metadata } from "next";
import LegalPageShell from "@/components/LegalPageShell";
import { site } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Cookie Policy",
  description: `See how the ${site.name} portfolio stores media consent preferences and blocks optional YouTube content until permission is given.`,
  path: "/cookies",
});

export default function CookiesPage() {
  const sections = [
    {
      id: "cookies-use",
      number: "01",
      title: "What this site uses",
      content: <p>The public VALIE portfolio does not intentionally use advertising cookies, analytics trackers, behavioral profiling, or marketing pixels in this build. It does use limited browser storage for functional preferences described below.</p>,
    },
    {
      id: "cookies-consent",
      number: "02",
      title: "Media consent preference",
      content: <p>Your optional-media choice is stored locally on your device under the key <code>valie-media-consent-v1</code>. This lets the site remember whether YouTube media should stay blocked or may be loaded. The preference does not identify you to VALIE and can be changed at any time through <strong>COOKIE SETTINGS</strong> in the footer.</p>,
    },
    {
      id: "cookies-youtube",
      number: "03",
      title: "Optional YouTube media",
      content: <p>YouTube videos are not loaded before you allow optional media. When permission is granted, the player uses YouTube&apos;s privacy-enhanced <code>youtube-nocookie.com</code> embed domain. Loading or playing that content still connects your browser to YouTube/Google, which may process technical information or use cookies and similar storage under its own policies.</p>,
    },
    {
      id: "cookies-choice",
      number: "04",
      title: "Changing your choice",
      content: <p>Use <strong>COOKIE SETTINGS</strong> in the portfolio footer to switch optional YouTube media on or off. Rejecting optional media keeps third-party YouTube embeds blocked while the rest of the portfolio remains usable.</p>,
    },
    {
      id: "cookies-related",
      number: "05",
      title: "Related policies",
      content: <p>For broader information about browsing and contact data, read the <a href="/privacy">Privacy Policy</a>. General portfolio terms are available under <a href="/policies">Policies</a>.</p>,
    },
    {
      id: "cookies-contact",
      number: "06",
      title: "Contact",
      content: <p>Questions about this Cookie Policy can be sent to <a href={`mailto:${site.email}`}>{site.email}</a>.</p>,
    },
  ];

  return (
      <LegalPageShell
      kind="cookies"
      titlePrimary="COOKIE"
      titleAccent="POLICY."
      summary="Functional preference storage only. YouTube stays disconnected from the portfolio until you explicitly allow optional media."
      updated="SEP 06 / 2026"
      code="CKE-02"
      statusLabel="DEFAULT MEDIA STATE"
      statusValue="BLOCKED"
        sections={sections}
      />
  );
}
