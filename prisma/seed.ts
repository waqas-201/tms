import prisma from "../lib/prisma";
import { PRODUCTS, CATEGORIES } from "../app/data/products";

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
  console.log(`✓ Seeded ${CATEGORIES.length} categories.`);

  // 2. Seed Products and their sizes
  console.log("Seeding products and variants...");
  for (const p of PRODUCTS) {
    const createdProduct = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        urduName: p.urduName,
        categoryId: p.category,
        categoryLabel: p.categoryLabel,
        categoryUrdu: p.categoryUrdu,
        shortDescription: p.shortDescription,
        fullDescription: p.fullDescription,
        traditionalPurpose: p.traditionalPurpose,
        benefits: JSON.stringify(p.benefits),
        ingredients: JSON.stringify(p.ingredients),
        howToUse: p.howToUse,
        dosage: p.dosage,
        hakimAdvice: p.hakimAdvice,
        warnings: JSON.stringify(p.warnings || []),
        price: p.price,
        originalPrice: p.originalPrice || null,
        discountPercentage: p.discountPercentage || null,
        image: p.image,
        inStock: p.inStock,
        featured: p.featured,
        rating: p.rating,
        reviewCount: p.reviewCount,
        badge: p.badge || null,
        mizaj: p.mizaj || null,
      },
      create: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        urduName: p.urduName,
        categoryId: p.category,
        categoryLabel: p.categoryLabel,
        categoryUrdu: p.categoryUrdu,
        shortDescription: p.shortDescription,
        fullDescription: p.fullDescription,
        traditionalPurpose: p.traditionalPurpose,
        benefits: JSON.stringify(p.benefits),
        ingredients: JSON.stringify(p.ingredients),
        howToUse: p.howToUse,
        dosage: p.dosage,
        hakimAdvice: p.hakimAdvice,
        warnings: JSON.stringify(p.warnings || []),
        price: p.price,
        originalPrice: p.originalPrice || null,
        discountPercentage: p.discountPercentage || null,
        image: p.image,
        inStock: p.inStock,
        featured: p.featured,
        rating: p.rating,
        reviewCount: p.reviewCount,
        badge: p.badge || null,
        mizaj: p.mizaj || null,
      },
    });

    // Delete existing sizes and re-create to ensure exact sync
    await prisma.productSize.deleteMany({
      where: { productId: createdProduct.id },
    });

    for (const size of p.sizes) {
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
  console.log(`✓ Seeded ${PRODUCTS.length} products and all associated packaging sizes.`);

  // 3. Seed Default Admin User
  console.log("Seeding administrative & clinical accounts...");
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@tameeresehat.com" },
    update: {
      name: "Hakim Sahib (Chief Physician)",
      role: "admin",
      phone: "03182311310",
      city: "Karachi",
    },
    create: {
      name: "Hakim Sahib (Chief Physician)",
      email: "admin@tameeresehat.com",
      role: "admin",
      phone: "03182311310",
      city: "Karachi",
      emailVerified: true,
    },
  });

  // 4. Seed Sample Consultation Request
  await prisma.consultationRequest.upsert({
    where: { ticketNumber: "CON-2026-101" },
    update: {},
    create: {
      ticketNumber: "CON-2026-101",
      fullName: "Muhammad Usman",
      age: 42,
      gender: "Male",
      phone: "03001234567",
      email: "usman.khi@gmail.com",
      city: "Karachi",
      primarySymptoms: "Chronic gastric acidity, bloating after meals, and occasional heart palpitations.",
      duration: "6 months",
      digestiveState: "Irregular bowel movements with frequent burning in stomach.",
      sleepEnergyState: "Disturbed sleep due to acid reflux; morning fatigue.",
      preferredContact: "WHATSAPP",
      status: "IN_REVIEW",
      hakimNotes: "Prescribed Amla Murabba (1 piece empty stomach) + Arq-e-Gulab with warm water before sleep.",
      prescribedTreatment: "Amla Murabba + Arq Badiyan course for 21 days.",
      userId: adminUser.id,
    },
  });

  // 5. Seed Sample Orders
  const sampleOrder = await prisma.order.upsert({
    where: { orderNumber: "TMS-2026-8091" },
    update: {},
    create: {
      orderNumber: "TMS-2026-8091",
      customerName: "Tariq Mahmood",
      phone: "03339876543",
      email: "tariq.mahmood@yahoo.com",
      city: "Lahore",
      address: "House 45, Street 12, Gulberg III, Lahore",
      deliveryNotes: "Please call before delivering.",
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      orderStatus: "DISPATCHED",
      subtotal: 2150,
      shippingFee: 0,
      total: 2150,
      trackingNote: "Leopard Courier Tracking #LCS-998231",
      userId: adminUser.id,
    },
  });

  const existingItem = await prisma.orderItem.findFirst({
    where: { orderId: sampleOrder.id },
  });

  if (!existingItem) {
    await prisma.orderItem.create({
      data: {
        orderId: sampleOrder.id,
        productName: "Amla Murabba – Traditional Vitamin C Preserve",
        productUrduName: "آملہ کا مربہ",
        sizeName: "Value Pack",
        sizeWeight: "1kg",
        price: 950,
        quantity: 1,
        total: 950,
        productImage: "/images/ff8c7b8b-c34c-47db-a7aa-058f5e6b64e2-1769545152.png",
      },
    });

    await prisma.orderItem.create({
      data: {
        orderId: sampleOrder.id,
        productName: "Roghan Surkh – Pain & Muscle Ease Oil",
        productUrduName: "روغن سرخ درد کشا",
        sizeName: "Medium Bottle",
        sizeWeight: "120ml",
        price: 600,
        quantity: 2,
        total: 1200,
        productImage: "/images/72dc0d5f-2347-42f4-aef4-5052295325f4-1769544982.png",
      },
    });
  }

  // 6. Seed Sample Contact Inquiries
  await prisma.contactInquiry.create({
    data: {
      name: "Fatima Noor",
      phone: "03214567890",
      email: "fatima.noor@outlook.com",
      city: "Islamabad",
      subject: "Query regarding Harar Murabba for elderly patient",
      message: "Can my 70-year-old mother with mild hypertension consume Harar Murabba daily? Are there any contraindications?",
      status: "UNREAD",
    },
  });

  console.log("✅ Tameer-e-Sehat Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
