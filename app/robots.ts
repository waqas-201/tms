import type { MetadataRoute } from "next";

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
    sitemap: "https://tameeresehat.com/sitemap.xml",
    host: "https://tameeresehat.com",
  };
}
