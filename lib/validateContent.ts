import type { PortfolioContent, ProjectCategory } from "@/lib/content";

const categories = new Set<ProjectCategory>(["long", "short", "web"]);

function isSafeHttpUrl(value?: string) {
  const raw = value?.trim();
  if (!raw) return false;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isUsableMediaSource(value?: string) {
  const raw = value?.trim();
  return Boolean(raw && (raw.startsWith("/") || isSafeHttpUrl(raw)));
}

export function validatePortfolioContent(input: unknown): { ok: true; data: PortfolioContent } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  if (!input || typeof input !== "object") return { ok: false, errors: ["Content must be a JSON object."] };
  const data = input as Partial<PortfolioContent>;

  if (data.schemaVersion !== 1) errors.push("schemaVersion must be 1.");
  if (!data.site?.name?.trim()) errors.push("site.name is required.");
  if (!data.site?.email?.trim()) errors.push("site.email is required.");
  if (!data.site?.seo?.title?.trim()) errors.push("site.seo.title is required.");
  if (!data.site?.seo?.description?.trim()) errors.push("site.seo.description is required.");
  if (!Array.isArray(data.site?.seo?.keywords) || !data.site?.seo?.keywords.length) errors.push("site.seo.keywords must contain at least one keyword.");
  if (!data.site?.seo?.creator?.trim()) errors.push("site.seo.creator is required.");
  if (!data.site?.seo?.defaultOgLabel?.trim()) errors.push("site.seo.defaultOgLabel is required.");
  if (!Array.isArray(data.projects)) errors.push("projects must be an array.");

  if (Array.isArray(data.projects)) {
    const slugs = new Set<string>();
    const orders = new Set<number>();
    data.projects.forEach((project, index) => {
      const prefix = `projects[${index}]`;
      if (!project.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)) errors.push(`${prefix}.slug must be lowercase kebab-case.`);
      if (project.slug && slugs.has(project.slug)) errors.push(`${prefix}.slug duplicates ${project.slug}.`);
      if (project.slug) slugs.add(project.slug);
      if (!Number.isFinite(project.order)) errors.push(`${prefix}.order must be a number.`);
      if (orders.has(project.order)) errors.push(`${prefix}.order duplicates ${project.order}.`);
      orders.add(project.order);
      if (!categories.has(project.category)) errors.push(`${prefix}.category must be long, short, or web.`);
      if (!["published", "draft"].includes(project.status)) errors.push(`${prefix}.status must be published or draft.`);
      const isPublished = project.status === "published";
      if (isPublished && !project.title?.trim()) errors.push(`${prefix}.title is required for published projects.`);
      if (isPublished && !project.media?.hero?.trim()) errors.push(`${prefix}.media.hero is required for published projects.`);
      if (!Array.isArray(project.media?.frames)) errors.push(`${prefix}.media.frames must be an array.`);
      if (isPublished && project.category === "web" && !project.website) errors.push(`${prefix}.website is required for published website projects.`);
      if (isPublished && project.category === "web" && project.website && !isSafeHttpUrl(project.website.liveUrl)) errors.push(`${prefix}.website.liveUrl must be a valid http(s) URL for published website projects.`);
      if (isPublished && project.category !== "web" && !isUsableMediaSource(project.media?.playbackUrl) && !isUsableMediaSource(project.media?.previewVideo)) errors.push(`${prefix} needs a usable playbackUrl or previewVideo for its play button.`);
      if (project.media?.playbackUrl?.trim() && !isUsableMediaSource(project.media.playbackUrl)) errors.push(`${prefix}.media.playbackUrl must be a local path or valid http(s) URL.`);
    });
  }

  return errors.length ? { ok: false, errors } : { ok: true, data: input as PortfolioContent };
}
