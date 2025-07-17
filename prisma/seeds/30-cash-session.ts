import prisma from "../../src/utils/prisma";
import { DayOfWeek } from "../../generated/prisma";

const days: DayOfWeek[] = [
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
  "DOMINGO",
];

const OPEN_HOUR = "08:00";
const CLOSE_HOUR = "16:00";
const INITIAL_AMOUNT = 100.0;

type UserSeedData = {
  id: string;
  tenantId: string | null;
  subsidiaryId: string | null;
  name?: string;
  subsidiaryName?: string;
};

function getRandomDecimal(min: number, max: number, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

export const seedCashSessions = async (users: UserSeedData[]) => {
  console.log("\n🌱 Seeding CashSessions with dynamic values...");

  const data: any[] = [];

  for (const user of users) {
    const { id: userId, tenantId, subsidiaryId, name, subsidiaryName } = user;

    if (
      !tenantId ||
      !subsidiaryId ||
      tenantId === "00000000-0000-0000-0000-000000000000" ||
      subsidiaryId === "00000000-0000-0000-0000-000000000000"
    ) {
      console.warn(
        `⚠️ Skipping CashSessions for user ${userId} — invalid tenantId or subsidiaryId`
      );
      continue;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    days.forEach((day, i) => {
      const openDateTime = new Date(today);
      openDateTime.setDate(today.getDate() + i);
      const closeDateTime = new Date(openDateTime);
      closeDateTime.setHours(openDateTime.getHours() + 8);

      const salesCash = getRandomDecimal(100, 500);
      const totalCreditPayments = getRandomDecimal(50, 200);
      const creditGivenToday = getRandomDecimal(20, 150);
      const systemAmount = INITIAL_AMOUNT + salesCash + totalCreditPayments;
      const countedAmount = systemAmount + getRandomDecimal(-10, 10);
      const difference = countedAmount - systemAmount;

      const note = `Session ${day} - ${subsidiaryName ?? 'Subsidiary'} - ${name ?? 'User'}`;

      const isLastDay = i === days.length - 1;

      data.push({
        userId,
        tenantId,
        subsidiaryId,
        workDate: day,
        openDate: OPEN_HOUR,
        closeDate: CLOSE_HOUR,
        openDateTime,
        closeDateTime,
        status: isLastDay, // solo la última sesión activa
        initialAmount: INITIAL_AMOUNT,
        salesCash,
        totalCreditPayments,
        creditGivenToday,
        systemAmount,
        countedAmount,
        difference,
        note,
      });
    });

    console.log(`✅ Prepared CashSessions for user ${userId}`);
  }

  if (data.length > 0) {
    await prisma.cashSession.createMany({
      data,
      skipDuplicates: true,
    });
    console.log(`✅ ${data.length} CashSessions inserted (duplicates skipped).`);
  } else {
    console.log("⚠️ No CashSessions to insert.");
  }

  console.log("✅ Finished seeding CashSessions.\n");
};
