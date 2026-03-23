/**
 * Ensures DATABASE_URL is set for Prisma CLI commands.
 * Vercel + Neon integration provides POSTGRES_PRISMA_URL / POSTGRES_URL
 * but Prisma schema expects DATABASE_URL.
 */
const fs = require("fs");

const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

if (url && !process.env.DATABASE_URL) {
  fs.writeFileSync(".env", `DATABASE_URL="${url}"\n`);
  console.log("✅ .env created with DATABASE_URL from Vercel/Neon vars");
} else if (url) {
  console.log("✅ DATABASE_URL already set");
} else {
  console.warn("⚠️  No database URL found in environment variables");
}
