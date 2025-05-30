// ✅ scheduleSubsidiary.validator.ts
import { z } from "zod";

// Base sin reglas avanzadas
const baseScheduleSubsidiarySchema = z.object({
  subsidiaryId: z
    .string({ required_error: "Subsidiary ID is required" })
    .uuid("Invalid subsidiary ID"),

  start_day: z
    .string()
    .max(10, "Start day must not exceed 10 characters.")
    .optional(),
  end_day: z
    .string()
    .max(10, "End day must not exceed 10 characters.")
    .optional(),

  opening_hour: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid opening_hour format. Must be ISO string",
    }),

  closing_hour: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid closing_hour format. Must be ISO string",
    }),

  status: z.boolean().optional(),
});

// Validación completa con regla de horario
export const scheduleSubsidiarySchema = baseScheduleSubsidiarySchema.refine(
  (data) => {
    if (!data.opening_hour || !data.closing_hour) return true;
    return new Date(data.opening_hour) < new Date(data.closing_hour);
  },
  {
    message: "Opening hour must be earlier than closing hour.",
    path: ["closing_hour"],
  }
);

// Versión para actualizar
export const updateScheduleSubsidiarySchema = baseScheduleSubsidiarySchema
  .partial()
  .extend({
    id: z
      .string({ required_error: "Schedule ID is required" })
      .uuid("Invalid schedule ID"),
  });

// Activar/desactivar
export const toggleScheduleSubsidiaryStatusSchema = z.object({
  id: z.string().uuid("Invalid schedule ID"),
});
