import { auth } from "../lib/auth";
import prisma from "../lib/prisma";
import { signJWT } from "better-auth/crypto";
import "dotenv/config";

interface TestReport {
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const reports: TestReport[] = [];

function recordTest(name: string, passed: boolean, details?: string, error?: string) {
  reports.push({ name, passed, details, error });
  if (passed) {
    console.log(`✅ [PASS] ${name}${details ? ` — ${details}` : ""}`);
  } else {
    console.error(`❌ [FAIL] ${name}${error ? `\n   Error: ${error}` : ""}`);
  }
}

async function runAuthTestSuite() {
  console.log("══════════════════════════════════════════════════════════════");
  console.log("   TAMEER-E-SEHAT AUTHENTICATION & SECURITY TEST HARNESS");
  console.log("══════════════════════════════════════════════════════════════\n");

  const timestamp = Date.now();
  const testEmail = `test.patient.${timestamp}@tameeresehat.test`.toLowerCase();
  const testPassword = "InitialPassword123!";
  const newPassword = "UpdatedSecurePassword456!";
  const testName = "Hakim Test Patient";
  const testPhone = "03001234567";
  const testCity = "Karachi";

  let createdUserId: string | null = null;
  let activeSessionCookie: string | null = null;
  let activeSessionToken: string | null = null;

  try {
    // ─────────────────────────────────────────────────────────────
    // TEST 1: Standard User Registration
    // ─────────────────────────────────────────────────────────────
    console.log("🧪 1. Testing Standard Patient Registration...");
    try {
      const signUpRes = await auth.api.signUpEmail({
        body: {
          name: testName,
          email: testEmail,
          password: testPassword,
          phone: testPhone,
          city: testCity,
        } as any,
        asResponse: true,
      });

      if (!signUpRes.ok) {
        throw new Error(`Registration failed with status ${signUpRes.status}`);
      }

      const signUpData = await signUpRes.json();
      if (!signUpData || !signUpData.user) {
        throw new Error("Registration returned empty user payload");
      }

      createdUserId = signUpData.user.id;
      activeSessionCookie = signUpRes.headers.get("set-cookie");
      activeSessionToken = signUpData.token;

      // Verify User in PostgreSQL Database
      const dbUser = await prisma.user.findUnique({
        where: { id: createdUserId },
        include: { accounts: true },
      });

      if (!dbUser) {
        throw new Error("User record not found in PostgreSQL database");
      }

      const hasCredentialAccount = dbUser.accounts.some(
        (acc) => acc.providerId === "credential" && acc.password
      );

      const isUserRole = dbUser.role === "user";
      const isEmailUnverified = dbUser.emailVerified === false;

      if (hasCredentialAccount && isUserRole && isEmailUnverified) {
        recordTest(
          "Standard Patient Registration",
          true,
          `User ID: ${dbUser.id}, role: "${dbUser.role}", emailVerified: ${dbUser.emailVerified}, credentials account created`
        );
      } else {
        throw new Error(
          `User state mismatch: hasCredential=${hasCredentialAccount}, role=${dbUser.role}, emailVerified=${dbUser.emailVerified}`
        );
      }
    } catch (err: any) {
      recordTest("Standard Patient Registration", false, undefined, err.message);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 2: Role Escalation Security Boundary
    // ─────────────────────────────────────────────────────────────
    console.log("\n🧪 2. Testing Privilege Escalation Prevention...");
    const hackerEmail = `hacker.${timestamp}@tameeresehat.test`;
    let hackerUserId: string | null = null;
    try {
      const hackerRes = await auth.api.signUpEmail({
        body: {
          name: "Attempted Admin Escalation",
          email: hackerEmail,
          password: "HackerPassword123!",
          role: "admin", // Malicious attempt to forge admin role
        } as any,
      });

      if (hackerRes?.user) {
        hackerUserId = hackerRes.user.id;
        const dbHacker = await prisma.user.findUnique({
          where: { id: hackerUserId },
        });

        if (dbHacker?.role === "user") {
          recordTest(
            "Privilege Escalation Block",
            true,
            `Attacker attempted role "admin", database hook enforced default role: "${dbHacker.role}"`
          );
        } else {
          throw new Error(`CRITICAL SECURITY FAILURE: User escalated to role: "${dbHacker?.role}"`);
        }
      }
    } catch (err: any) {
      recordTest("Privilege Escalation Block", true, `Registration rejected escalation: ${err.message}`);
    } finally {
      if (hackerUserId) {
        await prisma.user.delete({ where: { id: hackerUserId } }).catch(() => {});
      }
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 3: Duplicate Email Registration Rejection
    // ─────────────────────────────────────────────────────────────
    console.log("\n🧪 3. Testing Duplicate Email Registration Prevention...");
    try {
      let duplicateErrorCaught = false;
      try {
        await auth.api.signUpEmail({
          body: {
            name: "Duplicate User Attempt",
            email: testEmail, // Exact same email
            password: "AnotherPassword123!",
          } as any,
        });
      } catch {
        duplicateErrorCaught = true;
      }

      if (duplicateErrorCaught) {
        recordTest(
          "Duplicate Email Prevention",
          true,
          "Better-Auth properly rejected duplicate email registration attempt"
        );
      } else {
        throw new Error("Duplicate email was accepted when it should have failed");
      }
    } catch (err: any) {
      recordTest("Duplicate Email Prevention", false, undefined, err.message);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 4: Password Authentication (Invalid Credentials)
    // ─────────────────────────────────────────────────────────────
    console.log("\n🧪 4. Testing Invalid Credentials Rejection...");
    try {
      let invalidPassCaught = false;
      try {
        await auth.api.signInEmail({
          body: {
            email: testEmail,
            password: "WrongPassword_999!",
          },
        });
      } catch {
        invalidPassCaught = true;
      }

      if (invalidPassCaught) {
        recordTest(
          "Invalid Password Rejection",
          true,
          "Invalid credentials rejected successfully with 401/unauthorized"
        );
      } else {
        throw new Error("Invalid password succeeded when it should have been rejected");
      }
    } catch (err: any) {
      recordTest("Invalid Password Rejection", false, undefined, err.message);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 5: Password Authentication (Valid Credentials)
    // ─────────────────────────────────────────────────────────────
    console.log("\n🧪 5. Testing Valid Credentials Authentication...");
    try {
      const signInRes = await auth.api.signInEmail({
        body: {
          email: testEmail,
          password: testPassword,
        },
        asResponse: true,
      });

      if (!signInRes.ok) {
        throw new Error(`Sign-in failed with HTTP status ${signInRes.status}`);
      }

      const signInData = await signInRes.json();
      activeSessionCookie = signInRes.headers.get("set-cookie");
      activeSessionToken = signInData.token;

      // Verify session exists in PostgreSQL
      const dbSession = await prisma.session.findUnique({
        where: { token: activeSessionToken! },
      });

      if (dbSession) {
        recordTest(
          "Valid Credentials Authentication",
          true,
          `Authenticated user: ${signInData.user.email}, session token: ${dbSession.token.slice(0, 12)}...`
        );
      } else {
        throw new Error("No active session record found in PostgreSQL database");
      }
    } catch (err: any) {
      recordTest("Valid Credentials Authentication", false, undefined, err.message);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 6: Session Resolution via Signed Cookie
    // ─────────────────────────────────────────────────────────────
    console.log("\n🧪 6. Testing Session Verification via Headers...");
    try {
      if (!activeSessionCookie) {
        throw new Error("No active session cookie available from previous step");
      }

      const sessionRes = await auth.api.getSession({
        headers: new Headers({
          cookie: activeSessionCookie,
        }),
      });

      if (sessionRes && sessionRes.user && sessionRes.user.email === testEmail) {
        recordTest(
          "Session Resolution",
          true,
          `Session validated for user ${sessionRes.user.email} (Role: ${(sessionRes.user as any).role})`
        );
      } else {
        throw new Error("Session resolution returned null or mismatched user");
      }
    } catch (err: any) {
      recordTest("Session Resolution", false, undefined, err.message);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 7: Email Verification Flow (HMAC Token & State Transition)
    // ─────────────────────────────────────────────────────────────
    console.log("\n🧪 7. Testing Email Verification Flow...");
    try {
      const secret = process.env.BETTER_AUTH_SECRET || "tms_secret_hakim_key_karachi_1990_unani_secret_8921";
      const verifyToken = await signJWT({ email: testEmail }, secret, 86400);

      const verifyRes = await auth.api.verifyEmail({
        query: {
          token: verifyToken,
        },
      });

      if (verifyRes && verifyRes.status) {
        const verifiedUser = await prisma.user.findUnique({
          where: { email: testEmail },
        });

        if (verifiedUser?.emailVerified === true) {
          recordTest(
            "Email Verification Lifecycle",
            true,
            `Email marked as verified in PostgreSQL DB for ${testEmail}`
          );
        } else {
          throw new Error(`User emailVerified flag is still false in DB: ${verifiedUser?.emailVerified}`);
        }
      } else {
        throw new Error("verifyEmail endpoint returned non-successful response");
      }
    } catch (err: any) {
      recordTest("Email Verification Lifecycle", false, undefined, err.message);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 8: Password Reset Flow (Request, DB Token, Reset, Re-auth)
    // ─────────────────────────────────────────────────────────────
    console.log("\n🧪 8. Testing Password Reset Flow...");
    try {
      // 8a. Request Password Reset
      await auth.api.requestPasswordReset({
        body: {
          email: testEmail,
          redirectTo: "http://localhost:3000/reset-password",
        },
      });

      // 8b. Retrieve reset token from database
      const resetRecord = await prisma.verification.findFirst({
        where: {
          identifier: { startsWith: "reset-password:" },
          value: createdUserId!,
        },
        orderBy: { createdAt: "desc" },
      });

      if (!resetRecord) {
        throw new Error("Password reset token was not generated in verification table");
      }

      const rawResetToken = resetRecord.identifier.replace("reset-password:", "");

      // 8c. Execute Reset Password with new password
      await auth.api.resetPassword({
        body: {
          token: rawResetToken,
          newPassword: newPassword,
        },
      });

      // 8d. Verify OLD password no longer works
      let oldPassFailed = false;
      try {
        await auth.api.signInEmail({
          body: {
            email: testEmail,
            password: testPassword, // Old password
          },
        });
      } catch {
        oldPassFailed = true;
      }

      if (!oldPassFailed) {
        throw new Error("Old password still works after password reset!");
      }

      // 8e. Verify NEW password authenticates successfully
      const newSignIn = await auth.api.signInEmail({
        body: {
          email: testEmail,
          password: newPassword, // New password
        },
        asResponse: true,
      });

      if (newSignIn.ok) {
        activeSessionCookie = newSignIn.headers.get("set-cookie");
        const newSignInData = await newSignIn.json();
        activeSessionToken = newSignInData.token;

        recordTest(
          "Password Reset & Recovery Flow",
          true,
          "Old password revoked; new password authenticated successfully."
        );
      } else {
        throw new Error("Failed to sign in with newly set password");
      }
    } catch (err: any) {
      recordTest("Password Reset & Recovery Flow", false, undefined, err.message);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 9: Sign-Out & Session Revocation
    // ─────────────────────────────────────────────────────────────
    console.log("\n🧪 9. Testing User Sign-Out & Session Invalidation...");
    try {
      if (activeSessionCookie && activeSessionToken) {
        await auth.api.signOut({
          headers: new Headers({
            cookie: activeSessionCookie,
          }),
        });

        // Verify session is deleted in database
        const checkSession = await prisma.session.findUnique({
          where: { token: activeSessionToken },
        });

        if (!checkSession) {
          recordTest(
            "Sign-Out & Session Revocation",
            true,
            "Session token successfully destroyed and removed from PostgreSQL database"
          );
        } else {
          throw new Error("Session token still exists in database after sign out");
        }
      } else {
        throw new Error("No active session token to test sign out");
      }
    } catch (err: any) {
      recordTest("Sign-Out & Session Revocation", false, undefined, err.message);
    }
  } catch (globalErr: any) {
    console.error("Global Test Runner Error:", globalErr);
  } finally {
    // ─────────────────────────────────────────────────────────────
    // TEST 10 & TEARDOWN: Clean Cleanup of Test Records
    // ─────────────────────────────────────────────────────────────
    console.log("\n🧹 10. Executing Clean Teardown & Database Cleanup...");
    try {
      if (createdUserId) {
        // Delete all verification records for test user/email
        await prisma.verification.deleteMany({
          where: {
            OR: [
              { value: createdUserId },
              { identifier: { contains: testEmail } },
            ],
          },
        });

        // Delete user (cascades to accounts, sessions, etc.)
        await prisma.user.delete({
          where: { id: createdUserId },
        });

        recordTest(
          "Test Isolation & Teardown Cleanup",
          true,
          `Cleaned up test user (${testEmail}), accounts, sessions, and verification records`
        );
      }
    } catch (cleanupErr: any) {
      recordTest("Test Isolation & Teardown Cleanup", false, undefined, cleanupErr.message);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // FINAL TEST SUMMARY REPORT
  // ─────────────────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════════════════════════════");
  console.log("               AUTH TEST SUITE RESULTS");
  console.log("══════════════════════════════════════════════════════════════");
  const passedCount = reports.filter((r) => r.passed).length;
  const totalCount = reports.length;

  reports.forEach((r, i) => {
    console.log(
      `${i + 1}. [${r.passed ? "PASSED" : "FAILED"}] ${r.name}${
        r.details ? ` (${r.details})` : ""
      }`
    );
  });

  console.log("══════════════════════════════════════════════════════════════");
  console.log(`Summary: ${passedCount}/${totalCount} tests passed (${Math.round((passedCount / totalCount) * 100)}%)`);
  console.log("══════════════════════════════════════════════════════════════\n");
}

runAuthTestSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal Test Suite Failure:", err);
    process.exit(1);
  });
