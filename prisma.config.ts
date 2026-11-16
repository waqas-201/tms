import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { defineConfig } from "prisma/config";

const dbUrl =
  process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("[SENSITIVE]")
    ? process.env.DATABASE_URL
    : "postgresql://postgres:postgres@localhost:5432/placeholder_db?sslmode=disable";

export default defineConfig({
  datasource: {
    url: dbUrl,
  },
});
