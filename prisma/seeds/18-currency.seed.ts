// ✅ seedCurrencies.ts
import prisma from "../../src/utils/prisma";

export async function seedCurrencies(subsidiaries) {
  console.log("💱 Seeding Currencies...");

  for (const s of subsidiaries) {
    if (
      s.id === "00000000-0000-0000-0000-000000000000" ||
      s.tenantId === "00000000-0000-0000-0000-000000000000"
    ) {
      console.log(`⏭️ Skipping subsidiary ${s.id}`);
      continue;
    }

    await prisma.currency.createMany({
      data: [
        { code: "BOB", name: "Boliviano", tenantId: s.tenantId, subsidiaryId: s.id },
      ],
      skipDuplicates: true,
    });

    console.log(`✅ Currencies created for subsidiary ${s.id}`);
  }

  const all = await prisma.currency.findMany();
  return all;
}
