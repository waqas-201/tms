import { defineConfig } from "prisma/config";
import path from "path";
import fs from "fs";

// Load .env manually without any third-party dependency.
// Prisma 7 pre-injects DATABASE_URL=file:./dev.db so we must override it.
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

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env (or the environment) before running Prisma CLI commands."
  );
}

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
