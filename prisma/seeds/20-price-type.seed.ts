// prisma/seeds/seedPriceTypes.ts
import prisma from "../../src/utils/prisma";
import { Prisma, Subsidiary, PriceType } from "../../generated/prisma";

export async function seedPriceTypes(subsidiaries: Subsidiary[]): Promise<PriceType[]> {
  console.log("💲 Seeding PriceTypes (sin currency)...");

  const NUL = "00000000-0000-0000-0000-000000000000";
  const defaultNames = ["Facturado", "Mayorista", "Minorista"] as const;

  for (const s of subsidiaries) {
    // Evita tenants/sucursales nulas o placeholders
    if (s.id === NUL || s.tenantId === NUL) continue;

    const priceTypesData: Prisma.PriceTypeCreateManyInput[] = defaultNames.map((name) => ({
      name,
      tenantId: s.tenantId,
      subsidiaryId: s.id,
      status: true,
      // created_at / updated_at se manejan por default / @updatedAt
    }));

    await prisma.priceType.createMany({
      data: priceTypesData,
      skipDuplicates: true, // respeta @@unique([name, subsidiaryId])
    });

    console.log(`✅ PriceTypes asegurados para la subsidiary ${s.id}`);
  }

  return prisma.priceType.findMany();
}
