import { auth } from "../lib/auth";
import prisma from "../lib/prisma";

async function seedAdmin() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@tameeresehat.com").toLowerCase();
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || "HakimAdmin@2026#Tameer";
  const adminName = "Hakim Tariq Mehmood (Admin)";

  console.log(`Checking admin account for: ${adminEmail}...`);

  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
    include: { accounts: true },
  });

  if (!existingUser) {
    console.log("Admin user does not exist. Creating via Better-Auth API...");
    try {
      const result = await auth.api.signUpEmail({
        body: {
          email: adminEmail,
          password: adminPassword,
          name: adminName,
        },
      });
      console.log("Admin signed up successfully:", result);

      // Ensure role is admin
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: "admin", city: "Karachi", phone: "0318-2311310" },
      });
      console.log("✅ Admin role set to 'admin'");
    } catch (e: any) {
      console.error("Error creating admin user:", e);
    }
  } else {
    console.log("Admin user exists:", existingUser.id, "Role:", existingUser.role);
    // Ensure role is admin
    if (existingUser.role !== "admin") {
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: "admin" },
      });
      console.log("✅ Admin role updated to 'admin'");
    }

    // Check if account with password exists
    if (!existingUser.accounts || existingUser.accounts.length === 0) {
      console.log("Admin has no account record. Creating credentials account...");
      // Let's create account via Better Auth or delete user and re-signup
      await prisma.user.delete({ where: { email: adminEmail } });
      const result = await auth.api.signUpEmail({
        body: {
          email: adminEmail,
          password: adminPassword,
          name: adminName,
        },
      });
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: "admin", city: "Karachi", phone: "0318-2311310" },
      });
      console.log("✅ Admin user and credentials re-created successfully!");
    } else {
      console.log("✅ Admin account and password record already present.");
    }
  }
}

seedAdmin()
  .catch((e) => {
    console.error("Failed to seed admin:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
