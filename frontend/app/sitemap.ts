import type { MetadataRoute } from "next";
import { getAllActivities } from "@/lib/server-public-api";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

export const revalidate = 300;

const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: SITE_URL,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    url: absoluteUrl("/activities"),
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: absoluteUrl("/criteria"),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    url: absoluteUrl("/leaderboard"),
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.7,
  },
  {
    url: absoluteUrl("/notifications"),
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.6,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const activities = await getAllActivities(100);
    const activityRoutes: MetadataRoute.Sitemap = activities
      .filter((activity) => Boolean(activity.slug))
      .map((activity) => ({
        url: absoluteUrl(`/activities/${activity.slug}`),
        lastModified: activity.startDate
          ? new Date(activity.startDate)
          : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));

    return [...staticRoutes, ...activityRoutes];
  } catch {
    return staticRoutes;
  }
}
