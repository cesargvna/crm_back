import prisma from "../../src/utils/prisma";
import { Prisma, Subsidiary, PriceType } from "../../generated/prisma";

export async function seedPriceTypes(subsidiaries: Subsidiary[]): Promise<PriceType[]> {
  console.log("💲 Seeding PriceTypes...");

  const createdPriceTypes: PriceType[] = [];

  for (const s of subsidiaries) {
    if (
      s.id === "00000000-0000-0000-0000-000000000000" ||
      s.tenantId === "00000000-0000-0000-0000-000000000000"
    ) continue;

    // Busca la moneda activa de la sucursal
    const currency = await prisma.currency.findFirst({
      where: {
        tenantId: s.tenantId,
        subsidiaryId: s.id,
        status: true
      }
    });

    if (!currency) {
      console.log(`⚠️ No active currency found for subsidiary ${s.id}`);
      continue;
    }

    const priceTypesData: Prisma.PriceTypeCreateManyInput[] = [
      {
        name: "Facturado",
        marginPercent: new Prisma.Decimal(45),
        tenantId: s.tenantId,
        subsidiaryId: s.id,
        currencyId: currency.id
      },
      {
        name: "Mayorista",
        marginPercent: new Prisma.Decimal(10),
        tenantId: s.tenantId,
        subsidiaryId: s.id,
        currencyId: currency.id
      },
      {
        name: "Minorista",
        marginPercent: new Prisma.Decimal(20),
        tenantId: s.tenantId,
        subsidiaryId: s.id,
        currencyId: currency.id
      }
    ];

    await prisma.priceType.createMany({
      data: priceTypesData,
      skipDuplicates: true
    });

    console.log(`✅ PriceTypes created for subsidiary ${s.id}`);
  }

  const all = await prisma.priceType.findMany();
  return all;
}
