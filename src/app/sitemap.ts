import type { MetadataRoute } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://babyido.com";

/** Public pages only — dashboard routes require login */
const PUBLIC_PAGES: MetadataRoute.Sitemap = [
  {
    url: SITE_URL,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    url: `${SITE_URL}/register`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: `${SITE_URL}/login`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    url: `${SITE_URL}/forgot-password`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PAGES;
}
