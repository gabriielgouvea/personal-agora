/**
 * Ensures POSTGRES_PRISMA_URL and POSTGRES_URL_NON_POOLING are set
 * for Prisma CLI commands during Vercel build.
 * Creates a .env file so `prisma generate` and `prisma db push` work.
 */
const fs = require("fs");

const pooling =
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL;

const direct =
  process.env.POSTGRES_URL_NON_POOLING ||
  pooling;

const lines = [];
if (pooling) lines.push(`POSTGRES_PRISMA_URL="${pooling}"`);
if (direct) lines.push(`POSTGRES_URL_NON_POOLING="${direct}"`);

if (lines.length) {
  fs.writeFileSync(".env", lines.join("\n") + "\n");
  console.log("✅ .env created for Prisma CLI");
} else {
  console.warn("⚠️  No database URL found in environment variables");
}
