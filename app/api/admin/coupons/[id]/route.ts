import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";
import { normalizeCouponCode } from "@/lib/coupons";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN]);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        redemptions: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { redeemedAt: "desc" },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: "Coupon not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: coupon });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch coupon." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN]);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Coupon not found." },
        { status: 404 }
      );
    }

    const dataToUpdate: Record<string, any> = {};

    if (body.code !== undefined) {
      const cleanCode = normalizeCouponCode(body.code);
      if (!cleanCode) {
        return NextResponse.json(
          { success: false, error: "Coupon code cannot be empty." },
          { status: 400 }
        );
      }
      if (cleanCode !== existing.code) {
        const dup = await prisma.coupon.findUnique({ where: { code: cleanCode } });
        if (dup) {
          return NextResponse.json(
            { success: false, error: `Coupon code "${cleanCode}" already exists.` },
            { status: 409 }
          );
        }
        dataToUpdate.code = cleanCode;
      }
    }

    if (body.description !== undefined) dataToUpdate.description = String(body.description).trim();
    if (body.scope !== undefined) dataToUpdate.scope = String(body.scope).toUpperCase();
    if (body.discountType !== undefined) dataToUpdate.discountType = String(body.discountType).toUpperCase();
    if (body.discountValue !== undefined) dataToUpdate.discountValue = Number(body.discountValue);
    if (body.minSubtotal !== undefined) {
      dataToUpdate.minSubtotal = body.minSubtotal !== null && body.minSubtotal !== "" ? Number(body.minSubtotal) : null;
    }
    if (body.maxDiscountCap !== undefined) {
      dataToUpdate.maxDiscountCap = body.maxDiscountCap !== null && body.maxDiscountCap !== "" ? Number(body.maxDiscountCap) : null;
    }
    if (body.targetCategoryId !== undefined) dataToUpdate.targetCategoryId = body.targetCategoryId || null;
    if (body.startDate !== undefined) dataToUpdate.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined) dataToUpdate.endDate = body.endDate ? new Date(body.endDate) : null;
    if (body.usageLimit !== undefined) {
      dataToUpdate.usageLimit = body.usageLimit !== null && body.usageLimit !== "" ? Number(body.usageLimit) : null;
    }
    if (body.perUserLimit !== undefined) dataToUpdate.perUserLimit = Number(body.perUserLimit) || 1;
    if (body.isActive !== undefined) dataToUpdate.isActive = Boolean(body.isActive);
    if (body.isFlashSale !== undefined) dataToUpdate.isFlashSale = Boolean(body.isFlashSale);
    if (body.flashSaleBannerText !== undefined) dataToUpdate.flashSaleBannerText = body.flashSaleBannerText?.trim() || null;
    if (body.flashSaleBadge !== undefined) dataToUpdate.flashSaleBadge = body.flashSaleBadge?.trim() || null;

    const updated = await prisma.coupon.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Coupon "${updated.code}" updated successfully.`,
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update coupon." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN]);
    if (errorResponse) return errorResponse;

    const { id } = await params;

    const existing = await prisma.coupon.findUnique({
      where: { id },
      include: { _count: { select: { redemptions: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Coupon not found." },
        { status: 404 }
      );
    }

    // If coupon has historical redemptions, deactivate it to preserve audit records
    if (existing._count.redemptions > 0) {
      await prisma.coupon.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({
        success: true,
        message: `Coupon "${existing.code}" has historical redemptions and was deactivated instead of permanently deleted to preserve audit logs.`,
      });
    }

    // Otherwise safely delete
    await prisma.coupon.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Coupon "${existing.code}" permanently deleted.`,
    });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete coupon." },
      { status: 500 }
    );
  }
}
