import prisma from "@/lib/prisma";

export type CouponScope = "PRODUCTS" | "HIJAMA" | "CONSULTATION" | "ALL" | "CATEGORY";
export type CouponDiscountType = "PERCENTAGE" | "FIXED" | "FREE_SHIPPING" | "FREE_SERVICE";

export interface CouponItemInput {
  productId?: string | null;
  categoryId?: string | null;
  price: number;
  quantity: number;
}

export interface CouponValidationInput {
  code: string;
  scope: "PRODUCTS" | "HIJAMA" | "CONSULTATION";
  subtotal: number;
  items?: CouponItemInput[];
  userId?: string | null;
  phone?: string | null;
}

export interface CouponValidationResult {
  valid: boolean;
  error?: string;
  message?: string;
  coupon?: {
    id: string;
    code: string;
    description: string;
    scope: string;
    discountType: string;
    discountValue: number;
    minSubtotal: number | null;
    maxDiscountCap: number | null;
    isFreeShipping: boolean;
  };
  discountAmount: number;
  isFreeShipping: boolean;
}

export function normalizeCouponCode(code: string): string {
  return String(code || "").trim().toUpperCase();
}

export function normalizePhoneNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "");
  if (!digits || digits.length < 7) return null;
  // If Pakistan local format like 03001234567, normalize to 923001234567
  if (digits.startsWith("0") && digits.length === 11) {
    return `92${digits.slice(1)}`;
  }
  return digits;
}

/**
 * Validates a coupon code authoritatively against the database.
 * Enforces scope isolation, active status, date limits, global usage,
 * per-customer limit (by Account ID and Phone), min spend, and max discount caps.
 */
export async function validateCoupon(
  input: CouponValidationInput
): Promise<CouponValidationResult> {
  const cleanCode = normalizeCouponCode(input.code);

  if (!cleanCode) {
    return {
      valid: false,
      error: "Please enter a valid coupon code.",
      discountAmount: 0,
      isFreeShipping: false,
    };
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: cleanCode },
  });

  if (!coupon) {
    return {
      valid: false,
      error: `Coupon "${cleanCode}" does not exist. Please check the spelling.`,
      discountAmount: 0,
      isFreeShipping: false,
    };
  }

  // 1. Check Active Status
  if (!coupon.isActive) {
    return {
      valid: false,
      error: `Coupon "${cleanCode}" is no longer active.`,
      discountAmount: 0,
      isFreeShipping: false,
    };
  }

  // 2. Check Date Window
  const now = new Date();
  if (coupon.startDate && now < coupon.startDate) {
    return {
      valid: false,
      error: `Coupon "${cleanCode}" has not started yet. It will become active soon.`,
      discountAmount: 0,
      isFreeShipping: false,
    };
  }

  if (coupon.endDate && now > coupon.endDate) {
    return {
      valid: false,
      error: `Coupon "${cleanCode}" expired on ${coupon.endDate.toLocaleDateString("en-PK")}.`,
      discountAmount: 0,
      isFreeShipping: false,
    };
  }

  // 3. Check Global Usage Limit
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return {
      valid: false,
      error: `Coupon "${cleanCode}" has reached its maximum total redemptions limit.`,
      discountAmount: 0,
      isFreeShipping: false,
    };
  }

  // 4. Strict Scope Enforcement
  const targetScope = coupon.scope.toUpperCase();
  const requestedScope = input.scope.toUpperCase();

  if (targetScope !== "ALL" && targetScope !== requestedScope) {
    if (targetScope === "CATEGORY" && requestedScope === "PRODUCTS") {
      // Handled below via category matching
    } else {
      let scopeLabel = "other services";
      if (targetScope === "PRODUCTS") scopeLabel = "herbal apothecary products";
      else if (targetScope === "HIJAMA") scopeLabel = "Sunnah Hijama appointments";
      else if (targetScope === "CONSULTATION") scopeLabel = "Hakeem consultations";

      return {
        valid: false,
        error: `Coupon "${cleanCode}" is exclusively valid for ${scopeLabel}. It cannot be applied to ${requestedScope.toLowerCase()}.`,
        discountAmount: 0,
        isFreeShipping: false,
      };
    }
  }

  // Category Scope check for Products
  if (targetScope === "CATEGORY" && coupon.targetCategoryId) {
    const hasCategoryItem = input.items?.some(
      (item) => item.categoryId === coupon.targetCategoryId
    );
    if (!hasCategoryItem) {
      return {
        valid: false,
        error: `Coupon "${cleanCode}" is only applicable to products within the specified category.`,
        discountAmount: 0,
        isFreeShipping: false,
      };
    }
  }

  // 5. Check Minimum Subtotal
  if (coupon.minSubtotal && input.subtotal < coupon.minSubtotal) {
    return {
      valid: false,
      error: `A minimum subtotal of ₨ ${coupon.minSubtotal.toLocaleString()} is required to apply "${cleanCode}". Current subtotal is ₨ ${input.subtotal.toLocaleString()}.`,
      discountAmount: 0,
      isFreeShipping: false,
    };
  }

  // 6. Check Per-User & Per-Phone Limits
  const cleanPhone = normalizePhoneNumber(input.phone);
  if (coupon.perUserLimit && coupon.perUserLimit > 0) {
    const orConditions: Array<{ userId?: string; phone?: string }> = [];
    if (input.userId) {
      orConditions.push({ userId: input.userId });
    }
    if (cleanPhone) {
      orConditions.push({ phone: cleanPhone });
    }

    if (orConditions.length > 0) {
      const priorUses = await prisma.couponRedemption.count({
        where: {
          couponId: coupon.id,
          OR: orConditions,
        },
      });

      if (priorUses >= coupon.perUserLimit) {
        return {
          valid: false,
          error: `You have reached the redemption limit (${coupon.perUserLimit} ${coupon.perUserLimit === 1 ? "time" : "times"}) for coupon "${cleanCode}".`,
          discountAmount: 0,
          isFreeShipping: false,
        };
      }
    }
  }

  // 7. Calculate Discount
  let discountAmount = 0;
  let isFreeShipping = false;

  switch (coupon.discountType) {
    case "PERCENTAGE": {
      const calculated = (input.subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountCap && coupon.maxDiscountCap > 0) {
        discountAmount = Math.min(calculated, coupon.maxDiscountCap);
      } else {
        discountAmount = calculated;
      }
      discountAmount = Math.min(input.subtotal, Math.round(discountAmount));
      break;
    }

    case "FIXED": {
      discountAmount = Math.min(input.subtotal, Math.round(coupon.discountValue));
      break;
    }

    case "FREE_SHIPPING": {
      discountAmount = 0;
      isFreeShipping = true;
      break;
    }

    case "FREE_SERVICE": {
      discountAmount = input.subtotal;
      break;
    }

    default:
      discountAmount = 0;
  }

  return {
    valid: true,
    message: coupon.description || `Coupon "${cleanCode}" applied successfully.`,
    discountAmount,
    isFreeShipping,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      scope: coupon.scope,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minSubtotal: coupon.minSubtotal,
      maxDiscountCap: coupon.maxDiscountCap,
      isFreeShipping,
    },
  };
}

/**
 * Authoritatively records coupon redemption in a transaction and increments usage counter.
 */
export async function recordCouponRedemption(params: {
  couponId: string;
  userId?: string | null;
  phone?: string | null;
  orderId?: string | null;
  hijamaBookingId?: string | null;
  consultationId?: string | null;
  discountAmount: number;
  orderTotal?: number | null;
}) {
  const cleanPhone = normalizePhoneNumber(params.phone);

  return await prisma.$transaction(async (tx) => {
    // Increment usage counter
    await tx.coupon.update({
      where: { id: params.couponId },
      data: {
        usageCount: { increment: 1 },
      },
    });

    // Record individual redemption row for audit & anti-abuse checks
    return await tx.couponRedemption.create({
      data: {
        couponId: params.couponId,
        userId: params.userId || null,
        phone: cleanPhone,
        orderId: params.orderId || null,
        hijamaBookingId: params.hijamaBookingId || null,
        consultationId: params.consultationId || null,
        discountAmount: params.discountAmount,
        orderTotal: params.orderTotal || null,
      },
    });
  });
}
