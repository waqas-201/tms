import prisma from "../lib/prisma";

async function main() {
  const couponsToSeed = [
    {
      code: "SEHAT10",
      description: "10% Off all apothecary herbal remedies (Min order ₨ 1,000, Max discount ₨ 500)",
      scope: "PRODUCTS",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minSubtotal: 1000,
      maxDiscountCap: 500,
      perUserLimit: 2,
      isActive: true,
      isFlashSale: false,
    },
    {
      code: "FREESHIP",
      description: "100% Free Nationwide Delivery on herbal remedy orders over ₨ 2,000",
      scope: "PRODUCTS",
      discountType: "FREE_SHIPPING",
      discountValue: 0,
      minSubtotal: 2000,
      perUserLimit: 5,
      isActive: true,
      isFlashSale: false,
    },
    {
      code: "SUNNAH500",
      description: "₨ 500 Off Sunnah Wet Cupping (Pay ₨ 2,000 instead of standard ₨ 2,500 at clinic)",
      scope: "HIJAMA",
      discountType: "FIXED",
      discountValue: 500,
      perUserLimit: 1,
      isActive: true,
      isFlashSale: false,
    },
    {
      code: "TIBBIFREE",
      description: "100% Complimentary Online Hakeem Consultation Voucher",
      scope: "CONSULTATION",
      discountType: "FREE_SERVICE",
      discountValue: 1500,
      perUserLimit: 1,
      isActive: true,
      isFlashSale: false,
    },
    {
      code: "FLASH20",
      description: "20% Flash Discount on all herbal products & preserves this week",
      scope: "PRODUCTS",
      discountType: "PERCENTAGE",
      discountValue: 20,
      minSubtotal: 1500,
      maxDiscountCap: 750,
      perUserLimit: 1,
      isActive: true,
      isFlashSale: true,
      flashSaleBadge: "⚡ FLASH 20% OFF",
      flashSaleBannerText: "Special Flash Offer: 20% Off All Classical Remedies! Use code FLASH20 at checkout.",
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  ];

  for (const c of couponsToSeed) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
    console.log(`✓ Seeded coupon: ${c.code} (${c.scope})`);
  }
}

main()
  .catch((e) => {
    console.error("Error seeding coupons:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
