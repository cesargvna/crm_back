// prisma/seeders/08-cash-session.seed.ts
import prisma from "../../src/utils/prisma";
import { Decimal } from "@prisma/client/runtime/library";

const DAYS = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"] as const;

const OPEN_HOUR = 8;   // 08:00
const SHIFT_HOURS = 8; // duración estándar del turno
const INITIAL_AMOUNT = new Decimal("100.00");

type UserSeedData = {
  id: string;
  tenantId: string | null;
  subsidiaryId: string | null;
  name?: string;
  subsidiaryName?: string;
};

// Helpers de decimales
const rnd = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const toDec = (n: number | string) =>
  new Decimal(typeof n === "number" ? n.toFixed(2) : n);

// Normaliza a 2 decimales
const sum = (a: Decimal, b: Decimal) => new Decimal(a.add(b).toFixed(2));
const sub = (a: Decimal, b: Decimal) => new Decimal(a.sub(b).toFixed(2));

function dayBounds(d: Date) {
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export async function seedCashSessions(users: UserSeedData[]) {
  console.log("\n🌱 Seeding CashSessions with dynamic values...");

  const FIXED_UUID = "00000000-0000-0000-0000-000000000000";
  let prepared = 0;
  let created = 0;
  let skipped = 0;

  for (const user of users) {
    const { id: userId, tenantId, subsidiaryId, name, subsidiaryName } = user;

    // Validaciones básicas
    if (
      !tenantId ||
      !subsidiaryId ||
      tenantId === FIXED_UUID ||
      subsidiaryId === FIXED_UUID
    ) {
      console.warn(
        `⚠️ Skipping CashSessions for user ${userId} — invalid tenantId or subsidiaryId`
      );
      continue;
    }

    // Base: hoy a las 08:00
    const base = new Date();
    base.setHours(OPEN_HOUR, 0, 0, 0);

    // 7 días seguidos a partir de hoy
    for (let i = 0; i < DAYS.length; i++) {
      prepared++;

      const openDateTime = new Date(base);
      openDateTime.setDate(base.getDate() + i);

      const isLast = i === DAYS.length - 1;

      // Idempotencia: ¿ya hay sesión ese día para este usuario?
      const { start, end } = dayBounds(openDateTime);
      const existing = await prisma.cashSession.findFirst({
        where: {
          userId,
          openDateTime: { gte: start, lte: end },
        },
      });
      if (existing) {
        skipped++;
        // Opcional: si quieres normalizar a una única “activa” por usuario, podrías cerrar las antiguas aquí.
        continue;
      }

      // Montos
      const salesCash = toDec(rnd(100, 500));
      const totalCreditPayments = toDec(rnd(50, 200));
      const creditGivenToday = toDec(rnd(20, 150));
      const systemAmount = sum(sum(INITIAL_AMOUNT, salesCash), totalCreditPayments);
      const countedAmount = sum(systemAmount, toDec(rnd(-10, 10)));
      const difference = sub(countedAmount, systemAmount);

      const note = `Session ${DAYS[i]} - ${subsidiaryName ?? "Subsidiary"} - ${name ?? "User"}`;

      // Si está abierta (último día), no seteamos closeDateTime
      const closeDateTime = isLast
        ? null
        : new Date(openDateTime.getTime() + SHIFT_HOURS * 60 * 60 * 1000);

      await prisma.cashSession.create({
        data: {
          userId,
          tenantId,
          subsidiaryId,

          openDateTime,
          closeDateTime,

          status: isLast, // sólo la última “activa”

          initialAmount: INITIAL_AMOUNT,
          salesCash,
          totalCreditPayments,
          creditGivenToday,
          systemAmount,
          countedAmount,
          difference,
          note,
        },
      });

      created++;
    }

    console.log(`✅ Prepared CashSessions for user ${userId}`);
  }

  console.log(
    `✅ CashSessions done. Prepared: ${prepared} | Created: ${created} | Skipped (existing): ${skipped}\n`
  );
}
