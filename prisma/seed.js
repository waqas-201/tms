const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const envPath = path.resolve(__dirname, "../.env");
const content = fs.readFileSync(envPath, "utf-8");
let connectionString = "";

for (const line of content.split("\n")) {
  const trimmed = line.trim();
  if (trimmed.startsWith("DATABASE_URL=")) {
    let val = trimmed.replace("DATABASE_URL=", "").trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    connectionString = val;
    break;
  }
}

if (!connectionString) {
  console.error("❌ DATABASE_URL missing from .env");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const { PRODUCTS, CATEGORIES } = require("../app/data/products.ts");

const STANDARD_UNITS = [
  { code: "g", name: "Gram", kind: "WEIGHT" },
  { code: "kg", name: "Kilogram", kind: "WEIGHT" },
  { code: "ml", name: "Millilitre", kind: "VOLUME" },
  { code: "l", name: "Litre", kind: "VOLUME" },
  { code: "jar", name: "Jar", kind: "PACK" },
  { code: "bottle", name: "Bottle", kind: "PACK" },
  { code: "box", name: "Box", kind: "PACK" },
  { code: "pcs", name: "Pieces", kind: "COUNT" },
  { code: "tola", name: "Tola", kind: "WEIGHT" },
];

async function run() {
  console.log("🌱 Seeding Neon PostgreSQL Database (Master Catalog & Admin)...");

  // 1. Standard Units
  for (const unit of STANDARD_UNITS) {
    await prisma.unit.upsert({
      where: { code: unit.code },
      update: { name: unit.name, kind: unit.kind, isActive: true },
      create: { code: unit.code, name: unit.name, kind: unit.kind, isActive: true },
    });
  }
  console.log(`✅ ${STANDARD_UNITS.length} Measurement Units seeded.`);

  // 2. Categories
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {
        slug: cat.slug,
        name: cat.name,
        urduName: cat.urduName,
        description: cat.description,
        heroImage: cat.heroImage,
      },
      create: {
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        urduName: cat.urduName,
        description: cat.description,
        heroImage: cat.heroImage,
      },
    });
  }
  console.log(`✅ ${CATEGORIES.length} Categories seeded.`);

  // 3. Products
  for (const prod of PRODUCTS) {
    const createdProduct = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        urduName: prod.urduName,
        categoryId: prod.category,
        categoryLabel: prod.categoryLabel,
        categoryUrdu: prod.categoryUrdu,
        shortDescription: prod.shortDescription,
        fullDescription: prod.fullDescription,
        traditionalPurpose: prod.traditionalPurpose,
        benefits: JSON.stringify(prod.benefits),
        ingredients: JSON.stringify(prod.ingredients),
        howToUse: prod.howToUse,
        dosage: prod.dosage,
        hakimAdvice: prod.hakimAdvice,
        warnings: JSON.stringify(prod.warnings || []),
        price: prod.price,
        originalPrice: prod.originalPrice || null,
        discountPercentage: prod.discountPercentage || null,
        image: prod.image,
        inStock: prod.inStock,
        featured: prod.featured || false,
        rating: prod.rating || 5.0,
        reviewCount: prod.reviews || 0,
        badge: prod.badge || null,
        mizaj: prod.mizaj || null,
      },
      create: {
        id: prod.id,
        slug: prod.slug,
        name: prod.name,
        urduName: prod.urduName,
        categoryId: prod.category,
        categoryLabel: prod.categoryLabel,
        categoryUrdu: prod.categoryUrdu,
        shortDescription: prod.shortDescription,
        fullDescription: prod.fullDescription,
        traditionalPurpose: prod.traditionalPurpose,
        benefits: JSON.stringify(prod.benefits),
        ingredients: JSON.stringify(prod.ingredients),
        howToUse: prod.howToUse,
        dosage: prod.dosage,
        hakimAdvice: prod.hakimAdvice,
        warnings: JSON.stringify(prod.warnings || []),
        price: prod.price,
        originalPrice: prod.originalPrice || null,
        discountPercentage: prod.discountPercentage || null,
        image: prod.image,
        inStock: prod.inStock,
        featured: prod.featured || false,
        rating: prod.rating || 5.0,
        reviewCount: prod.reviews || 0,
        badge: prod.badge || null,
        mizaj: prod.mizaj || null,
      },
    });

    if (prod.sizes && prod.sizes.length > 0) {
      await prisma.productSize.deleteMany({
        where: { productId: createdProduct.id },
      });

      for (const size of prod.sizes) {
        await prisma.productSize.create({
          data: {
            productId: createdProduct.id,
            name: size.name,
            weight: size.weight,
            price: size.price,
            originalPrice: size.originalPrice || null,
            stockOnHand: 50, // Healthy starting baseline stock
            lowStockThreshold: 5,
            isActive: true,
          },
        });
      }
    }
  }
  console.log(`✅ ${PRODUCTS.length} Master Products seeded.`);

  // 4. Admin User
  await prisma.user.upsert({
    where: { email: "admin@tameeresehat.com" },
    update: {
      role: "admin",
      name: "Hakim Tariq Mehmood",
      phone: "0318-2311310",
      city: "Karachi",
    },
    create: {
      email: "admin@tameeresehat.com",
      name: "Hakim Tariq Mehmood",
      role: "admin",
      phone: "0318-2311310",
      city: "Karachi",
    },
  });
  console.log("✅ Master Admin user confirmed.");

  console.log("🎉 Master catalog seed complete. Zero demo/test transactions added!");
}

run()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
