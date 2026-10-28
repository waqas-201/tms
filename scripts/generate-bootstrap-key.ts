import { createBootstrapKey, hasActiveSuperAdmin } from "../lib/bootstrap";
import prisma from "../lib/prisma";

async function main() {
  console.log("\n=======================================================");
  console.log("  TAMEER-E-SEHAT: SUPER ADMIN BOOTSTRAP KEY GENERATOR  ");
  console.log("=======================================================\n");

  const alreadyInitialized = await hasActiveSuperAdmin();
  if (alreadyInitialized) {
    console.warn("⚠️  WARNING: An active Super Admin already exists in the system.");
    console.warn("Generating an additional bootstrap key should only be done for authorized disaster recovery.\n");
  }

  const { rawKey, keyId } = await createBootstrapKey();

  console.log("🔑 SINGLE-USE BOOTSTRAP KEY GENERATED:");
  console.log(`\n    \x1b[32m\x1b[1m${rawKey}\x1b[0m\n`);
  console.log(`Key ID: ${keyId}`);
  console.log("Status: ACTIVE (Single-Use)");
  console.log("\nINSTRUCTIONS:");
  console.log("1. Navigate to: /setup/super-admin");
  console.log("2. Provide this secret key along with your administrator details.");
  console.log("3. Once submitted, this key is permanently revoked and purged from valid use.");
  console.log("=======================================================\n");
}

main()
  .catch((err) => {
    console.error("Failed to generate bootstrap key:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
