import type { Metadata } from "next";
import LegalPageShell from "@/components/LegalPageShell";
import { site } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: `Learn how the ${site.name} portfolio handles browsing, contact information, embedded media, and third-party services.`,
  path: "/privacy",
});

export default function PrivacyPage() {
  const sections = [
    {
      id: "privacy-overview",
      number: "01",
      title: "Overview",
      content: <p>This privacy notice explains how this portfolio website handles information when you browse the site or choose to contact the portfolio owner.</p>,
    },
    {
      id: "privacy-browsing",
      number: "02",
      title: "Public browsing",
      content: <p>The public portfolio does not intentionally use advertising trackers, behavioral profiling, or analytics pixels in this build. Optional YouTube media remains blocked until you allow it through the site privacy controls.</p>,
    },
    {
      id: "privacy-contact",
      number: "03",
      title: "Contact information",
      content: <p>If you contact the portfolio owner by email, the information you choose to send may be used to reply to your inquiry and discuss a potential project. Do not submit information you do not want included in that conversation.</p>,
    },
    {
      id: "privacy-inquiry",
      number: "04",
      title: "Inquiry form",
      content: <p>In the current build, the on-page inquiry form is a front-end interface and is not connected to a production form-processing service. If a backend is connected later, this policy should be updated to identify that service and its data handling.</p>,
    },
    {
      id: "privacy-youtube",
      number: "05",
      title: "Optional YouTube media",
      content: <p>YouTube portfolio videos are blocked until optional media is allowed. When enabled, the player uses the privacy-enhanced youtube-nocookie.com embed domain, but loading or playing the video still connects your browser to YouTube/Google and their privacy practices apply. See the <a href="/cookies">Cookie Policy</a> for details and consent controls.</p>,
    },
    {
      id: "privacy-contact-owner",
      number: "06",
      title: "Contact",
      content: <p>Questions about this privacy notice can be sent to <a href={`mailto:${site.email}`}>{site.email}</a>.</p>,
    },
  ];

  return (
      <LegalPageShell
      kind="privacy"
      titlePrimary="PRIVACY"
      titleAccent="POLICY."
      summary="A plain-English view of how this portfolio handles browsing, messages, local preferences, and optional third-party media."
      updated="SEP 06 / 2026"
      code="PRV-01"
      statusLabel="VALIE TRACKING"
      statusValue="NONE"
        sections={sections}
      />
  );
}
