import { z } from "zod";

// ✅ Enum de días permitido por tu modelo Prisma
export const weekDays = [
  "LUNES",
  "MARTES",
  "MIÉRCOLES",
  "JUEVES",
  "VIERNES",
  "SÁBADO",
  "DOMINGO",
] as const;

const baseScheduleSubsidiarySchema = z.object({
  subsidiaryId: z
    .string({ required_error: "Subsidiary ID is required" })
    .uuid("Invalid subsidiary ID"),

  start_day: z.enum(weekDays),
  end_day: z.enum(weekDays),

  opening_hour: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid opening_hour format. Must be ISO string",
    }),

  closing_hour: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid closing_hour format. Must be ISO string",
    }),

  status: z.boolean(),
});

// ✅ Con comparación de horas
export const scheduleSubsidiarySchema = baseScheduleSubsidiarySchema.refine(
  (data) => new Date(data.opening_hour) < new Date(data.closing_hour),
  {
    message: "Opening hour must be earlier than closing hour.",
    path: ["closing_hour"],
  }
);

// ✅ Versión para actualizar
export const updateScheduleSubsidiarySchema = scheduleSubsidiarySchema;

// ✅ Para toggle
export const toggleScheduleSubsidiaryStatusSchema = z.object({
  id: z.string().uuid("Invalid schedule ID"),
});