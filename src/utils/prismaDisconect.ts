import { PrismaClient } from "@prisma/client";

export async function disconnectPrisma(prisma: PrismaClient): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log("Prisma disconnected successfully.");
  } catch (error) {
    console.error("Error disconnecting Prisma:", error);
  }
}

export default disconnectPrisma;
