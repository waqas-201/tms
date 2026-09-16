import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@tameeresehat.com").toLowerCase().trim();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET || "tms_secret_hakim_key_karachi_1990_unani_secret_8921",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    resetPasswordTokenExpiresIn: 60 * 60, // 1 hour
    sendResetPassword: async ({ user, url, token }) => {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        url,
        token,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24, // 24 hours
    sendVerificationEmail: async ({ user, url, token }) => {
      await sendVerificationEmail({
        to: user.email,
        name: user.name,
        url,
        token,
      });
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
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
