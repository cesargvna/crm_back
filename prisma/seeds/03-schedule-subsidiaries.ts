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

  // ⏰ Nuevos valores en formato string HH:mm
  const WEEK_OPEN = "08:00";
  const WEEK_CLOSE = "18:00";
  const SAT_OPEN = "08:00";
  const SAT_CLOSE = "12:00";

  for (const subsidiary of subsidiaries) {
    const { id: subsidiaryId, tenantId, name } = subsidiary;

    // 🔎 Verificar horario de Lunes a Viernes
    const weekdayExists = await prisma.scheduleSubsidiary.findFirst({
      where: {
        subsidiaryId,
        start_day: DayOfWeek.LUNES,
        end_day: DayOfWeek.VIERNES,
        opening_hour: WEEK_OPEN,
        closing_hour: WEEK_CLOSE,
      },
    });

    if (!weekdayExists) {
      const schedule1 = await prisma.scheduleSubsidiary.create({
        data: {
          subsidiaryId,
          tenantId,
          start_day: DayOfWeek.LUNES,
          end_day: DayOfWeek.VIERNES,
          opening_hour: WEEK_OPEN,
          closing_hour: WEEK_CLOSE,
        },
      });
      schedules.push(schedule1);
      console.log(`✅ Weekday schedule added to "${name}"`);
    } else {
      console.log(`⚠️ Weekday schedule already exists for "${name}"`);
    }

    // 🔎 Verificar horario de Sábado
    const saturdayExists = await prisma.scheduleSubsidiary.findFirst({
      where: {
        subsidiaryId,
        start_day: DayOfWeek.SABADO,
        end_day: DayOfWeek.SABADO,
        opening_hour: SAT_OPEN,
        closing_hour: SAT_CLOSE,
      },
    });

    if (!saturdayExists) {
      const schedule2 = await prisma.scheduleSubsidiary.create({
        data: {
          subsidiaryId,
          tenantId,
          start_day: DayOfWeek.SABADO,
          end_day: DayOfWeek.SABADO,
          opening_hour: SAT_OPEN,
          closing_hour: SAT_CLOSE,
        },
      });
      schedules.push(schedule2);
      console.log(`✅ Saturday schedule added to "${name}"`);
    } else {
      console.log(`⚠️ Saturday schedule already exists for "${name}"`);
    }
  }

  return schedules;
}
