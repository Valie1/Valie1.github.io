import rawContent from "@/content/portfolio.json";

export type ProjectCategory = "long" | "short" | "web";
export type ProjectStatus = "published" | "draft";
export type MediaAspect = "landscape" | "portrait" | "square";

export type MediaFrame = {
  src: string;
  alt: string;
  label?: string;
};

export type Project = {
  slug: string;
  order: number;
  status: ProjectStatus;
  featured: boolean;
  featuredOrder: number;
  category: ProjectCategory;
  title: string;
  client: string;
  year: string;
  runtime?: string;
  role: string;
  format: string;
  description: string;
  challenge: string;
  approach: string;
  result: string;
  tools: string[];
  services: string[];
  media: {
    hero: string;
    previewVideo?: string;
    hoverVideo?: string;
    playbackUrl?: string;
    frames: MediaFrame[];
  };
  website?: {
    liveUrl?: string;
  };
  links: Array<{ label: string; url: string }>;
};

export type PortfolioContent = {
  schemaVersion: number;
  site: {
    name: string;
    mark: string;
    year: string;
    email: string;
    availability: { enabled: boolean; label: string };
    seo: { title: string; description: string; keywords: string[]; creator: string; defaultOgLabel: string };
    hero: {
      eyebrow: string;
      lines: string[];
      intro: string;
    };
    footer: { cta: string; disciplines: string };
    socials: Array<{ label: string; url: string }>;
  };
  home: {
    selectedTitle: string;
    selectedEyebrow: string;
    disciplineIntro: string;
    statementEyebrow: string;
    statementTitle: string;
    statementCopy: string;
  };
  work: { eyebrow: string; title: string[]; description: string; contactBand: string; contactCta: string };
  about: {
    eyebrow: string;
    title: string[];
    description: string;
    aside: string;
    philosophy: string;
    approach: string;
    focus: string;
    skills: Array<{ title: string; detail: string }>;
    ctaTitle: string;
    ctaLabel: string;
  };
  contact: {
    eyebrow: string;
    title: string[];
    description: string;
    projectTypes: string[];
    budgetRanges: string[];
    successMessage: string;
  };
  projects: Project[];
};

export const content = rawContent as PortfolioContent;
export const site = content.site;
export const home = content.home;
export const about = content.about;
export const contact = content.contact;
export const work = content.work;

export const allProjects = [...content.projects].sort((a, b) => a.order - b.order);
export const projects = allProjects.filter((project) => project.status === "published");
export const featuredProjects = projects
  .filter((project) => project.featured)
  .sort((a, b) => a.featuredOrder - b.featuredOrder);

export function getProjectsByCategory(category: ProjectCategory) {
  return projects.filter((project) => project.category === category);
}

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getProjectNeighbors(slug: string) {
  const index = projects.findIndex((project) => project.slug === slug);
  if (index === -1) return { previous: projects[projects.length - 1], next: projects[0] };
  return {
    previous: projects[(index - 1 + projects.length) % projects.length],
    next: projects[(index + 1) % projects.length],
  };
}

export function formatProjectNumber(project: Project) {
  return project.order.toString().padStart(2, "0");
}

const mediaAspectBySlug: Record<string, MediaAspect> = {
  "rage-baiting-prank": "portrait",
  "sequence-01": "portrait",
  "sequence-01-4": "portrait",
  "sequence-01-3": "portrait",
  "sequence-01-2": "portrait",
  "sequence-01-1": "portrait",
};


export function isSafeProjectUrl(value?: string) {
  const raw = value?.trim();
  if (!raw) return false;
  if (raw.startsWith("/")) return true;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function getProjectPlaybackSource(project: Project) {
  const playbackUrl = project.media.playbackUrl?.trim();
  if (playbackUrl && isSafeProjectUrl(playbackUrl)) return playbackUrl;
  const previewVideo = project.media.previewVideo?.trim();
  return previewVideo && isSafeProjectUrl(previewVideo) ? previewVideo : undefined;
}

export function getProjectWebsiteUrl(project: Project) {
  const liveUrl = project.website?.liveUrl?.trim();
  if (!liveUrl || liveUrl.startsWith("/")) return undefined;
  return isSafeProjectUrl(liveUrl) ? liveUrl : undefined;
}

export function getProjectMediaAspect(project: Project): MediaAspect {
  return mediaAspectBySlug[project.slug] ?? (project.category === "short" ? "portrait" : "landscape");
}

export function mediaAspectLabel(aspect: MediaAspect) {
  if (aspect === "portrait") return "9:16";
  if (aspect === "square") return "1:1";
  return "16:9";
}

export function projectCount(category?: ProjectCategory) {
  return category ? getProjectsByCategory(category).length : projects.length;
}
