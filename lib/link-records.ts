import prisma from "./prisma";

export interface LinkRecordsResult {
  consultations: number;
  hijamaBookings: number;
  orders: number;
}

/**
 * Retro-links guest bookings to a registered patient account using the
 * VERIFIED email address. Phone numbers are deliberately never used here:
 * families often share a phone, so phone matches stay as admin suggestions
 * that staff can link manually from the consultation dossier.
 */
export async function linkGuestRecordsToUser(params: {
  userId: string;
  email: string;
}): Promise<LinkRecordsResult> {
  const email = params.email.trim();

  if (!params.userId || !email) {
    return { consultations: 0, hijamaBookings: 0, orders: 0 };
  }

  const [consultations, hijamaBookings, orders] = await Promise.all([
    prisma.consultationRequest.updateMany({
      where: {
        userId: null,
        email: { equals: email, mode: "insensitive" },
      },
      data: { userId: params.userId },
    }),
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
    consultations: consultations.count,
    hijamaBookings: hijamaBookings.count,
    orders: orders.count,
  };
}
