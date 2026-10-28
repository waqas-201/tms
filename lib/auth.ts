import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import prisma from "./prisma";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email";
import { linkGuestRecordsToUser } from "./link-records";

let _lastEmittedOTP: { email: string; otp: string; type: string } | null = null;
export function getLastEmittedOTP() {
  return _lastEmittedOTP;
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET || "dev_secret_replace_in_production_key_12345",
  baseURL: (process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, ""),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    onPasswordReset: async ({ user }) => {
      try {
        if (user?.id) {
          await prisma.session.deleteMany({
            where: { userId: user.id },
          });
        }
      } catch (err) {
        console.error("[auth] Failed to purge sessions on password reset:", err);
      }
    },
    resetPasswordTokenExpiresIn: 60 * 60, // 1 hour legacy fallback
    sendResetPassword: async ({ user, url, token }) => {
      const result = await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        url,
        token,
      });

      if (!result.success) {
        console.error(
          "[auth] Password reset email could not be delivered to",
          user.email,
          "—",
          result.error
        );
      }
    },
  },
  emailVerification: {
    sendOnSignUp: false, // Handled automatically by emailOTP plugin with 6-digit OTP passkeys
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24, // 24 hours legacy fallback
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        _lastEmittedOTP = { email, otp, type };
        if (type === "email-verification") {
          const result = await sendVerificationEmail({
            to: email,
            otp,
          });
          if (!result.success) {
            console.error(
              "[auth] Verification code could not be delivered to",
              email,
              "—",
              result.error
            );
          }
        } else if (type === "forget-password") {
          const result = await sendPasswordResetEmail({
            to: email,
            otp,
          });
          if (!result.success) {
            console.error(
              "[auth] Password reset code could not be delivered to",
              email,
              "—",
              result.error
            );
          }
        }
      },
      expiresIn: 300, // 5 minutes
      otpLength: 6,
      allowedAttempts: 3,
      storeOTP: "hashed",
      overrideDefaultEmailVerification: false,
      sendVerificationOnSignUp: true,
      resendStrategy: "rotate",
    }),
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      city: {
        type: "string",
        required: false,
      },
      address: {
        type: "string",
        required: false,
      },
      latitude: {
        type: "number",
        required: false,
      },
      longitude: {
        type: "number",
        required: false,
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: false,
      },
      deletedAt: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user: any) => {
          // If role was explicitly provisioned internally as super_admin or admin, allow it.
          // All standard public user registrations (with input: false on role) default strictly to "user".
          const rawRole = user?.role;
          const requestedRole = typeof rawRole === "string" ? rawRole.toLowerCase().trim() : "";
          const finalRole =
            requestedRole === "super_admin" || requestedRole === "admin"
              ? requestedRole
              : "user";

          return {
            data: {
              ...user,
              role: finalRole,
              isActive: user?.isActive !== undefined ? user.isActive : true,
            },
          };
        },
      },
      update: {
        before: async (user: any) => {
          // Prevent unauthorized role privilege escalation via standard profile update endpoints
          if (user?.role && typeof user.role === "string" && user.role !== "user") {
            const existing = await prisma.user.findUnique({
              where: { id: user.id },
              select: { role: true },
            });
            // Preserve existing role if standard user tries to escalate
            if (existing && existing.role !== user.role && existing.role === "user") {
              return {
                data: {
                  ...user,
                  role: "user",
                },
              };
            }
          }
        },
        after: async (user) => {
          try {
            // Runs after verification updates too — only verified emails may
            // claim guest bookings.
            if (user?.id && user?.email && user?.emailVerified) {
              await linkGuestRecordsToUser({
                userId: user.id,
                email: user.email,
              });
            }
          } catch (err) {
            console.error(
              "[Retro-link] Failed to attach guest records:",
              err
            );
          }
        },
      },
    },
    account: {
      update: {
        after: async (account) => {
          try {
            // Invalidate all active sessions for this user upon password change
            if (account?.userId) {
              await prisma.session.deleteMany({
                where: { userId: account.userId },
              });
            }
          } catch (err) {
            console.error("[auth] Failed to revoke active sessions after password update:", err);
          }
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          if (!session?.userId) return;
          const dbUser = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { isActive: true, deletedAt: true },
          });

          if (dbUser?.deletedAt) {
            throw new Error("This account has been deleted or deactivated.");
          }
          if (dbUser && dbUser.isActive === false) {
            throw new Error("This account has been suspended by clinic administration.");
          }
        },
        // On every fresh login session, attach any guest bookings that were
        // made with this account's verified email address.
        after: async (session) => {
          try {
            if (!session?.userId) return;

            const dbUser = await prisma.user.findUnique({
              where: { id: session.userId },
              select: { id: true, email: true, emailVerified: true },
            });

            if (dbUser?.emailVerified && dbUser.email) {
              await linkGuestRecordsToUser({
                userId: dbUser.id,
                email: dbUser.email,
              });
            }
          } catch (err) {
            console.error(
              "[Retro-link] Failed to attach guest records on login:",
              err
            );
          }
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
