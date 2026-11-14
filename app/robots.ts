import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/admin",
          "/admin/",
          "/api",
          "/api/",
          "/setup",
          "/setup/",
          "/invoices",
          "/invoices/",
          "/uploads",
          "/uploads/",
          "/*?displayview=*",
          "/*?view=*",
        ],
      },
    ],
    // Must be the host that serves the sitemap. Pointing this at the apex made
    // every fetch a cross-host redirect first.
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
