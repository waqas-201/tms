import prisma from "../lib/prisma";

async function verify() {
  const count = await prisma.product.count();
  const categories = await prisma.category.findMany();
  const products = await prisma.product.findMany({
    include: {
      sizes: true,
      category: true,
    },
  });

  console.log(`=== DATABASE VERIFICATION ===`);
  console.log(`Categories count: ${categories.length}`);
  console.log(`Products count: ${count}`);
  for (const p of products) {
    console.log(`\n📦 Product: ${p.name}`);
    console.log(`   Slug: ${p.slug}`);
    console.log(`   Category: ${p.category?.name || p.categoryLabel} (${p.categoryUrdu})`);
    console.log(`   Base Price: PKR ${p.price}`);
    console.log(`   Primary Image: ${p.image.startsWith("[") ? JSON.parse(p.image)[0] : p.image}`);
    console.log(`   Variants/Sizes (${p.sizes.length}):`);
    p.sizes.forEach((s) => {
      console.log(`     - ${s.name} (${s.weight}) : PKR ${s.price} | SKU: ${s.sku}`);
    });
  }
}

verify()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Verification error:", err);
    process.exit(1);
  });
