import { defineConfig } from "prisma/config";
import { config } from "dotenv";
import path from "path";

// Load the project .env explicitly. Prisma 7 pre-injects a default
// DATABASE_URL=file:./dev.db into process.env before this config runs, so
// dotenv must override existing vars or the Neon URL is never applied.
config({ path: path.resolve(process.cwd(), ".env"), override: true });

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