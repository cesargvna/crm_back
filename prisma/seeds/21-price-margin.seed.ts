import prisma from "../../src/utils/prisma";
import { ProductPriceMargin } from "../../generated/prisma";

export async function seedPriceMargins(subsidiaries, priceTypes) {
  console.log("📈 Seeding ProductPriceMargins...");

  const createdMargins: ProductPriceMargin[] = [];

  for (const s of subsidiaries) {
    if (
      s.id === "00000000-0000-0000-0000-000000000000" ||
      s.tenantId === "00000000-0000-0000-0000-000000000000"
    ) {
      console.log(`⏭️ Skipping subsidiary ${s.id} (or tenant ${s.tenantId}) for price margins.`);
      continue;
    }

    const minorista = priceTypes.find(
      (p) => p.name === "Minorista" && p.subsidiaryId === s.id
    );
    const mayorista = priceTypes.find(
      (p) => p.name === "Mayorista" && p.subsidiaryId === s.id
    );

    if (minorista) {
      const margin = await prisma.productPriceMargin.create({
        data: {
          priceTypeId: minorista.id,
          marginPercent: 25.0,
          tenantId: s.tenantId,
          subsidiaryId: s.id,
        },
      });
      createdMargins.push(margin); // ✅ Guarda
      console.log(`✅ Created Minorista margin for subsidiary ${s.id}`);
    } else {
      console.log(`⚠️ No Minorista type for subsidiary ${s.id}`);
    }

    if (mayorista) {
      const margin = await prisma.productPriceMargin.create({
        data: {
          priceTypeId: mayorista.id,
          marginPercent: 15.0,
          tenantId: s.tenantId,
          subsidiaryId: s.id,
        },
      });
      createdMargins.push(margin); // ✅ Guarda
      console.log(`✅ Created Mayorista margin for subsidiary ${s.id}`);
    } else {
      console.log(`⚠️ No Mayorista type for subsidiary ${s.id}`);
    }
  }

  console.log(`✅ Total margins created: ${createdMargins.length}`);
  return createdMargins; // ✅ Muy importante
}
