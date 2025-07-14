import prisma from "../../src/utils/prisma";

export async function seedPriceTypes(subsidiaries) {
  console.log("💲 Seeding PriceTypes...");

  for (const s of subsidiaries) {
    // ⚠️ Ignora subsidiarias o tenants inválidos
    if (
      s.id === "00000000-0000-0000-0000-000000000000" ||
      s.tenantId === "00000000-0000-0000-0000-000000000000"
    ) {
      console.log(`⏭️ Skipping subsidiary ${s.id} (or tenant ${s.tenantId}) for price types.`);
      continue;
    }

    // ✅ Inserta tipos de precio con margen por defecto
    await prisma.priceType.createMany({
      data: [
        {
          name: "Minorista",
          marginPercent: 40.0, // 💰 Margen por defecto
          tenantId: s.tenantId,
          subsidiaryId: s.id,
        },
        {
          name: "Mayorista",
          marginPercent: 25.0, // 💰 Margen por defecto
          tenantId: s.tenantId,
          subsidiaryId: s.id,
        },
      ],
      skipDuplicates: true,
    });

    console.log(`✅ PriceTypes created for subsidiary ${s.id}`);
  }

  // ✅ Verificación final
  const validSubsidiaries = subsidiaries.filter(
    (s) =>
      s.id !== "00000000-0000-0000-0000-000000000000" &&
      s.tenantId !== "00000000-0000-0000-0000-000000000000"
  );

  const all = await prisma.priceType.findMany({
    where: { subsidiaryId: { in: validSubsidiaries.map((s) => s.id) } },
  });

  console.log(`✅ Total PriceTypes: ${all.length}`);
  return all;
}
