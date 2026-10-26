import prisma from "../lib/prisma";

async function main() {
  const users = await prisma.user.findMany({
    include: {
      accounts: {
        select: { id: true, providerId: true, accountId: true }
      }
    }
  });
  console.log("DB USERS COUNT:", users.length);
  for (const u of users) {
    console.log(`- ID: ${u.id} | Email: ${u.email} | Name: ${u.name} | Role: ${u.role} | Active: ${u.isActive} | DeletedAt: ${u.deletedAt} | Accounts: ${u.accounts.length}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
