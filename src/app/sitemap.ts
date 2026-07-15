import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

const PUBLIC_PATHS = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/register", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/login", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/forgot-password", priority: 0.3, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_PATHS.map(({ path, priority, changeFrequency }) => ({
    url: path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
