// src/validators/scheduleUser.validator.ts
import { z } from "zod";

export const dayOfWeekEnum = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

// Base sin refine
const baseScheduleUserSchema = z.object({
  userId: z
    .string({ required_error: "User ID is required" })
    .uuid("Invalid user ID"),

  start_day: dayOfWeekEnum.optional(),
  end_day: dayOfWeekEnum.optional(),

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

// Con validación lógica de hora
export const scheduleUserSchema = baseScheduleUserSchema.refine(
  (data) => {
    if (!data.opening_hour || !data.closing_hour) return true;
    return new Date(data.opening_hour) < new Date(data.closing_hour);
  },
  {
    message: "Opening hour must be earlier than closing hour.",
    path: ["closing_hour"],
  }
);

export const updateScheduleUserSchema = baseScheduleUserSchema
  .partial()
  .extend({
    id: z
      .string({ required_error: "Schedule ID is required" })
      .uuid("Invalid schedule ID"),
  });

export const toggleScheduleStatusSchema = z.object({
  id: z.string().uuid("Invalid schedule ID"),
});
