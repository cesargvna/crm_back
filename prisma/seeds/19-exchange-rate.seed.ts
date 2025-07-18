import prisma from "../../src/utils/prisma";

type ExchangeRateSeed = {
  fromCurrencyId: string;
  toCurrencyId: string;
  rate: number;
  tenantId: string;
  subsidiaryId: string;
};

export async function seedExchangeRates(subsidiaries, currencies) {
  console.log("💱 Seeding ExchangeRates...");

  const allExchangeRates: {
    id: string;
    tenantId: string;
    subsidiaryId: string;
    fromCurrencyId: string;
    toCurrencyId: string;
    rate: any;
    created_at: Date;
    updated_at: Date;
  }[] = [];

  for (const s of subsidiaries) {
    if (
      s.id === "00000000-0000-0000-0000-000000000000" ||
      s.tenantId === "00000000-0000-0000-0000-000000000000"
    ) continue;

    const usd = currencies.find(c => c.code === "USD" && c.subsidiaryId === s.id);
    const bob = currencies.find(c => c.code === "BOB" && c.subsidiaryId === s.id);
    const pen = currencies.find(c => c.code === "PEN" && c.subsidiaryId === s.id);
    const clp = currencies.find(c => c.code === "CLP" && c.subsidiaryId === s.id);

    const data: ExchangeRateSeed[] = [];

    if (usd && bob) data.push({ fromCurrencyId: usd.id, toCurrencyId: bob.id, rate: 6.96, tenantId: s.tenantId, subsidiaryId: s.id });
    if (usd && pen) data.push({ fromCurrencyId: usd.id, toCurrencyId: pen.id, rate: 3.7, tenantId: s.tenantId, subsidiaryId: s.id });
    if (usd && clp) data.push({ fromCurrencyId: usd.id, toCurrencyId: clp.id, rate: 890.0, tenantId: s.tenantId, subsidiaryId: s.id });

    for (const d of data) {
      const existing = await prisma.exchangeRate.findFirst({
        where: {
          fromCurrencyId: d.fromCurrencyId,
          toCurrencyId: d.toCurrencyId,
          subsidiaryId: d.subsidiaryId,
        },
      });

      if (!existing) {
        const created = await prisma.exchangeRate.create({ data: d });
        allExchangeRates.push(created);
        console.log(`✅ ExchangeRate ${d.fromCurrencyId} → ${d.toCurrencyId} for subsidiary ${s.id}`);
      } else {
        allExchangeRates.push(existing);
      }
    }
  }

  console.log(`✅ Total exchange rates returned: ${allExchangeRates.length}`);
  return allExchangeRates;
}