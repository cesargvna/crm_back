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

type UserSeedData = {
  id: string;
  tenantId: string | null;
  subsidiaryId: string | null;
};

export const seedScheduleUsers = async (users: UserSeedData[]) => {
  console.log("\n🌱 Seeding user schedules...");

  const OPEN_HOUR = "08:00";
  const CLOSE_HOUR = "16:00";

  const data: any[] = [];

  for (const user of users) {
    const { id: userId, tenantId, subsidiaryId } = user;

    if (!tenantId || !subsidiaryId) {
      console.warn(`⚠️ Skipping user ${userId} — missing tenantId or subsidiaryId`);
      continue;
    }

    for (const day of days) {
      data.push({
        userId,
        tenantId,
        subsidiaryId,
        start_day: day,
        end_day: day,
        opening_hour: OPEN_HOUR,
        closing_hour: CLOSE_HOUR,
      });
    }

    console.log(`✅ Schedules prepared for user ${userId}`);
  }

  if (data.length > 0) {
    await prisma.scheduleUser.createMany({
      data,
      skipDuplicates: true,
    });
    console.log(`✅ ${data.length} user schedules inserted (duplicates skipped).`);
  } else {
    console.log("⚠️ No user schedules to insert.");
  }

  console.log("✅ Finished seeding user schedules.\n");
};
