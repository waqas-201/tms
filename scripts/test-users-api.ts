import { auth } from "../lib/auth";
import prisma from "../lib/prisma";

async function main() {
  const adminEmail = "admin@tameeresehat.com";
  const password = process.env.ADMIN_INITIAL_PASSWORD || "HakimAdmin@2026#Tameer";

  const res = await auth.api.signInEmail({
    body: {
      email: adminEmail,
      password: password,
    },
    asResponse: true,
  });

  const cookie = res.headers.get("set-cookie");
  console.log("Got admin cookie:", !!cookie);

  // Call GET /api/admin/users
  const { GET } = await import("../app/api/admin/users/route");
  const req = new Request("http://localhost:3000/api/admin/users", {
    headers: {
      cookie: cookie || "",
    }
  });

  const getRes = await GET(req as any);
  console.log("GET /api/admin/users status:", getRes.status);
  const data = await getRes.json();
  console.log("GET /api/admin/users body:", JSON.stringify(data, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
