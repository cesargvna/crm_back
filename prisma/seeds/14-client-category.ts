import prisma from "../../src/utils/prisma";
import { ClientCategory, Subsidiary } from "../../generated/prisma"; // Ajusta si usas tipos locales generados

export async function seedClientCategories(subsidiaries: Subsidiary[]) {
  console.log("⏳ Seeding client categories...");

  const categories = [
    { name: "Persona Individual" },
    { name: "Estudiante" },
    { name: "Profesor" },
    { name: "Empresa Privada" },
    { name: "Empresa Pública" },
    { name: "Gobernación" },
    { name: "Municipio" },
    { name: "Universidad" },
    { name: "Colegio" },
    { name: "ONG" },
    { name: "Fundación" },
    { name: "Ministerio" },
    { name: "Proveedor" },
    { name: "Distribuidor" },
    { name: "Revendedor" },
    { name: "Mayorista" },
    { name: "Cliente VIP" },
    { name: "Cliente Minorista" },
  ];

  const createdClientCategories: ClientCategory[] = [];

  for (const subsidiary of subsidiaries) {
    // 🚫 Saltar tenant o subsidiary nulos
    if (
      subsidiary.id === "00000000-0000-0000-0000-000000000000" ||
      subsidiary.tenantId === "00000000-0000-0000-0000-000000000000"
    ) {
      console.log(`⏭️ Skipping subsidiary ${subsidiary.id} with tenant ${subsidiary.tenantId}`);
      continue;
    }

    for (const category of categories) {
      const clientCategory = await prisma.clientCategory.upsert({
        where: {
          name_tenantId_subsidiaryId: {
            name: category.name,
            tenantId: subsidiary.tenantId,
            subsidiaryId: subsidiary.id,
          },
        },
        update: {},
        create: {
          name: category.name,
          status: true,
          description: null, // Puedes poner una descripción general si quieres
          tenantId: subsidiary.tenantId,
          subsidiaryId: subsidiary.id,
        },
      });

      createdClientCategories.push(clientCategory);
    }
  }

  console.log(`✅ Client categories seeded: ${createdClientCategories.length}`);
  return createdClientCategories;
}
