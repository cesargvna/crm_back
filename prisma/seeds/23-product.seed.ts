import prisma from "../../src/utils/prisma";

export async function seedProducts(subsidiaries, categories, units) {
  console.log("📦 Seeding Products...");

  for (const s of subsidiaries) {
    if (
      s.id === "00000000-0000-0000-0000-000000000000" ||
      s.tenantId === "00000000-0000-0000-0000-000000000000"
    ) {
      console.log(`⏭️ Skipping subsidiary ${s.id} (tenant ${s.tenantId}) for products.`);
      continue;
    }

    const cat = categories.find(
      (c) => c.name === "Escritura" && c.subsidiaryId === s.id
    );
    const unit = units.find(
      (u) => u.name === "Unidad" && u.subsidiaryId === s.id
    );

    if (!cat) {
      console.warn(`⚠️ Category 'Escritura' not found for subsidiary ${s.id}. Skipping products.`);
      continue;
    }

    if (!unit) {
      console.warn(`⚠️ Unit 'Unidad' not found for subsidiary ${s.id}. Skipping products.`);
      continue;
    }

    // 📦 Lista de 10 productos
    const products = [
      {
        code: "LAP-BIC-BLU",
        barcode: "7701234567890",
        name: "Bolígrafo BIC Azul",
        description: "Bolígrafo punta fina color azul",
      },
      {
        code: "LAP-BIC-BLA",
        barcode: "7701234567891",
        name: "Bolígrafo BIC Negro",
        description: "Bolígrafo punta fina color negro",
      },
      {
        code: "LAP-BIC-ROJ",
        barcode: "7701234567892",
        name: "Bolígrafo BIC Rojo",
        description: "Bolígrafo punta fina color rojo",
      },
      {
        code: "LAP-BIC-VER",
        barcode: "7701234567893",
        name: "Bolígrafo BIC Verde",
        description: "Bolígrafo punta fina color verde",
      },
      {
        code: "RES-STA-BLU",
        barcode: "7701234567894",
        name: "Resaltador STA Azul",
        description: "Resaltador color azul punta biselada",
      },
      {
        code: "RES-STA-AMA",
        barcode: "7701234567895",
        name: "Resaltador STA Amarillo",
        description: "Resaltador color amarillo punta biselada",
      },
      {
        code: "RES-STA-ROS",
        barcode: "7701234567896",
        name: "Resaltador STA Rosado",
        description: "Resaltador color rosado punta biselada",
      },
      {
        code: "RES-STA-VER",
        barcode: "7701234567897",
        name: "Resaltador STA Verde",
        description: "Resaltador color verde punta biselada",
      },
      {
        code: "MAR-PER-BLA",
        barcode: "7701234567898",
        name: "Marcador Permanente Negro",
        description: "Marcador permanente punta fina color negro",
      },
      {
        code: "MAR-PER-ROJ",
        barcode: "7701234567899",
        name: "Marcador Permanente Rojo",
        description: "Marcador permanente punta fina color rojo",
      },
    ];

    for (const p of products) {
      await prisma.product.create({
        data: {
          code: p.code,
          barcode: p.barcode,
          name: p.name,
          description: p.description,
          productCategoryId: cat.id,
          unitMeasurementId: unit.id,
          tenantId: s.tenantId,
          subsidiaryId: s.id,
        },
      });

      console.log(`✅ Product '${p.name}' created for subsidiary ${s.id}`);
    }
  }

  const all = await prisma.product.findMany();
  console.log(`✅ Total products seeded: ${all.length}`);
  return all;
}
