import { auth } from "../lib/auth";
import prisma from "../lib/prisma";

async function main() {
  const adminEmail = "admin@tameeresehat.com";
  const password = process.env.ADMIN_INITIAL_PASSWORD || "HakimAdmin@2026#Tameer";

  console.log("Signing in as admin via auth.api.signInEmail...");
  const res = await auth.api.signInEmail({
    body: {
      email: adminEmail,
      password: password,
    },
    asResponse: true,
  });

  const cookie = res.headers.get("set-cookie");
  console.log("Set-Cookie header:", cookie);

  const data = await res.json();
  console.log("SignIn response JSON:", JSON.stringify(data, null, 2));

  if (cookie) {
    const headers = new Headers();
    headers.set("cookie", cookie);
    const session = await auth.api.getSession({
      headers: headers
    });
    console.log("Session response:", JSON.stringify(session, null, 2));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
