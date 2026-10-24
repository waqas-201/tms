import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import path from "path";
import fs from "fs";

// Normalize postgres connection strings to prevent pg-connection-string SSL deprecation warnings
export function normalizeConnectionString(raw: string): string {
  if (!raw) return raw;
  try {
    const url = new URL(raw);
    const sslmode = url.searchParams.get("sslmode");
    if (
      sslmode &&
      ["require", "prefer", "verify-ca"].includes(sslmode) &&
      !url.searchParams.has("uselibpqcompat")
    ) {
      url.searchParams.set("uselibpqcompat", "true");
      return url.toString();
    }
  } catch {
    // If raw string is not a valid URL (e.g. mock or socket), leave unchanged
  }
  return raw;
}

// Suppress pg-connection-string SSL security deprecation warning from polluting stderr / Vercel error logs
if (typeof process !== "undefined" && typeof process.emitWarning === "function") {
  const originalEmitWarning = process.emitWarning.bind(process);
  (process as unknown as { emitWarning: typeof originalEmitWarning }).emitWarning = function (
    warning: string | Error,
    ...args: unknown[]
  ) {
    const message = typeof warning === "string" ? warning : warning?.message || "";
    if (
      message.includes("The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'")
    ) {
      return;
    }
    return (originalEmitWarning as (...a: unknown[]) => void)(warning, ...args);
  };
}

// Load .env if DATABASE_URL is not set (e.g. standalone scripts, tsx)
if (!process.env.DATABASE_URL) {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const idx = trimmed.indexOf("=");
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = normalizeConnectionString(process.env.DATABASE_URL);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const rawConnectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/placeholder_db?sslmode=disable";
  const connectionString = normalizeConnectionString(rawConnectionString);

  if (!process.env.DATABASE_URL && process.env.NODE_ENV === "production") {
    console.warn(
      "⚠️ [WARN] DATABASE_URL environment variable is not defined. Ensure it is configured in your deployment platform (e.g. Vercel)."
    );
  }

  const pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  });
  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.pgPool = pool;
  }

  return client;
}

// Lazy Proxy to ensure safe module evaluation during static build & route collection
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

export default prisma;
