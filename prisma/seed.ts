import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import path from "path";
import fs from "fs";

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

const DEFAULT_UNITS = [
  { code: "g", name: "Gram", kind: "WEIGHT" },
  { code: "kg", name: "Kilogram", kind: "WEIGHT" },
  { code: "ml", name: "Millilitre", kind: "VOLUME" },
  { code: "L", name: "Litre", kind: "VOLUME" },
  { code: "jar", name: "Jar", kind: "PACK" },
  { code: "bottle", name: "Bottle", kind: "PACK" },
  { code: "tin", name: "Tin", kind: "PACK" },
  { code: "pcs", name: "Pieces", kind: "COUNT" },
  { code: "tola", name: "Tola", kind: "WEIGHT" },
  { code: "sachet", name: "Sachet", kind: "PACK" },
];

async function main() {
  console.log("🌱 Starting Tameer-e-Sehat base setup (Units & Admin)...");

  // 1. Seed Measurement Units
  console.log("Seeding units...");
  for (const u of DEFAULT_UNITS) {
    await prisma.unit.upsert({
      where: { code: u.code },
      update: { name: u.name, kind: u.kind, isActive: true },
      create: { code: u.code, name: u.name, kind: u.kind, isActive: true },
    });
  }
  console.log(`✅ Seeded ${DEFAULT_UNITS.length} units.`);

  // 2. Seed Default Admin User
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
  console.log(`✅ Admin user verified: ${adminUser.email}`);

  console.log("🎉 Base system setup complete! Products are dynamically managed via DB / Admin dashboard.");
}

main()
  .catch((e) => {
    console.error("❌ Error running base seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
