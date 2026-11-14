import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { normalizePhoneNumber } from "@/lib/phone";
import { getUserLoyaltyBalance } from "@/lib/loyalty";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        role: true,
        phone: true,
        city: true,
        address: true,
        latitude: true,
        longitude: true,
        membershipId: true,
        referralCode: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User profile not found." },
        { status: 404 }
      );
    }

    const loyaltyBalance = await getUserLoyaltyBalance(session.user.id);

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        loyaltyBalance,
      },
    });
  } catch (error: any) {
    console.error("Error retrieving user profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve profile." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phone, city, address, latitude, longitude } = body;

    const updateData: Record<string, any> = {};

    if (name !== undefined) {
      const cleanName = String(name).trim();
      if (cleanName.length > 0) updateData.name = cleanName;
    }

    if (phone !== undefined) {
      updateData.phone = normalizePhoneNumber(phone);
    }

    if (city !== undefined) {
      updateData.city = city ? String(city).trim() : null;
    }

    if (address !== undefined) {
      updateData.address = address ? String(address).trim() : null;
    }

    if (latitude !== undefined) {
      updateData.latitude =
        latitude === null || latitude === "" || isNaN(Number(latitude))
          ? null
          : Number(latitude);
    }

    if (longitude !== undefined) {
      updateData.longitude =
        longitude === null || longitude === "" || isNaN(Number(longitude))
          ? null
          : Number(longitude);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        role: true,
        phone: true,
        city: true,
        address: true,
        latitude: true,
        longitude: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "Profile and delivery location updated successfully.",
    });
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update profile." },
      { status: 500 }
    );
  }
}
