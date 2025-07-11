// prisma/seeds/17-supplier.seed.ts

import prisma from "../../src/utils/prisma";
import { Subsidiary, SupplierCategory, Supplier } from "../../generated/prisma";

export async function seedSuppliers(
  subsidiaries: Subsidiary[],
  supplierCategories: SupplierCategory[]
): Promise<Supplier[]> {
  console.log("⏳ Seeding suppliers...");

  const createdSuppliers: Supplier[] = [];

  for (const subsidiary of subsidiaries) {
    if (
      subsidiary.id === "00000000-0000-0000-0000-000000000000" ||
      subsidiary.tenantId === "00000000-0000-0000-0000-000000000000"
    ) {
      console.log(`⏭️ Skipping subsidiary ${subsidiary.id} for suppliers.`);
      continue;
    }

    // Filtrar categorías de proveedor para esta subsidiaria
    const categoriesForSubsidiary = supplierCategories.filter(
      (c) => c.subsidiaryId === subsidiary.id
    );

    if (categoriesForSubsidiary.length === 0) {
      console.log(`⏭️ No supplier categories for subsidiary ${subsidiary.id}`);
      continue;
    }

    for (const category of categoriesForSubsidiary) {
      const supplier = await prisma.supplier.upsert({
        where: {
          name_tenantId_subsidiaryId: {
            name: `Proveedor Demo - ${category.name}`,
            tenantId: subsidiary.tenantId,
            subsidiaryId: subsidiary.id,
          },
        },
        update: {},
        create: {
          name: `Proveedor Demo - ${category.name}`,
          description: `Proveedor demo para categoría ${category.name}`,
          company: `Empresa ${category.name}`,
          phone: "+59170000000",
          telephone: "+59140000000",
          email: `proveedor.${category.name
            .toLowerCase()
            .replace(/\s+/g, "")
            .replace(/\//g, "-")
            }@example.com`,
          tenantId: subsidiary.tenantId,
          subsidiaryId: subsidiary.id,
          supplierCategoryId: category.id,
          status: true,
        },
      });

      createdSuppliers.push(supplier);
    }
  }

  console.log(`✅ Suppliers seeded: ${createdSuppliers.length}`);
  return createdSuppliers;
}
