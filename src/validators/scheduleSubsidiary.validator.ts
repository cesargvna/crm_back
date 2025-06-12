import { z } from "zod";

// Enum Zod equivalente al enum Prisma
export const DayOfWeekEnum = z.enum([
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
  "DOMINGO",
]);

// Validación base compartida
const baseScheduleFields = {
  start_day: DayOfWeekEnum.optional(),
  end_day: DayOfWeekEnum.optional(),
  opening_hour: z
    .string()
    .datetime({ message: "Invalid opening_hour format. Must be ISO datetime string" })
    .optional(),
  closing_hour: z
    .string()
    .datetime({ message: "Invalid closing_hour format. Must be ISO datetime string" })
    .optional(),
};

// ✅ Crear horario
export const createScheduleSubsidiarySchema = z.object({
  ...baseScheduleFields,
});

// ✅ Actualizar horario
export const updateScheduleSubsidiarySchema = z.object({
  ...baseScheduleFields,
});

// ✅ Cambiar estado (opcional por body, si lo usas en algún caso)
export const toggleScheduleStatusSchema = z.object({
  status: z.boolean().optional(),
});

export const subsidiaryIdParamsSchema = z.object({
  subsidiaryId: z.string().uuid({ message: "Invalid subsidiary ID" }),
});