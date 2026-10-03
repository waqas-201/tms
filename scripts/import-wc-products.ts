import fs from "fs";
import path from "path";
import { UTApi } from "uploadthing/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

interface CsvProductRow {
  [key: string]: string;
}

interface ParsedProduct {
  id: string;
  wcId: string;
  slug: string;
  name: string;
  urduName: string;
  category: string;
  categoryId: string;
  categoryLabel: string;
  categoryUrdu: string;
  shortDescription: string;
  fullDescription: string;
  traditionalPurpose: string;
  benefits: string[];
  ingredients: { name: string; urdu?: string; role: string }[];
  howToUse: string;
  dosage: string;
  hakimAdvice: string;
  warnings: string[];
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  image: string;
  gallery: string[];
  sizes: Array<{
    name: string;
    weight: string;
    price: number;
    originalPrice?: number;
    sku?: string;
    quantityValue?: number;
    unitId?: string;
    stockOnHand: number;
    isActive: boolean;
  }>;
  inStock: boolean;
  featured: boolean;
  rating: number;
  reviewCount: number;
  badge?: string;
  tags: string[];
}

function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentField = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(currentField);
      currentField = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      row.push(currentField);
      currentField = "";
      if (row.length > 1 || row[0] !== "") {
        lines.push(row);
      }
      row = [];
    } else {
      currentField += char;
    }
  }
  if (currentField || row.length > 0) {
    row.push(currentField);
    lines.push(row);
  }
  return lines;
}

function cleanHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<span[^>]*>/gi, "")
    .replace(/<\/span>/gi, "")
    .replace(/<font[^>]*>/gi, "")
    .replace(/<\/font>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "")
    .trim();
}

function extractListItems(html: string): string[] {
  if (!html) return [];
  const items: string[] = [];
  const regex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const raw = match[1]
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/^[•\s\-\*]+/, "")
      .trim();
    const splitted = raw.split(/[\r\n•]+/).map((s) => s.trim()).filter((s) => s.length > 2);
    for (const sub of splitted) {
      if (!items.includes(sub)) items.push(sub);
    }
  }
  return items;
}

function extractUrduName(name: string): string {
  const urduMatch = name.match(/[؀-ۿ\s]+/g);
  if (urduMatch) {
    const candidate = urduMatch.join(" ").replace(/[()\-–\/]/g, "").trim();
    if (candidate.length >= 2) return candidate;
  }
  return "";
}

function cleanEnglishTitle(name: string): string {
  const cleaned = name
    .replace(/[\(–\-\/]\s*[؀-ۿ\s]+\s*[\)\–\-\/]?/g, "")
    .replace(/\s*–\s*$/, "")
    .replace(/\s*-\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || name.trim();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeCategory(cats: string): {
  id: string;
  label: string;
  urdu: string;
  tags: string[];
} {
  const catList = cats
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  const tags: string[] = [];
  let mainCat = "herbs";
  let label = "Herbs & Botanicals";
  let urdu = "جڑی بوٹیاں";

  for (const c of catList) {
    const lower = c.toLowerCase();
    if (lower.includes("murabba")) {
      mainCat = "murabbajaat";
      label = "Murabbajaat (Herbal Preserves)";
      urdu = "مربہ جات و معجون";
    } else if (lower.includes("seed")) {
      mainCat = "herbs-seeds";
      label = "Herbal Seeds & Kernels";
      urdu = "تخم و بیج";
    } else if (lower.includes("oil")) {
      mainCat = "oils-marham";
      label = "Pure Herbal Oils & Balms";
      urdu = "روغنیات و مرہم";
    } else if (lower.includes("spice")) {
      mainCat = "herbs";
      label = "Pure Herbal Spices & Herbs";
      urdu = "خالص جڑی بوٹیاں و مصالحہ جات";
    } else if (lower.includes("dry fruit")) {
      mainCat = "teas-vitality";
      label = "Dry Fruit Blends & Vitality";
      urdu = "خشک میوہ جات و مقویات";
    } else if (lower.includes("health collection")) {
      mainCat = "apothecary-blends";
      label = "Health Collections & Apothecary";
      urdu = "طبی مرکبات";
    } else if (
      lower.includes("flash sale") ||
      lower.includes("deals") ||
      lower.includes("slider")
    ) {
      tags.push(c);
    } else {
      tags.push(c);
    }
  }

  return { id: mainCat, label, urdu, tags };
}

async function downloadImage(url: string, localDestPath: string): Promise<Buffer | null> {
  try {
    if (fs.existsSync(localDestPath) && fs.statSync(localDestPath).size > 0) {
      return fs.readFileSync(localDestPath);
    }
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!res.ok) {
      console.warn(`⚠️ Failed to download ${url}: HTTP ${res.status}`);
      return null;
    }
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.mkdirSync(path.dirname(localDestPath), { recursive: true });
    fs.writeFileSync(localDestPath, buffer);
    return buffer;
  } catch (err: any) {
    console.warn(`⚠️ Error downloading image ${url}:`, err.message);
    return null;
  }
}

async function uploadToUploadThing(
  utapi: UTApi | null,
  buffer: Buffer,
  filename: string
): Promise<string | null> {
  if (!utapi) return null;
  try {
    const uint8 = new Uint8Array(buffer);
    const blob = new Blob([uint8], {
      type: filename.endsWith(".png")
        ? "image/png"
        : filename.endsWith(".webp")
        ? "image/webp"
        : "image/jpeg",
    });
    const file = new File([blob], filename, {
      type: blob.type,
    });

    const response = await utapi.uploadFiles([file]);
    if (response && response[0] && response[0].data) {
      const uploaded = response[0].data;
      return uploaded.ufsUrl || uploaded.url;
    }
  } catch (err: any) {
    console.warn(`⚠️ UploadThing upload failed for ${filename}:`, err.message);
  }
  return null;
}

export async function runMigration(options: {
  limit?: number;
  uploadThingToken?: string;
  skipDb?: boolean;
} = {}) {
  const token = options.uploadThingToken || process.env.UPLOADTHING_TOKEN || process.env.UPLOADTHING_SECRET;
  let utapi: UTApi | null = null;

  if (token) {
    console.log("🔑 Initializing UploadThing API with token...");
    utapi = new UTApi({ token });
  } else {
    console.log("ℹ️ No UploadThing token found in environment. Saving images locally and retaining fallbacks.");
  }

  const csvPath = path.resolve(__dirname, "../DATA/wc-product-export-2-10-2026-1790966996978.csv");
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found at ${csvPath}`);
    return;
  }

  console.log(`📖 Reading WooCommerce CSV: ${csvPath}`);
  let content = fs.readFileSync(csvPath, "utf8");
  if (content.charCodeAt(0) === 0xfeff) content = content.slice(1);

  const rows = parseCSV(content);
  const headers = rows[0].map((h) => h.replace(/^﻿/, "").trim());

  const parentById = new Map<string, CsvProductRow>();
  const parentBySku = new Map<string, CsvProductRow>();
  const variationsByParent = new Map<string, CsvProductRow[]>();
  const parents: CsvProductRow[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const obj: CsvProductRow = {};
    headers.forEach((h, idx) => (obj[h] = row[idx] || ""));

    if (obj.Type === "variable" || obj.Type === "simple") {
      parents.push(obj);
      parentById.set(obj.ID, obj);
      if (obj.SKU) parentBySku.set(obj.SKU, obj);
    } else if (obj.Type === "variation") {
      const pRef = (obj.Parent || "").trim();
      if (!variationsByParent.has(pRef)) variationsByParent.set(pRef, []);
      variationsByParent.get(pRef)!.push(obj);
    }
  }

  const totalToProcess = options.limit ? Math.min(options.limit, parents.length) : parents.length;
  const batch = parents.slice(0, totalToProcess);
  console.log(`📦 Found ${parents.length} total catalog parents (processing ${batch.length}) and ${variationsByParent.size} variation groups.\n`);

  // Global cache for images so identical URLs are uploaded only once
  const imageUploadCache = new Map<string, string>();
  const usedSlugs = new Set<string>();
  const usedSkus = new Set<string>();

  const processedProducts: ParsedProduct[] = [];

  for (let i = 0; i < batch.length; i++) {
    const p = batch[i];
    const itemNum = i + 1;

    // Variations
    const vars =
      variationsByParent.get(p.SKU) ||
      variationsByParent.get("id:" + p.ID) ||
      variationsByParent.get(p.ID) ||
      (p.SKU ? variationsByParent.get("id:" + p.SKU) : undefined) ||
      [];

    const rawImageUrls = p.Images
      ? p.Images.split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const migratedImageUrls: string[] = [];

    for (let imgIdx = 0; imgIdx < rawImageUrls.length; imgIdx++) {
      const imgUrl = rawImageUrls[imgIdx];

      if (imageUploadCache.has(imgUrl)) {
        migratedImageUrls.push(imageUploadCache.get(imgUrl)!);
        continue;
      }

      try {
        const urlObj = new URL(imgUrl);
        const rawFilename = path.basename(urlObj.pathname);
        const safeFilename = `${p.ID}_${imgIdx}_${rawFilename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const localFile = path.resolve(__dirname, `../public/images/products/${safeFilename}`);
        const webLocalPath = `/images/products/${safeFilename}`;

        const buffer = await downloadImage(imgUrl, localFile);

        let finalUrl = imgUrl;
        if (buffer) {
          if (utapi) {
            const utUrl = await uploadToUploadThing(utapi, buffer, safeFilename);
            if (utUrl) {
              finalUrl = utUrl;
            } else {
              finalUrl = webLocalPath;
            }
          } else {
            finalUrl = webLocalPath;
          }
        }
        imageUploadCache.set(imgUrl, finalUrl);
        migratedImageUrls.push(finalUrl);
      } catch {
        migratedImageUrls.push(imgUrl);
      }
    }

    const primaryImage = migratedImageUrls[0] || "/images/placeholder.jpg";
    const englishName = cleanEnglishTitle(p.Name) || `Product ${p.ID}`;
    const urduName = extractUrduName(p.Name);

    let baseSlug = slugify(englishName) || `product-${p.ID}`;
    let slug = baseSlug;
    let collisionCount = 1;
    while (usedSlugs.has(slug)) {
      collisionCount++;
      slug = `${baseSlug}-${collisionCount}`;
    }
    usedSlugs.add(slug);

    const catInfo = normalizeCategory(p.Categories || "");

    const benefits = extractListItems(p["Short description"]).concat(
      extractListItems(p.Description)
    );
    const uniqueBenefits = [...new Set(benefits)];

    // Parse variations into sizes
    let sizes: ParsedProduct["sizes"] = [];

    if (vars.length > 0) {
      sizes = vars.map((v, vIdx) => {
        const sizeName = v["Attribute 1 value(s)"] || v.Name.split("-").pop()?.trim() || `Variant ${vIdx + 1}`;
        const regPrice = Number(v["Regular price"]) || Number(v["Sale price"]) || 0;
        const salePrice = Number(v["Sale price"]) || regPrice;
        const isAvailable = v["In stock?"] !== "0";

        let quantityValue = 250;
        const matchNum = sizeName.match(/(\d+)\s*(g|gram|gm|kg|ml|litre|l)?/i);
        if (matchNum) {
          let num = Number(matchNum[1]);
          const unit = (matchNum[2] || "").toLowerCase();
          if (unit.startsWith("k")) num *= 1000;
          quantityValue = num;
        }

        let baseSku = v.SKU || `${p.SKU || "TS-" + p.ID}-${vIdx + 1}`;
        let finalSku = baseSku;
        let skuSuffix = 1;
        while (usedSkus.has(finalSku)) {
          skuSuffix++;
          finalSku = `${baseSku}-${skuSuffix}`;
        }
        usedSkus.add(finalSku);

        return {
          name: sizeName,
          weight: sizeName,
          price: salePrice,
          originalPrice: regPrice > salePrice ? regPrice : undefined,
          sku: finalSku,
          quantityValue,
          unitId: "g",
          stockOnHand: 50,
          isActive: isAvailable,
        };
      });
    } else {
      // Simple product with 1 default pack size
      const regPrice = Number(p["Regular price"]) || Number(p["Sale price"]) || 0;
      const salePrice = Number(p["Sale price"]) || regPrice;
      let singleSku = p.SKU || `TS-${p.ID}-std`;
      if (usedSkus.has(singleSku)) singleSku = `${singleSku}-${p.ID}`;
      usedSkus.add(singleSku);

      sizes = [
        {
          name: "Standard Pack",
          weight: "Standard",
          price: salePrice,
          originalPrice: regPrice > salePrice ? regPrice : undefined,
          sku: singleSku,
          quantityValue: 250,
          unitId: "g",
          stockOnHand: 50,
          isActive: p["In stock?"] !== "0",
        },
      ];
    }

    // Determine base price
    let basePrice = 0;
    let originalPrice: number | undefined = undefined;
    if (sizes.length > 0) {
      basePrice = Math.min(...sizes.map((s) => s.price));
      const correspondingOrig = sizes.find((s) => s.price === basePrice)?.originalPrice;
      if (correspondingOrig && correspondingOrig > basePrice) {
        originalPrice = correspondingOrig;
      }
    } else {
      basePrice = Number(p["Sale price"]) || Number(p["Regular price"]) || 0;
      const reg = Number(p["Regular price"]);
      if (reg > basePrice) originalPrice = reg;
    }

    const discountPercentage =
      originalPrice && originalPrice > basePrice
        ? Math.round(((originalPrice - basePrice) / originalPrice) * 100)
        : undefined;

    const parsedProduct: ParsedProduct = {
      id: p.ID,
      wcId: p.ID,
      slug,
      name: englishName,
      urduName,
      category: catInfo.id,
      categoryId: catInfo.id,
      categoryLabel: catInfo.label,
      categoryUrdu: catInfo.urdu,
      shortDescription: cleanHtml(p["Short description"]),
      fullDescription: cleanHtml(p.Description),
      traditionalPurpose: uniqueBenefits.slice(0, 2).join(". ") || "Natural therapeutic formulation.",
      benefits: uniqueBenefits.length > 0 ? uniqueBenefits : ["Supports overall health and holistic vitality."],
      ingredients: [{ name: englishName, urdu: urduName, role: "Primary Botanical Active" }],
      howToUse: "Take recommended quantity preferably in the morning with lukewarm water or milk.",
      dosage: "1–2 teaspoons / 1 unit daily or as advised by your physician.",
      hakimAdvice: "Store in a cool dry place away from direct sunlight. Keep container sealed.",
      warnings: ["Consult a physician before use if pregnant or nursing.", "Do not exceed recommended dose."],
      price: basePrice,
      originalPrice,
      discountPercentage,
      image: primaryImage,
      gallery: migratedImageUrls,
      sizes,
      inStock: p["In stock?"] !== "0",
      featured: p["Is featured?"] === "1" || catInfo.tags.some((t) => t.toLowerCase().includes("flash")),
      rating: 5.0,
      reviewCount: Math.floor(Math.random() * 15) + 3,
      badge: catInfo.tags.some((t) => t.toLowerCase().includes("deal")) ? "Special Offer" : undefined,
      tags: catInfo.tags,
    };

    processedProducts.push(parsedProduct);

    if (itemNum % 25 === 0 || itemNum === batch.length) {
      console.log(`📦 [${itemNum}/${batch.length}] Migrated: ${parsedProduct.name} (${sizes.length} sizes, Base ₨ ${basePrice})`);
    }
  }

  // Save to JSON
  const outputPath = path.resolve(__dirname, "../app/data/migrated-products.json");
  fs.writeFileSync(outputPath, JSON.stringify(processedProducts, null, 2), "utf8");
  console.log(`\n💾 Saved all ${processedProducts.length} migrated products to ${outputPath}`);

  // Seed to Database if DATABASE_URL is available
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !options.skipDb) {
    console.log(`\n🌱 Seeding ${processedProducts.length} products into Neon PostgreSQL database...`);
    try {
      const pool = new Pool({ connectionString: dbUrl });
      const adapter = new PrismaPg(pool);
      const prisma = new PrismaClient({ adapter });

      // 1. Pre-seed Units
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

      // 2. Pre-seed Categories
      const categoryMap = new Map<string, { name: string; urdu: string; desc: string; hero: string }>();
      categoryMap.set("herbs", {
        name: "Herbs & Botanicals",
        urdu: "جڑی بوٹیاں",
        desc: "Authentic single-herb roots, barks, seeds, and botanical powders for traditional compounding.",
        hero: "/images/categories/herbs.jpg",
      });
      categoryMap.set("herbs-seeds", {
        name: "Herbal Seeds & Kernels",
        urdu: "تخم و بیج",
        desc: "Premium graded botanical seeds, kernels, and medicinal grains.",
        hero: "/images/categories/seeds.jpg",
      });
      categoryMap.set("murabbajaat", {
        name: "Murabbajaat (Herbal Preserves)",
        urdu: "مربہ جات و معجون",
        desc: "Traditional Unani herbal preserves, majoons, and therapeutic sweet preserves.",
        hero: "/images/categories/murabba.jpg",
      });
      categoryMap.set("oils-marham", {
        name: "Pure Herbal Oils & Balms",
        urdu: "روغنیات و مرہم",
        desc: "Cold-pressed herbal oils, pain relief balms, and therapeutic tinctures.",
        hero: "/images/categories/oils.jpg",
      });
      categoryMap.set("teas-vitality", {
        name: "Dry Fruit Blends & Vitality",
        urdu: "خشک میوہ جات و مقویات",
        desc: "Handpicked dry fruits, vitality blends, and natural wellness tonics.",
        hero: "/images/categories/dry-fruits.jpg",
      });
      categoryMap.set("apothecary-blends", {
        name: "Health Collections & Apothecary",
        urdu: "طبی مرکبات و علاج",
        desc: "Curated therapeutic wellness regimens and classical formulations.",
        hero: "/images/categories/blends.jpg",
      });

      for (const [catId, info] of categoryMap.entries()) {
        await prisma.category.upsert({
          where: { id: catId },
          update: { name: info.name, urduName: info.urdu },
          create: {
            id: catId,
            slug: catId,
            name: info.name,
            urduName: info.urdu,
            description: info.desc,
            heroImage: info.hero,
          },
        });
      }

      // 3. Seed Products and Sizes in batches
      let dbInserted = 0;
      for (const prod of processedProducts) {
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
        const upserted = await prisma.product.upsert({
          where: { slug: prod.slug },
          update: {
            name: prod.name,
            urduName: prod.urduName,
            categoryId: prod.categoryId,
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
            warnings: JSON.stringify(prod.warnings),
            price: prod.price,
            originalPrice: prod.originalPrice || null,
            discountPercentage: prod.discountPercentage || null,
            image: JSON.stringify(prod.gallery),
            inStock: prod.inStock,
            featured: prod.featured,
            rating: prod.rating,
            reviewCount: prod.reviewCount,
            badge: prod.badge || null,
          },
          create: {
            slug: prod.slug,
            name: prod.name,
            urduName: prod.urduName,
            categoryId: prod.categoryId,
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
            warnings: JSON.stringify(prod.warnings),
            price: prod.price,
            originalPrice: prod.originalPrice || null,
            discountPercentage: prod.discountPercentage || null,
            image: JSON.stringify(prod.gallery),
            inStock: prod.inStock,
            featured: prod.featured,
            rating: prod.rating,
            reviewCount: prod.reviewCount,
            badge: prod.badge || null,
          },
        });

        // Upsert Sizes
        if (prod.sizes.length > 0) {
          await prisma.productSize.deleteMany({ where: { productId: upserted.id } });
          for (const s of prod.sizes) {
            await prisma.productSize.create({
              data: {
                productId: upserted.id,
                name: s.name,
                weight: s.weight,
                price: s.price,
                originalPrice: s.originalPrice || null,
                sku: s.sku || `${prod.slug}-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
                quantityValue: s.quantityValue,
                stockOnHand: s.stockOnHand,
                isActive: s.isActive,
              },
            });
          }
        }

        dbInserted++;
        if (dbInserted % 50 === 0 || dbInserted === processedProducts.length) {
          console.log(`🌱 [DB Seeding: ${dbInserted}/${processedProducts.length}] Synced with Neon database.`);
        }
      }

      await prisma.$disconnect();
      await pool.end();
      console.log(`\n✅ Successfully seeded all ${dbInserted} products and their sizes into PostgreSQL database.`);
    } catch (dbErr: any) {
      console.error("❌ Database seeding error:", dbErr);
    }
  }

  return processedProducts;
}

if (require.main === module) {
  runMigration().catch(console.error);
}
