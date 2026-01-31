import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  const dbUrl =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.POSTGRES_URL_NO_SSL ??
    process.env.POSTGRES_URL_NON_POOLING_NO_SSL;

  if (dbUrl) {
    return new PrismaClient({
      datasources: {
        db: { url: dbUrl },
      },
    });
  }

  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
