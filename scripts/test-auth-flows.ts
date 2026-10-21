import prisma from "../lib/prisma";
import { auth } from "../lib/auth";
import { ROLES, hasPermission, isStaffRole } from "../lib/rbac-base";

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures: { name: string; error: any }[] = [];

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ${colors.green}✓ PASS${colors.reset} ${testName} ${detail ? colors.dim + `(${detail})` + colors.reset : ""}`);
  } else {
    failedTests++;
    const errMsg = detail || "Assertion failed";
    console.error(`  ${colors.red}✗ FAIL${colors.reset} ${testName} - ${errMsg}`);
    failures.push({ name: testName, error: errMsg });
  }
}

function suiteHeader(title: string) {
  console.log(`\n${colors.bright}${colors.cyan}══════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  ▶ ${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}══════════════════════════════════════════════════════════════════════${colors.reset}`);
}

async function runAuthAuditTests() {
  const startTime = Date.now();
  console.log(`\n${colors.bright}${colors.magenta}🛡️ TAMEER-E-SEHAT (TMS) - COMPLETE AUTHENTICATION & EMAIL VERIFICATION AUDIT SUITE${colors.reset}`);
  console.log(`${colors.dim}Environment: Better Auth 1.7.4 + PostgreSQL + Prisma | Target: Production-Ready Auth Flows${colors.reset}\n`);

  const timestamp = Date.now();
  const testEmail = `audit.patient.${timestamp}@tameeresehat.test`;
  const testPassword = "AuditStrongPassword2026!";
  let testUserId = "";

  try {
    // ══════════════════════════════════════════════════════════════════════
    // SUITE 1: Bootstrap Admin Account Integrity
    // ══════════════════════════════════════════════════════════════════════
    suiteHeader("SUITE 1: Bootstrap Admin Account Integrity");

    const adminEmail = (process.env.ADMIN_EMAIL || "admin@tameeresehat.com").toLowerCase().trim();
    const adminUser = await prisma.user.findFirst({
      where: { role: "admin" },
    });

    assert(Boolean(adminUser), "Admin user exists in database", adminUser?.email);
    assert(adminUser?.email.toLowerCase() === adminEmail, "Admin email matches configured ADMIN_EMAIL", adminEmail);
    assert(adminUser?.emailVerified === true, "Admin account has emailVerified = true (immune to lockout)");
    assert(isStaffRole(adminUser?.role), "Admin role passes isStaffRole guard");
    assert(hasPermission(adminUser?.role, "orders:manage"), "Admin possesses 'orders:manage' permission");
    assert(hasPermission(adminUser?.role, "users:manage"), "Admin possesses 'users:manage' permission");

    // ══════════════════════════════════════════════════════════════════════
    // SUITE 2: Strict Registration & Email Verification Gating
    // ══════════════════════════════════════════════════════════════════════
    suiteHeader("SUITE 2: Strict Registration & Email Verification Gating");

    console.log(`  ${colors.dim}Creating unverified test user: ${testEmail}...${colors.reset}`);
    const signUpRes = await auth.api.signUpEmail({
      body: {
        email: testEmail,
        password: testPassword,
        name: "Audit Test Patient",
        phone: "03001234567",
        city: "Karachi",
        callbackURL: "/account",
      },
    });

    assert(Boolean(signUpRes?.user), "signUpEmail succeeds and returns user profile");
    testUserId = signUpRes?.user?.id || "";

    // Verify in database that emailVerified is strictly FALSE
    const dbUserFresh = await prisma.user.findUnique({
      where: { email: testEmail },
    });
    assert(dbUserFresh !== null, "User record persisted in PostgreSQL database");
    assert(dbUserFresh?.emailVerified === false, "New user emailVerified is strictly FALSE upon registration");
    assert(signUpRes?.token === null, "signUpEmail skips automatic session creation (token is null when requireEmailVerification is active)");

    // ══════════════════════════════════════════════════════════════════════
    // SUITE 3: Sign-In Gating for Unverified Accounts
    // ══════════════════════════════════════════════════════════════════════
    suiteHeader("SUITE 3: Sign-In Gating for Unverified Accounts");

    let signInBlocked = false;
    let blockedErrorCode = "";
    try {
      await auth.api.signInEmail({
        body: {
          email: testEmail,
          password: testPassword,
        },
      });
    } catch (err: any) {
      signInBlocked = true;
      blockedErrorCode = err?.code || err?.message || "";
    }

    assert(signInBlocked, "signInEmail strictly blocks unverified user from logging in");
    assert(
      blockedErrorCode === "EMAIL_NOT_VERIFIED" || blockedErrorCode.toLowerCase().includes("email not verified"),
      "signInEmail returns specific EMAIL_NOT_VERIFIED error code",
      blockedErrorCode
    );

    // ══════════════════════════════════════════════════════════════════════
    // SUITE 4: Verification Dispatch & Token Redemption Lifecycle
    // ══════════════════════════════════════════════════════════════════════
    suiteHeader("SUITE 4: Verification Dispatch & Token Redemption Lifecycle");

    // Test send-verification-email endpoint
    let resendSucceeded = false;
    try {
      const resendRes = await auth.api.sendVerificationEmail({
        body: {
          email: testEmail,
          callbackURL: "/account",
        },
      });
      resendSucceeded = Boolean((resendRes as any)?.status);
    } catch (err) {
      resendSucceeded = false;
    }
    assert(resendSucceeded, "sendVerificationEmail endpoint responds successfully for registered user");

    // Simulate clicking the link / activating emailVerified in database
    await prisma.user.update({
      where: { id: testUserId },
      data: { emailVerified: true },
    });

    const dbUserVerified = await prisma.user.findUnique({
      where: { id: testUserId },
    });
    assert(dbUserVerified?.emailVerified === true, "User emailVerified successfully transitioned to TRUE");

    // Attempt sign-in now that user is verified
    let verifiedSignInSuccess = false;
    let verifiedSessionToken = "";
    try {
      const loginRes = await auth.api.signInEmail({
        body: {
          email: testEmail,
          password: testPassword,
        },
      });
      if (loginRes?.token) {
        verifiedSignInSuccess = true;
        verifiedSessionToken = loginRes.token;
      }
    } catch (err) {
      verifiedSignInSuccess = false;
    }

    assert(verifiedSignInSuccess, "signInEmail succeeds immediately once user is verified");
    assert(Boolean(verifiedSessionToken), "Session token issued for verified user", verifiedSessionToken.slice(0, 10) + "...");

    // ══════════════════════════════════════════════════════════════════════
    // SUITE 5: Privilege Escalation & Admin Impersonation Defense
    // ══════════════════════════════════════════════════════════════════════
    suiteHeader("SUITE 5: Privilege Escalation & Admin Impersonation Defense");

    const hackerEmail = `hacker.${timestamp}@example.com`;
    const hackerReg = await auth.api.signUpEmail({
      body: {
        email: hackerEmail,
        password: "AttackerPassword123!",
        name: "Unauthorized Attacker",
        role: "admin", // Malicious injection attempt
      } as any,
    });

    const dbHacker = await prisma.user.findUnique({
      where: { email: hackerEmail },
    });

    assert(dbHacker?.role === "user", "Database hook forces public registration role to 'user' (admin injection blocked)");
    assert(dbHacker?.emailVerified === false, "Attacker cannot self-verify via registration parameters");

    // Clean hacker record
    if (dbHacker?.id) {
      await prisma.account.deleteMany({ where: { userId: dbHacker.id } });
      await prisma.user.delete({ where: { id: dbHacker.id } });
    }

    // ══════════════════════════════════════════════════════════════════════
    // SUITE 6: Password Reset Token Request Flow
    // ══════════════════════════════════════════════════════════════════════
    suiteHeader("SUITE 6: Password Reset Token Request Flow");

    let resetRequested = false;
    try {
      const resetRes = await auth.api.requestPasswordReset({
        body: {
          email: testEmail,
          redirectTo: "/reset-password",
        },
      });
      resetRequested = Boolean((resetRes as any)?.status);
    } catch (err: any) {
      console.error("Reset error:", err);
      resetRequested = false;
    }
    assert(resetRequested, "requestPasswordReset endpoint initiates password reset cycle for user");

    // ══════════════════════════════════════════════════════════════════════
    // SUITE 7: RBAC Server-Side Route Guard Testing
    // ══════════════════════════════════════════════════════════════════════
    suiteHeader("SUITE 7: RBAC Server-Side Route Guard Testing");

    assert(hasPermission(ROLES.USER, "orders:view_own"), "Regular user has 'orders:view_own' permission");
    assert(!hasPermission(ROLES.USER, "orders:manage"), "Regular user DOES NOT have 'orders:manage' permission");
    assert(!hasPermission(ROLES.USER, "inventory:manage"), "Regular user DOES NOT have 'inventory:manage' permission");
    assert(!hasPermission(ROLES.USER, "stats:view"), "Regular user DOES NOT have 'stats:view' permission");
    assert(!isStaffRole(ROLES.USER), "Regular user is NOT considered staff");

  } finally {
    // ══════════════════════════════════════════════════════════════════════
    // CLEANUP & TEARDOWN
    // ══════════════════════════════════════════════════════════════════════
    console.log(`\n${colors.dim}Cleaning up test records from database...${colors.reset}`);
    if (testUserId) {
      try {
        await prisma.session.deleteMany({ where: { userId: testUserId } });
        await prisma.account.deleteMany({ where: { userId: testUserId } });
        await prisma.user.delete({ where: { id: testUserId } });
        console.log(`  ${colors.green}✓ PASS${colors.reset} Test user ${testEmail} purged cleanly.`);
      } catch (cleanupErr) {
        console.error("Cleanup warning:", cleanupErr);
      }
    }
    await prisma.$disconnect();
  }

  // Summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n${colors.bright}══════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`  Total Tests: ${colors.bright}${totalTests}${colors.reset}`);
  console.log(`  Passed:      ${colors.green}${passedTests}${colors.reset}`);
  console.log(`  Failed:      ${failedTests > 0 ? colors.red : colors.dim}${failedTests}${colors.reset}`);
  console.log(`  Duration:    ${colors.dim}${duration}s${colors.reset}`);
  console.log(`${colors.bright}══════════════════════════════════════════════════════════════════════${colors.reset}\n`);

  if (failedTests > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runAuthAuditTests().catch((err) => {
  console.error("Unhandled error in test runner:", err);
  process.exit(1);
});
