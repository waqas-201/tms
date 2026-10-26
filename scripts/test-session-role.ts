import { auth } from "../lib/auth";
import prisma from "../lib/prisma";

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "admin" }
  });
  console.log("Admin in DB:", admin);

  // Let's create a session for admin and call getSession
  const session = await prisma.session.create({
    data: {
      userId: admin!.id,
      token: "test-admin-token-" + Date.now(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    }
  });

  const headers = new Headers();
  headers.set("cookie", `better-auth.session_token=${session.token}`);

  const fetchedSession = await auth.api.getSession({
    headers: headers
  });

  console.log("Fetched session result:", JSON.stringify(fetchedSession, null, 2));

  // cleanup
  await prisma.session.delete({ where: { id: session.id } });
}

main().catch(console.error).finally(() => prisma.$disconnect());
