import prisma from "./prisma";

export interface LinkRecordsResult {
  consultations: number;
  hijamaBookings: number;
  orders: number;
}

/**
 * Retro-links guest bookings to a registered patient account using the
 * VERIFIED email address. Consultations and Hijama bookings are created strictly by authenticated
 * accounts, while legacy guest bookings and Orders still support checkout linking.
 */
export async function linkGuestRecordsToUser(params: {
  userId: string;
  email: string;
}): Promise<LinkRecordsResult> {
  const email = params.email.trim();

  if (!params.userId || !email) {
    return { consultations: 0, hijamaBookings: 0, orders: 0 };
  }

  const [hijamaBookings, orders] = await Promise.all([
    prisma.hijamaBooking.updateMany({
      where: {
        userId: null,
        email: { equals: email, mode: "insensitive" },
      },
      data: { userId: params.userId },
    }),
    prisma.order.updateMany({
      where: {
        userId: null,
        email: { equals: email, mode: "insensitive" },
      },
      data: { userId: params.userId },
    }),
  ]);

  return {
    consultations: 0,
    hijamaBookings: hijamaBookings.count,
    orders: orders.count,
  };
}
