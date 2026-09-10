import type { Metadata } from "next";
import LegalPageShell from "@/components/LegalPageShell";
import { site } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Policies",
  description: `Read the ${site.name} portfolio policies covering creative-work usage, client and third-party material, privacy, external links, and contact.`,
  path: "/policies",
});

export default function PoliciesPage() {
  const sections = [
    {
      id: "policies-use",
      number: "01",
      title: "Portfolio use",
      content: <p>This website is presented as a creative portfolio. Please do not copy, republish, or commercially reuse portfolio layouts, edits, graphics, or project media without permission from the relevant rights holder.</p>,
    },
    {
      id: "policies-third-party",
      number: "02",
      title: "Client and third-party work",
      content: <p>Some showcased projects include client material, platform embeds, or third-party assets. Their original trademarks, footage, music, and other protected material remain subject to the rights of their respective owners.</p>,
    },
    {
      id: "policies-privacy",
      number: "03",
      title: "Privacy",
      content: <p>For details about browsing, contact information, optional third-party media, and local portfolio tools, read the <a href="/privacy">Privacy Policy</a> and <a href="/cookies">Cookie Policy</a>.</p>,
    },
    {
      id: "policies-links",
      number: "04",
      title: "External links",
      content: <p>Links to YouTube, Discord, client websites, and other external services are provided for viewing work or contacting the portfolio owner. Those services operate under their own terms and privacy practices.</p>,
    },
    {
      id: "policies-contact",
      number: "05",
      title: "Contact",
      content: <p>Questions about portfolio usage or these policies can be sent to <a href={`mailto:${site.email}`}>{site.email}</a>.</p>,
    },
  ];

  return (
      <LegalPageShell
      kind="policies"
      titlePrimary="SITE"
      titleAccent="POLICIES."
      summary="The rules around portfolio use, showcased client work, third-party services, ownership, and external destinations."
      updated="SEP 06 / 2026"
      code="PLC-03"
      statusLabel="DOCUMENT SCOPE"
      statusValue="PORTFOLIO"
        sections={sections}
      />
  );
}
