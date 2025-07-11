import prisma from "../../src/utils/prisma";

export async function seedProducts(subsidiaries, categories, units) {
  console.log("📦 Seeding Products...");

  for (const s of subsidiaries) {
    // ✅ Ignorar subsidiaries y tenants dummy
    if (
      s.id === "00000000-0000-0000-0000-000000000000" ||
      s.tenantId === "00000000-0000-0000-0000-000000000000"
    ) {
      console.log(`⏭️ Skipping subsidiary ${s.id} (tenant ${s.tenantId}) for products.`);
      continue;
    }

    // ✅ Buscar categoría y unidad para Escritura/Unidad
    const cat = categories.find(
      (c) => c.name === "Escritura" && c.subsidiaryId === s.id
    );
    const unit = units.find(
      (u) => u.name === "Unidad" && u.subsidiaryId === s.id
    );

    if (!cat) {
      console.warn(`⚠️ Category 'Escritura' not found for subsidiary ${s.id}. Skipping product.`);
      continue;
    }

    if (!unit) {
      console.warn(`⚠️ Unit 'Unidad' not found for subsidiary ${s.id}. Skipping product.`);
      continue;
    }

    await prisma.product.create({
      data: {
        id: `prod-bic-blu-${s.id}`,
        code: "LAP-BIC-BLU",
        barcode: "7701234567890",
        name: "Bolígrafo BIC Azul",
        description: "Bolígrafo punta fina color azul",
        productCategoryId: cat.id,
        unitMeasurementId: unit.id,
        tenantId: s.tenantId,
        subsidiaryId: s.id,
      },
    });

    console.log(`✅ Product 'Bolígrafo BIC Azul' created for subsidiary ${s.id}`);
  }

  const all = await prisma.product.findMany();
  console.log(`✅ Total products seeded: ${all.length}`);
  return all;
}
