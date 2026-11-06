import prisma from "../lib/prisma";
import { validateCoupon, recordCouponRedemption } from "../lib/coupons";

async function runTests() {
  console.log("==================================================");
  console.log("   🧪 RUNNING TAMEER-E-SEHAT COUPON SYSTEM TESTS   ");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      if (details) console.error(`     Details: ${details}`);
      failed++;
    }
  }

  try {
    // 1. Multi-Service Scope Isolation Tests
    console.log("\n[Test Suite 1: Service Scope Isolation]");

    // Try applying Hijama coupon to Products
    const hijamaOnProducts = await validateCoupon({
      code: "SUNNAH500",
      scope: "PRODUCTS",
      subtotal: 3000,
    });
    assert(
      !hijamaOnProducts.valid && hijamaOnProducts.error?.includes("exclusively valid for Sunnah Hijama"),
      "Hijama coupon SUNNAH500 is blocked on Products order",
      JSON.stringify(hijamaOnProducts)
    );

    // Try applying Product coupon to Hijama
    const productOnHijama = await validateCoupon({
      code: "SEHAT10",
      scope: "HIJAMA",
      subtotal: 2500,
    });
    assert(
      !productOnHijama.valid && productOnHijama.error?.includes("exclusively valid for herbal apothecary products"),
      "Product coupon SEHAT10 is blocked on Hijama booking",
      JSON.stringify(productOnHijama)
    );

    // Try applying Consultation voucher to Products
    const consultOnProducts = await validateCoupon({
      code: "TIBBIFREE",
      scope: "PRODUCTS",
      subtotal: 2500,
    });
    assert(
      !consultOnProducts.valid && consultOnProducts.error?.includes("exclusively valid for Hakeem consultations"),
      "Consultation voucher TIBBIFREE is blocked on Products order",
      JSON.stringify(consultOnProducts)
    );

    // 2. Margin Protection Safeguards (Caps & Min Spend)
    console.log("\n[Test Suite 2: Profit Margin Protection (Caps & Min Spend)]");

    // Subtotal below minSubtotal (SEHAT10 requires 1,000)
    const belowMinSpend = await validateCoupon({
      code: "SEHAT10",
      scope: "PRODUCTS",
      subtotal: 600,
    });
    assert(
      !belowMinSpend.valid && belowMinSpend.error?.includes("minimum subtotal"),
      "SEHAT10 rejected when subtotal is below minimum spend threshold (₨ 600 < ₨ 1,000)",
      JSON.stringify(belowMinSpend)
    );

    // Subtotal normal (2,000 => 10% = 200, within cap 500)
    const normalSpend = await validateCoupon({
      code: "SEHAT10",
      scope: "PRODUCTS",
      subtotal: 2000,
    });
    assert(
      normalSpend.valid && normalSpend.discountAmount === 200,
      "SEHAT10 applies standard 10% discount on ₨ 2,000 order (Discount: ₨ 200)",
      JSON.stringify(normalSpend)
    );

    // Subtotal large (10,000 => 10% = 1,000, must be capped at 500)
    const cappedSpend = await validateCoupon({
      code: "SEHAT10",
      scope: "PRODUCTS",
      subtotal: 10000,
    });
    assert(
      cappedSpend.valid && cappedSpend.discountAmount === 500,
      "SEHAT10 caps percentage discount at ₨ 500 on large orders (₨ 10,000 subtotal)",
      `Discount amount was: ${cappedSpend.discountAmount}`
    );

    // 3. Hijama Cupping Coupon Validation
    console.log("\n[Test Suite 3: Hijama Cupping Promos]");
    const hijamaValid = await validateCoupon({
      code: "SUNNAH500",
      scope: "HIJAMA",
      subtotal: 2500,
    });
    assert(
      hijamaValid.valid && hijamaValid.discountAmount === 500,
      "SUNNAH500 applies flat ₨ 500 discount to Hijama fee (₨ 2,500 -> ₨ 2,000)",
      JSON.stringify(hijamaValid)
    );

    // 4. Consultation Free Voucher Validation
    console.log("\n[Test Suite 4: Consultation Vouchers]");
    const consultValid = await validateCoupon({
      code: "TIBBIFREE",
      scope: "CONSULTATION",
      subtotal: 1500,
    });
    assert(
      consultValid.valid && consultValid.discountAmount === 1500,
      "TIBBIFREE grants 100% complimentary consultation voucher (Discount: ₨ 1,500)",
      JSON.stringify(consultValid)
    );

    // 5. Anti-Abuse & Per-Customer Redemption Limits
    console.log("\n[Test Suite 5: Anti-Abuse & Per-Customer Redemption Limits]");
    const testCode = `TESTABUSE${Date.now()}`;
    const testPhone = "03001234567";

    const createdCoupon = await prisma.coupon.create({
      data: {
        code: testCode,
        description: "Anti-abuse limit test coupon",
        scope: "PRODUCTS",
        discountType: "FIXED",
        discountValue: 100,
        perUserLimit: 1,
        isActive: true,
      },
    });

    // First redemption attempt - should be valid
    const firstCheck = await validateCoupon({
      code: testCode,
      scope: "PRODUCTS",
      subtotal: 1000,
      phone: testPhone,
    });
    assert(firstCheck.valid, "First redemption is allowed for new customer phone");

    // Record the redemption
    await recordCouponRedemption({
      couponId: createdCoupon.id,
      phone: testPhone,
      discountAmount: 100,
      orderTotal: 900,
    });

    // Second redemption attempt with same phone - should be BLOCKED!
    const secondCheck = await validateCoupon({
      code: testCode,
      scope: "PRODUCTS",
      subtotal: 1000,
      phone: testPhone,
    });
    assert(
      !secondCheck.valid && secondCheck.error?.includes("reached the redemption limit"),
      "Second redemption is blocked by phone number limit",
      JSON.stringify(secondCheck)
    );

    // Cleanup test coupon
    await prisma.coupon.delete({ where: { id: createdCoupon.id } });
    console.log("  ✓ Cleaned up temporary test coupon");

    console.log("\n==================================================");
    console.log(`RESULTS: ${passed} Passed, ${failed} Failed`);
    console.log("==================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
