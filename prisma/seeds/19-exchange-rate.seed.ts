import prisma from "../../src/utils/prisma";

export async function seedExchangeRates(subsidiaries, currencies) {
  console.log("💱 Seeding ExchangeRates...");

  let totalCreated = 0; // Contador total para mostrar resumen al final

  for (const subsidiary of subsidiaries) {
    // ✅ 1) Ignorar tenant/subsidiary dummy de prueba
    if (
      subsidiary.id === "00000000-0000-0000-0000-000000000000" ||
      subsidiary.tenantId === "00000000-0000-0000-0000-000000000000"
    ) {
      console.log(`⏭️ Skipping subsidiary ${subsidiary.id} for exchange rates.`);
      continue;
    }

    // ✅ 2) Asegurarse de que currencies esté definido y sea un array
    if (!Array.isArray(currencies)) {
      console.warn(`⚠️ currencies está undefined o no es un array. No se procesarán exchange rates para ${subsidiary.id}`);
      continue;
    }

    // ✅ 3) Buscar la moneda USD y BOB para esta subsidiaria
    const usd = currencies.find(
      (c) => c.code === "USD" && c.subsidiaryId === subsidiary.id
    );
    const bob = currencies.find(
      (c) => c.code === "BOB" && c.subsidiaryId === subsidiary.id
    );

    // ✅ 4) Validar que ambas existan
    if (!usd || !bob) {
      console.warn(`⚠️ Skipping subsidiary ${subsidiary.id} → USD or BOB not found.`);
      continue;
    }

    // ✅ 5) Crear tasa de cambio USD → BOB
    const result = await prisma.exchangeRate.createMany({
      data: [
        {
          fromCurrencyId: usd.id, // FK de la moneda origen USD
          toCurrencyId: bob.id,   // FK de la moneda destino BOB
          rate: 6.96,             // Valor de la tasa fija
          tenantId: subsidiary.tenantId, // Respetar el tenant real
          subsidiaryId: subsidiary.id,   // Subsidiaria real
        },
      ],
      skipDuplicates: true, // Evita error si ya existe
    });

    console.log(
      `✅ Created exchange rates for subsidiary ${subsidiary.id}:`,
      result
    );

    // ✅ 6) Sumar al contador total el resultado devuelto por createMany
    totalCreated += result.count || 0;
  }

  console.log(`✅ Total exchange rates created: ${totalCreated}`);
  return totalCreated; // Siempre devuelve un número
}
