import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { auth } from "../lib/auth";

const TIDB_URL = process.env.DATABASE_URL;
if (!TIDB_URL) {
  throw new Error("DATABASE_URL is not set");
}

async function main() {
  console.log("🚀 Starting TiDB Cloud Data Migration & Seeding...");
  console.log("Connecting to TiDB Cloud endpoint...");

  const pool = new Pool({
    connectionString: TIDB_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // 1. Seed Measurement Units
    console.log("\n📦 1. Seeding Measurement Units...");
    const defaultUnits = [
      { id: "g", code: "g", name: "Gram", kind: "WEIGHT" },
      { id: "kg", code: "kg", name: "Kilogram", kind: "WEIGHT" },
      { id: "ml", code: "ml", name: "Millilitre", kind: "VOLUME" },
      { id: "l", code: "l", name: "Litre", kind: "VOLUME" },
      { id: "pcs", code: "pcs", name: "Pieces", kind: "COUNT" },
      { id: "jar", code: "jar", name: "Jar", kind: "PACK" },
      { id: "bottle", code: "bottle", name: "Bottle", kind: "PACK" },
    ];

    for (const u of defaultUnits) {
      await prisma.unit.upsert({
        where: { code: u.code },
        update: { name: u.name, kind: u.kind },
        create: u,
      });
    }
    console.log(`✓ Seeded ${defaultUnits.length} units.`);

    // 2. Seed Categories
    console.log("\n🏷️ 2. Seeding Categories...");
    const categoryMap = [
      {
        id: "herbs",
        name: "Herbs & Botanicals",
        urdu: "جڑی بوٹیاں",
        desc: "Authentic single-herb roots, barks, seeds, and botanical powders for traditional compounding.",
        hero: "/images/categories/herbs.jpg",
      },
      {
        id: "herbs-seeds",
        name: "Herbal Seeds & Kernels",
        urdu: "تخم و بیج",
        desc: "Premium graded botanical seeds, kernels, and medicinal grains.",
        hero: "/images/categories/seeds.jpg",
      },
      {
        id: "murabbajaat",
        name: "Murabbajaat (Herbal Preserves)",
        urdu: "مربہ جات و معجون",
        desc: "Traditional Unani herbal preserves, majoons, and therapeutic sweet preserves.",
        hero: "/images/categories/murabba.jpg",
      },
      {
        id: "oils-marham",
        name: "Pure Herbal Oils & Balms",
        urdu: "روغنیات و مرہم",
        desc: "Cold-pressed herbal oils, pain relief balms, and therapeutic tinctures.",
        hero: "/images/categories/oils.jpg",
      },
      {
        id: "teas-vitality",
        name: "Dry Fruit Blends & Vitality",
        urdu: "خشک میوہ جات و مقویات",
        desc: "Handpicked dry fruits, vitality blends, and natural wellness tonics.",
        hero: "/images/categories/dry-fruits.jpg",
      },
      {
        id: "apothecary-blends",
        name: "Health Collections & Apothecary",
        urdu: "طبی مرکبات و علاج",
        desc: "Curated therapeutic wellness regimens and classical formulations.",
        hero: "/images/categories/blends.jpg",
      },
    ];

    for (const cat of categoryMap) {
      await prisma.category.upsert({
        where: { id: cat.id },
        update: { name: cat.name, urduName: cat.urdu, description: cat.desc, heroImage: cat.hero },
        create: {
          id: cat.id,
          slug: cat.id,
          name: cat.name,
          urduName: cat.urdu,
          description: cat.desc,
          heroImage: cat.hero,
        },
      });
    }
    console.log(`✓ Seeded ${categoryMap.length} categories.`);

    // 3. Seed Products and Variations from migrated-products.json
    console.log("\n🌿 3. Seeding 425 Products & Variations into TiDB...");
    const productsDataPath = path.resolve(__dirname, "../app/data/migrated-products.json");
    if (!fs.existsSync(productsDataPath)) {
      throw new Error(`Product data file not found at ${productsDataPath}`);
    }

    const rawProducts = JSON.parse(fs.readFileSync(productsDataPath, "utf8"));
    console.log(`Found ${rawProducts.length} products to insert/upsert.`);

    let count = 0;
    for (const prod of rawProducts) {
      // Ensure category exists
      await prisma.category.upsert({
        where: { id: prod.categoryId },
        update: { name: prod.categoryLabel, urduName: prod.categoryUrdu },
        create: {
          id: prod.categoryId,
          slug: prod.categoryId,
          name: prod.categoryLabel,
          urduName: prod.categoryUrdu,
          description: `${prod.categoryLabel} remedies and pure botanical formulations.`,
          heroImage: prod.image,
        },
      });

      // Upsert Product
      const upsertedProduct = await prisma.product.upsert({
        where: { slug: prod.slug },
        update: {
          name: prod.name,
          urduName: prod.urduName || "",
          categoryId: prod.categoryId,
          categoryLabel: prod.categoryLabel,
          categoryUrdu: prod.categoryUrdu || "",
          shortDescription: prod.shortDescription || "",
          fullDescription: prod.fullDescription || "",
          traditionalPurpose: prod.traditionalPurpose || "",
          benefits: JSON.stringify(prod.benefits || []),
          ingredients: JSON.stringify(prod.ingredients || []),
          howToUse: prod.howToUse || "",
          dosage: prod.dosage || "",
          hakimAdvice: prod.hakimAdvice || "",
          warnings: JSON.stringify(prod.warnings || []),
          price: prod.price || 0,
          originalPrice: prod.originalPrice || null,
          discountPercentage: prod.discountPercentage || null,
          image: prod.image || "/images/placeholder.jpg",
          inStock: Boolean(prod.inStock),
          featured: Boolean(prod.featured),
          rating: prod.rating || 5.0,
          reviewCount: prod.reviewCount || 5,
          badge: prod.badge || null,
          mizaj: prod.mizaj || null,
        },
        create: {
          slug: prod.slug,
          name: prod.name,
          urduName: prod.urduName || "",
          categoryId: prod.categoryId,
          categoryLabel: prod.categoryLabel,
          categoryUrdu: prod.categoryUrdu || "",
          shortDescription: prod.shortDescription || "",
          fullDescription: prod.fullDescription || "",
          traditionalPurpose: prod.traditionalPurpose || "",
          benefits: JSON.stringify(prod.benefits || []),
          ingredients: JSON.stringify(prod.ingredients || []),
          howToUse: prod.howToUse || "",
          dosage: prod.dosage || "",
          hakimAdvice: prod.hakimAdvice || "",
          warnings: JSON.stringify(prod.warnings || []),
          price: prod.price || 0,
          originalPrice: prod.originalPrice || null,
          discountPercentage: prod.discountPercentage || null,
          image: prod.image || "/images/placeholder.jpg",
          inStock: Boolean(prod.inStock),
          featured: Boolean(prod.featured),
          rating: prod.rating || 5.0,
          reviewCount: prod.reviewCount || 5,
          badge: prod.badge || null,
          mizaj: prod.mizaj || null,
        },
      });

      // Upsert Product Variations (Sizes)
      if (Array.isArray(prod.sizes) && prod.sizes.length > 0) {
        for (const s of prod.sizes) {
          const sku = s.sku || `${prod.slug}-${(s.name || s.weight || "").toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
          await prisma.productSize.upsert({
            where: {
              sku,
            },
            update: {
              name: s.name || s.weight,
              weight: s.weight || s.name,
              price: s.price || prod.price || 0,
              originalPrice: s.originalPrice || null,
              unitId: s.unitId || "g",
              quantityValue: typeof s.quantityValue === "number" ? s.quantityValue : 1,
              stockOnHand: typeof s.stockOnHand === "number" ? s.stockOnHand : 50,
              stockReserved: 0,
              lowStockThreshold: 5,
              isActive: s.isActive !== false,
            },
            create: {
              productId: upsertedProduct.id,
              name: s.name || s.weight,
              weight: s.weight || s.name,
              price: s.price || prod.price || 0,
              originalPrice: s.originalPrice || null,
              unitId: s.unitId || "g",
              quantityValue: typeof s.quantityValue === "number" ? s.quantityValue : 1,
              sku,
              stockOnHand: typeof s.stockOnHand === "number" ? s.stockOnHand : 50,
              stockReserved: 0,
              lowStockThreshold: 5,
              isActive: s.isActive !== false,
            },
          });
        }
      }

      count++;
      if (count % 50 === 0 || count === rawProducts.length) {
        console.log(`  ✓ Inserted ${count} / ${rawProducts.length} products`);
      }
    }

    // 4. Seed Marketing Settings
    console.log("\n📣 4. Seeding Marketing Settings...");
    await prisma.marketingSetting.upsert({
      where: { id: "default" },
      update: {
        isReferralActive: false,
        referrerRewardPoints: 100,
        refereeWelcomeDiscount: 200,
        referralMinOrderSubtotal: 1000,
        isLoyaltyProgramActive: true,
        apothecaryEarnPercent: 0.02,
        hijamaEarnPoints: 50,
        consultationEarnPoints: 30,
        minRedemptionPoints: 200,
        maxRedemptionSubtotalCap: 0.1,
        homeBannerText: "Special Offer: 10% Off All Apothecary Remedies with code SEHAT10",
        homeBannerActive: true,
      },
      create: {
        id: "default",
        isReferralActive: false,
        referrerRewardPoints: 100,
        refereeWelcomeDiscount: 200,
        referralMinOrderSubtotal: 1000,
        isLoyaltyProgramActive: true,
        apothecaryEarnPercent: 0.02,
        hijamaEarnPoints: 50,
        consultationEarnPoints: 30,
        minRedemptionPoints: 200,
        maxRedemptionSubtotalCap: 0.1,
        homeBannerText: "Special Offer: 10% Off All Apothecary Remedies with code SEHAT10",
        homeBannerActive: true,
      },
    });
    console.log("✓ Seeded default marketing settings.");

    // 5. Seed Delivery Settings
    console.log("\n🚚 5. Seeding Delivery Settings...");
    await prisma.deliverySetting.upsert({
      where: { id: "default" },
      update: {
        storeName: "Matab Tameer-e-sehat",
        storeAddress: "Plot no L, 41 Korangi Crossing Rd, K.D.A Allah Wala Town Sector 31 B Korangi, Karachi, Pakistan",
        storeLatitude: 24.8291,
        storeLongitude: 67.1147,
        pricePerKm: 25.0,
        baseDeliveryFee: 100.0,
        minDeliveryFee: 150.0,
        maxLocalRadiusKm: 50.0,
        flatCourierFee: 200.0,
        freeShippingThreshold: 2000.0,
        isDynamicDeliveryEnabled: true,
      },
      create: {
        id: "default",
        storeName: "Matab Tameer-e-sehat",
        storeAddress: "Plot no L, 41 Korangi Crossing Rd, K.D.A Allah Wala Town Sector 31 B Korangi, Karachi, Pakistan",
        storeLatitude: 24.8291,
        storeLongitude: 67.1147,
        pricePerKm: 25.0,
        baseDeliveryFee: 100.0,
        minDeliveryFee: 150.0,
        maxLocalRadiusKm: 50.0,
        flatCourierFee: 200.0,
        freeShippingThreshold: 2000.0,
        isDynamicDeliveryEnabled: true,
      },
    });
    console.log("✓ Seeded default delivery settings.");

    // 6. Seed Consultation & Hijama Settings
    console.log("\n🩺 6. Seeding Clinical Settings...");
    await prisma.consultationSetting.upsert({
      where: { id: "default" },
      update: { standardFee: 1500, isFeeActive: true },
      create: { id: "default", standardFee: 1500, isFeeActive: true },
    });

    await prisma.hijamaSetting.upsert({
      where: { id: "default" },
      update: {
        moonSightingOffset: -1,
        sunnahMaleCapacity: 4,
        sunnahFemaleCapacity: 4,
        standardFee: 2500,
      },
      create: {
        id: "default",
        moonSightingOffset: -1,
        sunnahMaleCapacity: 4,
        sunnahFemaleCapacity: 4,
        standardFee: 2500,
      },
    });
    console.log("✓ Seeded clinical settings.");

    // 7. Seed Clinic Schedules
    console.log("\n📅 7. Seeding Clinic & Hijama Operating Schedules...");
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const dayName = dayNames[dayOfWeek];
      const isOpen = dayOfWeek !== 0; // Sunday closed by default

      await prisma.clinicSchedule.upsert({
        where: { dayOfWeek },
        update: { dayName, isOpen, openTime: "10:00", closeTime: "21:00", slotDurationMins: 60, maxSlotsPerWindow: 1 },
        create: { dayOfWeek, dayName, isOpen, openTime: "10:00", closeTime: "21:00", slotDurationMins: 60, maxSlotsPerWindow: 1 },
      });

      await prisma.hijamaScheduleConfig.upsert({
        where: { dayOfWeek },
        update: { dayName, isOpen, openTime: "10:00", closeTime: "21:00", slotDurationMins: 45, maxMaleCapacity: 2, maxFemaleCapacity: 2 },
        create: { dayOfWeek, dayName, isOpen, openTime: "10:00", closeTime: "21:00", slotDurationMins: 45, maxMaleCapacity: 2, maxFemaleCapacity: 2 },
      });
    }
    console.log("✓ Seeded 7 days of clinic & Hijama schedules.");

    // 8. Seed Promotional Coupons
    console.log("\n🎟️ 8. Seeding Promotional Coupons...");
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
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const c of couponsToSeed) {
      await prisma.coupon.upsert({
        where: { code: c.code },
        update: c,
        create: c,
      });
    }
    console.log(`✓ Seeded ${couponsToSeed.length} promotional coupons.`);

    // 9. Seed Admin Account with Better-Auth
    console.log("\n👤 9. Seeding Administrator Account...");
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@tameeresehat.com").toLowerCase();
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;
    if (!adminPassword) {
      throw new Error("ADMIN_INITIAL_PASSWORD environment variable is required");
    }
    const adminName = "Hakeem Tahir Hameed (Admin)";

    let existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
      include: { accounts: true },
    });

    if (!existingAdmin) {
      console.log(`Creating admin account for ${adminEmail}...`);
      try {
        await auth.api.signUpEmail({
          body: {
            email: adminEmail,
            password: adminPassword,
            name: adminName,
          },
        });
        await prisma.user.update({
          where: { email: adminEmail },
          data: { role: "admin", city: "Karachi", phone: "0335-3547888", emailVerified: true },
        });
        console.log("✓ Admin account created and verified.");
      } catch (err: any) {
        console.warn("Could not create admin via Better-Auth API:", err?.message);
      }
    } else {
      console.log(`Admin account ${adminEmail} already exists.`);
      if (existingAdmin.role !== "admin") {
        await prisma.user.update({
          where: { email: adminEmail },
          data: { role: "admin", emailVerified: true },
        });
        console.log("✓ Updated role to admin.");
      }
    }

    console.log("\n🎉 TiDB Cloud Migration & Seeding Completed Successfully!");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
