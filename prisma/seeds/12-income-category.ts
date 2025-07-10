import prisma from "../../src/utils/prisma";
import { IncomeCategory, Subsidiary } from "../../generated/prisma"; // ajusta si usas tipos locales

export async function seedIncomeCategories(subsidiaries: Subsidiary[]) {
  console.log("⏳ Seeding income categories...");

  const categories = [
    {
      name: "Ingresos Ordinarios",
      status: true,
      description:
        "Ventas de libros, fotocopias, artículos de oficina, etc.",
    },
    {
      name: "Ingresos Extraordinarios",
      status: true,
      description: "Venta de activos fijos (mobiliario, equipos, vehículos).",
    },
  ];

  const createdIncomeCategories: IncomeCategory[] = [];

  for (const subsidiary of subsidiaries) {
    // 🚫 Evitar tenant o subsidiary nulos
    if (
      subsidiary.id === "00000000-0000-0000-0000-000000000000" ||
      subsidiary.tenantId === "00000000-0000-0000-0000-000000000000"
    ) {
      console.log(
        `⏭️ Skipping subsidiary ${subsidiary.id} with tenant ${subsidiary.tenantId}`
      );
      continue;
    }

    for (const category of categories) {
      const incomeCategory = await prisma.incomeCategory.upsert({
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
          status: category.status,
          description: category.description,
          tenantId: subsidiary.tenantId,
          subsidiaryId: subsidiary.id,
        },
      });

      createdIncomeCategories.push(incomeCategory);
    }
  }

  console.log(
    `✅ Income categories seeded: ${createdIncomeCategories.length}`
  );
  return createdIncomeCategories;
}
