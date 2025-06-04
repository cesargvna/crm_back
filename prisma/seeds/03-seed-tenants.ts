import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

export const seedTenants = async () => {
  const tenants = [
    { name: "PERU - JUGUETERIA", description: "Tenant principal en Perú" },
    { name: "BOLIVIA - MATERIAL DE ESCRITORIO", description: "Tenant principal en Bolivia" },
  ];

  for (const tenant of tenants) {
    const exists = await prisma.tenant.findFirst({ where: { name: tenant.name } });

    if (exists) {
      console.log(`⏩ Tenant already exists: ${tenant.name}`);
      continue;
    }

    await prisma.tenant.create({
      data: {
        id: uuidv4(),
        name: tenant.name,
        description: tenant.description,
      },
    });

    console.log(`✅ Tenant created: ${tenant.name}`);
  }
};