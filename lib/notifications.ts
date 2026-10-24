import prisma from "./prisma";

export type AdminNotificationType =
  | "ORDER"
  | "CONSULTATION"
  | "HIJAMA"
  | "INQUIRY";

export interface CreateAdminNotificationInput {
  type: AdminNotificationType;
  title: string;
  message: string;
  link?: string | null;
  entityId?: string | null;
}

/**
 * Records an in-app notification for clinic staff.
 *
 * Notifications are intentionally best-effort: a failure to persist one must
 * never fail the patient-facing booking/order that triggered it. Errors are
 * logged so the issue is still visible in server logs.
 */
export async function createAdminNotification(
  input: CreateAdminNotificationInput
) {
  try {
    return await prisma.adminNotification.create({
      data: {
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link || null,
        entityId: input.entityId || null,
      },
    });
  } catch (error) {
    console.error("[AdminNotification] Failed to record notification:", error);
    return null;
  }
}

/**
 * Returns the most recent staff notifications plus the unread count.
 */
export async function listAdminNotifications(limit = 25) {
  const take = Math.max(1, Math.min(limit, 100));

  const [notifications, unreadCount] = await Promise.all([
    prisma.adminNotification.findMany({
      orderBy: { createdAt: "desc" },
      take,
    }),
    prisma.adminNotification.count({ where: { readAt: null } }),
  ]);

  return { notifications, unreadCount };
}
