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
          "/api/",
          "/account",
          "/account/",
          "/checkout",
          "/checkout/",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
          "/track-order",
          "/wishlist",
        ],
      },
    ],
    // Must be the host that serves the sitemap. Pointing this at the apex made
    // every fetch a cross-host redirect first.
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
