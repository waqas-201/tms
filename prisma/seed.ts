import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import path from "path";
import fs from "fs";
import { PRODUCTS, CATEGORIES } from "../app/data/products";

// Read DATABASE_URL from .env
let connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
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
  }
}

if (!connectionString) {
  console.error("❌ DATABASE_URL not found!");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting Tameer-e-Sehat database seeding...");

  // 1. Seed Categories
  console.log("Seeding categories...");
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
  console.log(`✅ Seeded ${CATEGORIES.length} categories.`);

  // 2. Seed Products and their sizes
  console.log("Seeding products...");
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
        reviewCount: prod.reviewCount || 0,
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
        reviewCount: prod.reviewCount || 0,
        badge: prod.badge || null,
        mizaj: prod.mizaj || null,
      },
    });

    // Seed sizes for this product
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
          },
        });
      }
    }
  }
  console.log(`✅ Seeded ${PRODUCTS.length} products with sizes.`);

  // 3. Seed Default Admin User
  console.log("Seeding admin user...");
  const adminUser = await prisma.user.upsert({
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
  console.log(`✅ Admin user seeded: ${adminUser.email}`);

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
