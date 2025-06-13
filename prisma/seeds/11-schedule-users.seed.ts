import prisma from "../../src/utils/prisma";
import { DayOfWeek } from "../../generated/prisma";

const days: DayOfWeek[] = [
  "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO",
];

type UserSeedData = {
  id: string;
  tenantId: string | null;
};

export const seedScheduleUsers = async (users: UserSeedData[]) => {
  console.log("\n🌱 Seeding schedules for provided users...");

  const opening = new Date("1900-01-01T08:00:00Z");
  const closing = new Date("1900-01-01T16:00:00Z");

  for (const user of users) {
    if (!user.tenantId) {
      console.warn(`⚠️ Skipping user ${user.id} — missing tenantId`);
      continue;
    }

    for (const day of days) {
      await prisma.scheduleUser.create({
        data: {
          userId: user.id,
          tenantId: user.tenantId,
          start_day: day,
          end_day: day,
          opening_hour: opening,
          closing_hour: closing,
        },
      });
    }

    console.log(`✅ Schedules assigned for user ${user.id}`);
  }

  console.log("✅ Finished assigning schedules.\n");
};
