// ✅ seedPriceTypes.ts
import prisma from "../../src/utils/prisma";

export async function seedPriceTypes(subsidiaries) {
  console.log("💲 Seeding PriceTypes...");

  for (const s of subsidiaries) {
    if (
      s.id === "00000000-0000-0000-0000-000000000000" ||
      s.tenantId === "00000000-0000-0000-0000-000000000000"
    ) continue;

    await prisma.priceType.createMany({
      data: [
        { name: "Facturado", marginPercent: 45, tenantId: s.tenantId, subsidiaryId: s.id },
        { name: "Mayorista", marginPercent: 10, tenantId: s.tenantId, subsidiaryId: s.id },
        { name: "Minorista", marginPercent: 20, tenantId: s.tenantId, subsidiaryId: s.id },
      ],
      skipDuplicates: true,
    });

    console.log(`✅ PriceTypes created for subsidiary ${s.id}`);
  }

  const all = await prisma.priceType.findMany();
  return all;
}
