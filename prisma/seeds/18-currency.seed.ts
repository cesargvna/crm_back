import prisma from "../../src/utils/prisma";

export async function seedCurrencies(subsidiaries) {
  console.log("💱 Seeding Currencies...");

  for (const s of subsidiaries) {
    // ✅ Ignora subsidiaries o tenants con ID inválido
    if (
      s.id === "00000000-0000-0000-0000-000000000000" ||
      s.tenantId === "00000000-0000-0000-0000-000000000000"
    ) {
      console.log(`⏭️ Skipping subsidiary ${s.id} (or tenant ${s.tenantId}) for currencies.`);
      continue;
    }

    // ✅ Crea USD y BOB para la sucursal válida
    await prisma.currency.createMany({
      data: [
        {
          code: "USD",
          name: "Dólar americano",
          tenantId: s.tenantId,
          subsidiaryId: s.id,
        },
        {
          code: "BOB",
          name: "Boliviano",
          tenantId: s.tenantId,
          subsidiaryId: s.id,
        },
      ],
      skipDuplicates: true,
    });

    console.log(`✅ Created currencies for subsidiary: ${s.id}`);
  }

  // ⚠️ Filtra solo las subsidiarias válidas para traer los currencies creados
  const validSubsidiaries = subsidiaries.filter(
    (s) =>
      s.id !== "00000000-0000-0000-0000-000000000000" &&
      s.tenantId !== "00000000-0000-0000-0000-000000000000"
  );

  console.log("✅ Creating currencies for:", validSubsidiaries.map((s) => s.id));

  const all = await prisma.currency.findMany({
    where: { subsidiaryId: { in: validSubsidiaries.map((s) => s.id) } },
  });

  console.log("✅ Created currencies:", all);

  return all; // ✅ Retorna solo los currencies de subsidiaries válidas
}
