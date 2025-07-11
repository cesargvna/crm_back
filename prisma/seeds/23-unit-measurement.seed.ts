import prisma from "../../src/utils/prisma";

export async function seedUnitMeasurements(subsidiaries) {
  console.log("📏 Seeding Unit Measurements...");

  for (const s of subsidiaries) {
    // ✅ Ignorar subsidiarias o tenants con UUID dummy
    if (
      s.id === "00000000-0000-0000-0000-000000000000" ||
      s.tenantId === "00000000-0000-0000-0000-000000000000"
    ) {
      console.log(`⏭️ Skipping subsidiary ${s.id} (or tenant ${s.tenantId}) for unit measurements.`);
      continue;
    }

    // ✅ Crear unidades solo para subsidiarias válidas
    await prisma.unitMeasurement.createMany({
      data: [
        {
          id: `unit-unidad-${s.id}`,
          name: "Unidad",
          quantity: 1,
          tenantId: s.tenantId,
          subsidiaryId: s.id,
        },
        {
          id: `unit-pack-${s.id}`,
          name: "Pack",
          quantity: 5,
          tenantId: s.tenantId,
          subsidiaryId: s.id,
        },
        {
          id: `unit-caja-${s.id}`,
          name: "Caja",
          quantity: 12,
          tenantId: s.tenantId,
          subsidiaryId: s.id,
        },
      ],
      skipDuplicates: true,
    });

    console.log(`✅ Unit measurements created for subsidiary ${s.id}`);
  }

  // ✅ Retornar todas las unidades creadas para uso posterior
  const all = await prisma.unitMeasurement.findMany();
  console.log("✅ Total Unit Measurements:", all.length);
  return all;
}
