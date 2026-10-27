import prisma from "../lib/prisma";
import { auth, getLastEmittedOTP } from "../lib/auth";

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

async function runOTPAuthAudit() {
  const startTime = Date.now();
  console.log(`\n${colors.bright}${colors.magenta}🛡️ TAMEER-E-SEHAT (TMS) - EMAIL OTP AUTHENTICATION AUDIT SUITE${colors.reset}`);
  console.log(`${colors.dim}Target: Verification Code & Password Reset Code Flows (Hashed, 5m expiry, 3 attempts)${colors.reset}\n`);

  const timestamp = Date.now();
  const testEmail = `otp.patient.${timestamp}@tameeresehat.test`;
  const testPassword = "OtpStrongPassword2026!";

  try {
    // ══════════════════════════════════════════════════════════════════════
    // SUITE 1: 6-Digit Verification Code Generation & Hashed Storage
    // ══════════════════════════════════════════════════════════════════════
    suiteHeader("SUITE 1: 6-Digit Verification Code Generation & Hashed Storage");

    console.log(`  ${colors.dim}Registering new patient: ${testEmail}...${colors.reset}`);
    const signUpRes = await auth.api.signUpEmail({
      body: {
        email: testEmail,
        password: testPassword,
        name: "OTP Test Patient",
        phone: "03009876543",
        city: "Karachi",
      },
    });

    assert(Boolean(signUpRes?.user), "signUpEmail succeeds and creates patient account");
    assert(signUpRes?.user?.emailVerified === false, "New account emailVerified is strictly FALSE");

    // Request verification OTP via auth.api
    console.log(`  ${colors.dim}Dispatching verification OTP to ${testEmail}...${colors.reset}`);
    await (auth.api as any).sendVerificationOTP({
      body: {
        email: testEmail,
        type: "email-verification",
      },
    });

    const emitted = getLastEmittedOTP();
    assert(Boolean(emitted), "sendVerificationOTP triggered email dispatch handler");
    assert(emitted?.email.toLowerCase() === testEmail.toLowerCase(), "Emitted OTP email matches recipient");
    assert(/^\d{6}$/.test(emitted?.otp || ""), "Emitted Verification Code is strictly 6 numeric digits", emitted?.otp);

    // Check verification table in database
    const verifications = await prisma.verification.findMany({
      where: {
        identifier: {
          contains: testEmail,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    assert(verifications.length > 0, "Verification record created in PostgreSQL database");
    const record = verifications[0];
    
    // Check expiry is ~5 minutes (between 270s and 310s from now)
    const expiryDiffSec = Math.round((new Date(record.expiresAt).getTime() - Date.now()) / 1000);
    assert(expiryDiffSec >= 270 && expiryDiffSec <= 310, `Verification Code lifetime is ~300 seconds (5 minutes)`, `${expiryDiffSec}s`);

    // Verify hashed storage: the database value MUST NOT be a plain 6 digit number
    const isPlainSixDigits = /^\d{6}$/.test(record.value);
    assert(!isPlainSixDigits, "Database stores cryptographic hash of Verification Code, not plain 6-digit text", record.value.substring(0, 15) + "...");

    // ══════════════════════════════════════════════════════════════════════
    // SUITE 2: Verification Code Redemption & Login Unlocking
    // ══════════════════════════════════════════════════════════════════════
    suiteHeader("SUITE 2: Verification Code Redemption & Login Unlocking");

    // Attempting verification with wrong code MUST fail
    let wrongCodeFailed = false;
    try {
      await (auth.api as any).verifyEmailOTP({
        body: {
          email: testEmail,
          otp: "000000",
        },
      });
    } catch (err: any) {
      wrongCodeFailed = true;
    }
    assert(wrongCodeFailed, "Submitting invalid Verification Code ('000000') is rejected");

    // Submitting the valid code MUST succeed
    const validOtp = emitted!.otp;
    const verifyRes = await (auth.api as any).verifyEmailOTP({
      body: {
        email: testEmail,
        otp: validOtp,
      },
    });

    assert(Boolean(verifyRes?.status || verifyRes?.user), "Submitting valid 6-digit Verification Code succeeds");

    // Verify in database that emailVerified is now TRUE
    const dbUserVerified = await prisma.user.findUnique({
      where: { email: testEmail },
    });
    assert(dbUserVerified?.emailVerified === true, "User emailVerified transitioned to TRUE in database");

    // Sign in now succeeds immediately
    const signInRes = await auth.api.signInEmail({
      body: {
        email: testEmail,
        password: testPassword,
      },
    });
    assert(Boolean(signInRes?.user && signInRes?.token), "signInEmail succeeds immediately for verified user with session token");

    // ══════════════════════════════════════════════════════════════════════
    // SUITE 3: Brute-Force 3-Attempt Lockout
    // ══════════════════════════════════════════════════════════════════════
    suiteHeader("SUITE 3: Brute-Force 3-Attempt Lockout");

    const lockoutEmail = `lockout.patient.${timestamp}@tameeresehat.test`;
    await auth.api.signUpEmail({
      body: {
        email: lockoutEmail,
        password: testPassword,
        name: "Lockout Test Patient",
      },
    });

    await (auth.api as any).sendVerificationOTP({
      body: {
        email: lockoutEmail,
        type: "email-verification",
      },
    });

    const realCode = getLastEmittedOTP()?.otp;

    // Fail attempt 1
    try { await (auth.api as any).verifyEmailOTP({ body: { email: lockoutEmail, otp: "111111" } }); } catch {}
    // Fail attempt 2
    try { await (auth.api as any).verifyEmailOTP({ body: { email: lockoutEmail, otp: "222222" } }); } catch {}
    // Fail attempt 3
    try { await (auth.api as any).verifyEmailOTP({ body: { email: lockoutEmail, otp: "333333" } }); } catch {}

    // 4th attempt: even submitting the REAL code should now fail because attempts were exhausted
    let lockoutEnforced = false;
    try {
      await (auth.api as any).verifyEmailOTP({
        body: {
          email: lockoutEmail,
          otp: realCode || "999999",
        },
      });
    } catch (err: any) {
      lockoutEnforced = true;
    }
    assert(lockoutEnforced, "Verification challenge permanently revoked after 3 failed attempts (lockout enforced)");

    // ══════════════════════════════════════════════════════════════════════
    // SUITE 4: Password Reset Code & Cascade Session Invalidation
    // ══════════════════════════════════════════════════════════════════════
    suiteHeader("SUITE 4: Password Reset Code & Cascade Session Invalidation");

    // Existing user has an active session from Suite 2
    const sessionsBefore = await prisma.session.findMany({
      where: { userId: dbUserVerified!.id },
    });
    assert(sessionsBefore.length > 0, "Patient has active login session before password reset");

    // Request password reset OTP
    console.log(`  ${colors.dim}Dispatching password reset code for ${testEmail}...${colors.reset}`);
    await (auth.api as any).sendVerificationOTP({
      body: {
        email: testEmail,
        type: "forget-password",
      },
    });

    const resetEmitted = getLastEmittedOTP();
    assert(Boolean(resetEmitted), "sendVerificationOTP triggered for password reset");
    assert(resetEmitted?.type === "forget-password", "OTP dispatch type is strictly 'forget-password'");
    assert(/^\d{6}$/.test(resetEmitted?.otp || ""), "Emitted Password Reset Code is strictly 6 numeric digits", resetEmitted?.otp);

    // Reset password using the code
    const newPassword = "NewSecretPassword2026!#";
    await (auth.api as any).resetPasswordEmailOTP({
      body: {
        email: testEmail,
        otp: resetEmitted!.otp,
        password: newPassword,
      },
    });

    // Check that previous sessions were purged (revocation)
    const sessionsAfter = await prisma.session.findMany({
      where: { userId: dbUserVerified!.id },
    });
    assert(sessionsAfter.length === 0, "All previous user sessions invalidated upon password reset (cascade revocation)");

    // Old password fails, new password succeeds
    let oldPasswordRejected = false;
    try {
      await auth.api.signInEmail({
        body: { email: testEmail, password: testPassword },
      });
    } catch {
      oldPasswordRejected = true;
    }
    assert(oldPasswordRejected, "Signing in with old password is rejected");

    const newSignInRes = await auth.api.signInEmail({
      body: { email: testEmail, password: newPassword },
    });
    assert(Boolean(newSignInRes?.user && newSignInRes?.token), "Signing in with new password succeeds and creates new session");

    // ══════════════════════════════════════════════════════════════════════
    // Cleanup
    // ══════════════════════════════════════════════════════════════════════
    console.log(`\n  ${colors.dim}Cleaning up test records from database...${colors.reset}`);
    await prisma.user.deleteMany({
      where: { email: { in: [testEmail, lockoutEmail] } },
    });
    await prisma.verification.deleteMany({
      where: {
        identifier: {
          in: [
            `email-verification:${testEmail}`,
            `email-verification:${lockoutEmail}`,
            `forget-password:${testEmail}`,
            testEmail,
            lockoutEmail,
          ],
        },
      },
    });
    console.log(`  ${colors.green}✓${colors.reset} Database cleaned.`);

  } catch (error: any) {
    console.error(`\n${colors.red}FATAL ERROR IN TEST SUITE:${colors.reset}`, error);
    process.exitCode = 1;
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n${colors.bright}${colors.cyan}══════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`  Total Tests: ${totalTests}`);
  console.log(`  Passed:      ${colors.green}${passedTests}${colors.reset}`);
  console.log(`  Failed:      ${failedTests > 0 ? colors.red : colors.green}${failedTests}${colors.reset}`);
  console.log(`  Duration:    ${duration}s`);
  console.log(`${colors.bright}${colors.cyan}══════════════════════════════════════════════════════════════════════${colors.reset}\n`);

  if (failedTests > 0) {
    process.exitCode = 1;
  }
}

runOTPAuthAudit().catch(console.error);
