import prisma from "../../src/utils/prisma";
import {
  DayOfWeek,
  ScheduleSubsidiary,
  Subsidiary,
} from "../../generated/prisma";

export async function scheduleSubsidiaries(
  subsidiaries: Subsidiary[]
): Promise<ScheduleSubsidiary[]> {
  console.log("⏳ Seeding subsidiary schedules...");

  const schedules: ScheduleSubsidiary[] = [];

  for (const subsidiary of subsidiaries) {
    const tenantId = subsidiary.tenantId;

    // Schedule 1: Monday to Friday
    const weekdayExists = await prisma.scheduleSubsidiary.findFirst({
      where: {
        subsidiaryId: subsidiary.id,
        start_day: DayOfWeek.LUNES,
        end_day: DayOfWeek.VIERNES,
        opening_hour: new Date("2025-01-01T08:00:00Z"),
        closing_hour: new Date("2025-01-01T18:00:00Z"),
      },
    });

    if (!weekdayExists) {
      const schedule1 = await prisma.scheduleSubsidiary.create({
        data: {
          subsidiaryId: subsidiary.id,
          tenantId,
          start_day: DayOfWeek.LUNES,
          end_day: DayOfWeek.VIERNES,
          opening_hour: new Date("2025-01-01T08:00:00Z"),
          closing_hour: new Date("2025-01-01T18:00:00Z"),
        },
      });
      schedules.push(schedule1);
      console.log(`✅ Weekday schedule added to "${subsidiary.name}"`);
    } else {
      console.log(
        `⚠️ Weekday schedule already exists for "${subsidiary.name}"`
      );
    }

    // Schedule 2: Saturday
    const saturdayExists = await prisma.scheduleSubsidiary.findFirst({
      where: {
        subsidiaryId: subsidiary.id,
        start_day: DayOfWeek.SABADO,
        end_day: DayOfWeek.SABADO,
        opening_hour: new Date("2025-01-01T08:00:00Z"),
        closing_hour: new Date("2025-01-01T12:00:00Z"),
      },
    });

    if (!saturdayExists) {
      const schedule2 = await prisma.scheduleSubsidiary.create({
        data: {
          subsidiaryId: subsidiary.id,
          tenantId,
          start_day: DayOfWeek.SABADO,
          end_day: DayOfWeek.SABADO,
          opening_hour: new Date("2025-01-01T08:00:00Z"),
          closing_hour: new Date("2025-01-01T12:00:00Z"),
        },
      });
      schedules.push(schedule2);
      console.log(`✅ Saturday schedule added to "${subsidiary.name}"`);
    } else {
      console.log(
        `⚠️ Saturday schedule already exists for "${subsidiary.name}"`
      );
    }
  }

  return schedules;
}
