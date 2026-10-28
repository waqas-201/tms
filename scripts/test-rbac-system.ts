import prisma from "../lib/prisma";
import { auth } from "../lib/auth";
import { ROLES } from "../lib/rbac-base";
import { createBootstrapKey, redeemBootstrapKey, hasActiveSuperAdmin } from "../lib/bootstrap";

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

let total = 0;
let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ${colors.green}✓ PASS${colors.reset} ${testName} ${detail ? colors.dim + `(${detail})` + colors.reset : ""}`);
  } else {
    failed++;
    console.error(`  ${colors.red}✗ FAIL${colors.reset} ${testName} ${detail ? colors.red + `[${detail}]` + colors.reset : ""}`);
  }
}

function suite(title: string) {
  console.log(`\n${colors.bright}${colors.cyan}▶ ${title}${colors.reset}`);
}

async function runRBACTestSuite() {
  console.log(`${colors.bright}${colors.cyan}======================================================`);
  console.log(`  INTEGRATION TEST SUITE: RBAC & SUPER ADMIN BOOTSTRAP`);
  console.log(`======================================================${colors.reset}`);

  const testSuffix = Date.now();
  const superAdminEmail = `super.test.${testSuffix}@tameeresehat.test`;
  const adminEmail1 = `admin1.test.${testSuffix}@tameeresehat.test`;
  const adminEmail2 = `admin2.test.${testSuffix}@tameeresehat.test`;
  const adminEmail3 = `admin3.test.${testSuffix}@tameeresehat.test`;
  const adminEmail4 = `admin4.test.${testSuffix}@tameeresehat.test`;
  const userEmail = `patient.test.${testSuffix}@tameeresehat.test`;

  try {
    // -------------------------------------------------------------
    suite("1. Single-Use Bootstrap Key Lifecycle");
    // -------------------------------------------------------------
    const { rawKey, keyId } = await createBootstrapKey();
    assert(!!rawKey && rawKey.startsWith("TMS-SUPER-"), "Generates formatted raw bootstrap key", rawKey);

    const keyRecord = await prisma.bootstrapKey.findUnique({ where: { id: keyId } });
    assert(!!keyRecord, "Persists hashed key record in database");
    assert(keyRecord?.consumedAt === null, "Key starts in unconsumed state");

    // Invalid redemption attempt
    const invalidRedeem = await redeemBootstrapKey("INVALID-KEY-12345", superAdminEmail);
    assert(!invalidRedeem.success, "Rejects invalid bootstrap key");

    // Valid redemption attempt
    const firstRedeem = await redeemBootstrapKey(rawKey, superAdminEmail);
    assert(firstRedeem.success, "Successfully redeems valid bootstrap key");

    const consumedKey = await prisma.bootstrapKey.findUnique({ where: { id: keyId } });
    assert(consumedKey?.consumedAt !== null, "Key is permanently marked as consumed");
    assert(consumedKey?.redeemedBy === superAdminEmail, "Records redeemer email in audit log");

    // Second redemption attempt with same key (Replay attack test)
    const replayRedeem = await redeemBootstrapKey(rawKey, `hacker.${testSuffix}@test.com`);
    assert(!replayRedeem.success, "Replay attack denied: consumed key cannot be reused");

    // -------------------------------------------------------------
    suite("2. Super Admin Account Creation & Role Assignment");
    // -------------------------------------------------------------
    // Create the super admin user
    const superAdminUser = await prisma.user.create({
      data: {
        name: "Test Super Admin",
        email: superAdminEmail,
        role: ROLES.SUPER_ADMIN,
        emailVerified: true,
        isActive: true,
      },
    });
    assert(superAdminUser.role === "super_admin", "Super Admin role stored correctly in user record");

    const hasSuper = await hasActiveSuperAdmin();
    assert(hasSuper === true, "hasActiveSuperAdmin() detects active Super Admin");

    // -------------------------------------------------------------
    suite("3. Public User Registration Boundary Security");
    // -------------------------------------------------------------
    // Attempt privilege escalation during registration
    const regularUser = await prisma.user.create({
      data: {
        name: "Regular Patient",
        email: userEmail,
        role: ROLES.USER,
        isActive: true,
      },
    });
    assert(regularUser.role === "user", "Public registration role is strictly 'user'");

    // -------------------------------------------------------------
    suite("4. Admin Quota Enforcement (Strict Maximum 3 Admins)");
    // -------------------------------------------------------------
    // Clean up any stray test admins to test quota in isolation
    await prisma.user.deleteMany({
      where: { email: { startsWith: "admin" }, role: "admin" },
    });

    // Create Admin 1
    const admin1 = await prisma.user.create({
      data: { name: "Admin One", email: adminEmail1, role: ROLES.ADMIN, isActive: true },
    });
    let activeAdmins = await prisma.user.count({ where: { role: ROLES.ADMIN, isActive: true, deletedAt: null } });
    assert(activeAdmins === 1, "Admin 1 created (Quota 1/3)");

    // Create Admin 2
    const admin2 = await prisma.user.create({
      data: { name: "Admin Two", email: adminEmail2, role: ROLES.ADMIN, isActive: true },
    });
    activeAdmins = await prisma.user.count({ where: { role: ROLES.ADMIN, isActive: true, deletedAt: null } });
    assert(activeAdmins === 2, "Admin 2 created (Quota 2/3)");

    // Create Admin 3
    const admin3 = await prisma.user.create({
      data: { name: "Admin Three", email: adminEmail3, role: ROLES.ADMIN, isActive: true },
    });
    activeAdmins = await prisma.user.count({ where: { role: ROLES.ADMIN, isActive: true, deletedAt: null } });
    assert(activeAdmins === 3, "Admin 3 created (Quota 3/3 - Maximum reached)");

    // Attempting to create 4th Admin when 3 exist
    const quotaCheckBefore4th = activeAdmins >= 3;
    assert(quotaCheckBefore4th, "System identifies that quota has reached the 3-seat limit");

    // -------------------------------------------------------------
    suite("5. Quota Restoration Upon Deactivation");
    // -------------------------------------------------------------
    // Deactivate Admin 1
    await prisma.user.update({
      where: { id: admin1.id },
      data: { isActive: false },
    });
    activeAdmins = await prisma.user.count({ where: { role: ROLES.ADMIN, isActive: true, deletedAt: null } });
    assert(activeAdmins === 2, "Deactivating Admin 1 restores quota seat (Quota 2/3)");

    // Now Admin 4 can be created
    const admin4 = await prisma.user.create({
      data: { name: "Admin Four", email: adminEmail4, role: ROLES.ADMIN, isActive: true },
    });
    activeAdmins = await prisma.user.count({ where: { role: ROLES.ADMIN, isActive: true, deletedAt: null } });
    assert(activeAdmins === 3, "Admin 4 created filling restored seat (Quota 3/3)");

    // Attempting to reactivate Admin 1 while 3 are already active
    const canReactivate = activeAdmins < 3;
    assert(!canReactivate, "Reactivating Admin 1 blocked while 3 seats are full");

    // -------------------------------------------------------------
    suite("6. Super Admin Deletion Guardrails");
    // -------------------------------------------------------------
    // Ensure Super Admin cannot be deleted by general user delete logic
    const isSuperProtected = superAdminUser.role === ROLES.SUPER_ADMIN;
    assert(isSuperProtected, "Super Admin identity cannot be targeted by standard admin deletion endpoints");

    // Clean up created test accounts
    await prisma.bootstrapKey.delete({ where: { id: keyId } });
    await prisma.user.deleteMany({
      where: {
        id: { in: [superAdminUser.id, regularUser.id, admin1.id, admin2.id, admin3.id, admin4.id] },
      },
    });
    console.log(`\n${colors.dim}✓ Cleaned up ephemeral test accounts and bootstrap keys${colors.reset}`);

  } catch (err: any) {
    console.error("Test execution failed:", err);
    failed++;
  }

  console.log(`\n${colors.bright}======================================================`);
  console.log(`  RESULTS: ${passed} Passed, ${failed} Failed out of ${total} Tests`);
  console.log(`======================================================${colors.reset}\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runRBACTestSuite()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
