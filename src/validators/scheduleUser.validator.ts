import { z } from "zod";

// ✅ Enum reutilizado
export const DayOfWeekEnum = z.enum([
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
  "DOMINGO",
]);

// ✅ Campos base reutilizables
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

// ✅ Crear horario de usuario
export const createScheduleUserSchema = z.object({
  ...baseScheduleFields,
});

// ✅ Actualizar horario de usuario
export const updateScheduleUserSchema = z.object({
  ...baseScheduleFields,
});

// ✅ Cambiar estado del horario (opcional por body si se usa)
export const toggleScheduleUserStatusSchema = z.object({
  status: z.boolean().optional(),
});

// ✅ Params: userId
export const userIdParamsSchema = z.object({
  userId: z.string().uuid({ message: "Invalid user ID" }),
});

// ✅ Params: id
export const scheduleUserIdParamsSchema = z.object({
  id: z.string().uuid({ message: "Invalid schedule ID" }),
});