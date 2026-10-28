import crypto from "crypto";
import prisma from "./prisma";

export function hashBootstrapKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey.trim()).digest("hex");
}

export function generateRawKey(): string {
  const randomBytes = crypto.randomBytes(18).toString("hex").toUpperCase();
  return `TMS-SUPER-${randomBytes.slice(0, 6)}-${randomBytes.slice(6, 12)}-${randomBytes.slice(12, 18)}`;
}

/**
 * Generate a single-use Bootstrap Key and store its SHA-256 hash in the database.
 * Returns the unhashed raw key to be displayed once to the administrator.
 */
export async function createBootstrapKey(expiresInDays = 7): Promise<{ rawKey: string; keyId: string }> {
  const rawKey = generateRawKey();
  const keyHash = hashBootstrapKey(rawKey);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const record = await prisma.bootstrapKey.create({
    data: {
      keyHash,
      expiresAt,
    },
  });

  return { rawKey, keyId: record.id };
}

/**
 * Verify if the system already possesses an active Super Admin.
 */
export async function hasActiveSuperAdmin(): Promise<boolean> {
  const existingSuperAdmin = await prisma.user.findFirst({
    where: {
      role: "super_admin",
      isActive: true,
      deletedAt: null,
    },
  });
  return !!existingSuperAdmin;
}

/**
 * Atomically verifies and consumes the bootstrap key, permanently revoking it.
 */
export async function redeemBootstrapKey(
  rawKey: string,
  redeemerEmail: string
): Promise<{ success: boolean; error?: string }> {
  const keyHash = hashBootstrapKey(rawKey);

  return await prisma.$transaction(async (tx) => {
    const keyRecord = await tx.bootstrapKey.findUnique({
      where: { keyHash },
    });

    if (!keyRecord) {
      return { success: false, error: "Invalid bootstrap key. Verification failed." };
    }

    if (keyRecord.consumedAt) {
      return { success: false, error: "This bootstrap key has already been consumed and revoked." };
    }

    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
      return { success: false, error: "This bootstrap key has expired." };
    }

    // Permanently consume and revoke the key
    await tx.bootstrapKey.update({
      where: { id: keyRecord.id },
      data: {
        consumedAt: new Date(),
        redeemedBy: redeemerEmail.toLowerCase().trim(),
      },
    });

    return { success: true };
  });
}
