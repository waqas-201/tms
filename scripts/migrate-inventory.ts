import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function migrate() {
  console.log("Applying inventory schema migration to PostgreSQL...");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Unit table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Unit" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "code" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "kind" TEXT NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true
      );
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Unit_code_key" ON "Unit"("code");
    `);

    // 2. ProductSize columns
    await client.query(`
      ALTER TABLE "ProductSize"
      ADD COLUMN IF NOT EXISTS "unitId" TEXT,
      ADD COLUMN IF NOT EXISTS "quantityValue" DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS "sku" TEXT,
      ADD COLUMN IF NOT EXISTS "stockOnHand" INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "stockReserved" INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
      ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'ProductSize_unitId_fkey'
        ) THEN
          ALTER TABLE "ProductSize"
          ADD CONSTRAINT "ProductSize_unitId_fkey"
          FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "ProductSize_sku_key" ON "ProductSize"("sku");
    `);

    // 3. StockMovement table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "StockMovement" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "productSizeId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL,
        "onHandAfter" INTEGER NOT NULL,
        "reservedAfter" INTEGER NOT NULL,
        "reason" TEXT,
        "orderId" TEXT,
        "createdById" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'StockMovement_productSizeId_fkey'
        ) THEN
          ALTER TABLE "StockMovement"
          ADD CONSTRAINT "StockMovement_productSizeId_fkey"
          FOREIGN KEY ("productSizeId") REFERENCES "ProductSize"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    // 4. OrderItem columns
    await client.query(`
      ALTER TABLE "OrderItem"
      ADD COLUMN IF NOT EXISTS "productSizeId" TEXT,
      ADD COLUMN IF NOT EXISTS "stockState" TEXT NOT NULL DEFAULT 'NONE';
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'OrderItem_productSizeId_fkey'
        ) THEN
          ALTER TABLE "OrderItem"
          ADD CONSTRAINT "OrderItem_productSizeId_fkey"
          FOREIGN KEY ("productSizeId") REFERENCES "ProductSize"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    await client.query("COMMIT");
    console.log("✅ Inventory schema migration applied successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
