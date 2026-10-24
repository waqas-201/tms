import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email";
import { linkGuestRecordsToUser } from "./link-records";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@tameeresehat.com").toLowerCase().trim();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET || "dev_secret_replace_in_production_key_12345",
  baseURL: (process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, ""),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 60 * 60, // 1 hour
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
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24, // 24 hours
    sendVerificationEmail: async ({ user, url, token }) => {
      const result = await sendVerificationEmail({
        to: user.email,
        name: user.name,
        url,
        token,
      });

      if (!result.success) {
        console.error(
          "[auth] Verification email could not be delivered to",
          user.email,
          "—",
          result.error
        );
      }
    },
  },
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
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const userEmail = (user.email || "").toLowerCase().trim();

          // Check if user is attempting to register as the designated bootstrap admin
          if (userEmail === ADMIN_EMAIL) {
            // Ensure only ONE admin exists across the entire platform
            const existingAdmin = await prisma.user.findFirst({
              where: { role: "admin" },
            });

            // If an admin already exists and it's NOT this email, do not allow creating a second admin
            if (existingAdmin && existingAdmin.email.toLowerCase().trim() !== ADMIN_EMAIL) {
              return {
                data: {
                  ...user,
                  role: "user",
                },
              };
            }

            return {
              data: {
                ...user,
                role: "admin",
                emailVerified: true,
              },
            };
          }

          // All standard public user registrations MUST strictly default to "user"
          return {
            data: {
              ...user,
              role: "user",
            },
          };
        },
      },
      update: {
        before: async (user) => {
          const userEmail = (user.email || "").toLowerCase().trim();
          // Prevent unauthorized role privilege escalation to admin
          if (user.role === "admin" && userEmail !== ADMIN_EMAIL) {
            return {
              data: {
                ...user,
                role: "user",
              },
            };
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
    session: {
      create: {
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
