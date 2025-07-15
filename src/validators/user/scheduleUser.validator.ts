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
  start_day: DayOfWeekEnum,
  end_day: DayOfWeekEnum,
  opening_hour: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: "opening_hour must be in HH:mm format (e.g. 08:00)",
    }),
  closing_hour: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: "closing_hour must be in HH:mm format (e.g. 16:30)",
    }),
};

export const createScheduleUserSchema = z
  .object({
    ...baseScheduleFields,
  })
  .refine(
    (data) => {
      const [openH, openM] = data.opening_hour.split(":").map(Number);
      const [closeH, closeM] = data.closing_hour.split(":").map(Number);
      return openH * 60 + openM < closeH * 60 + closeM;
    },
    {
      message: "opening_hour must be earlier than closing_hour",
      path: ["closing_hour"],
    }
  )
  .refine(
    (data) => {
      const dayOrder = [
        "LUNES",
        "MARTES",
        "MIERCOLES",
        "JUEVES",
        "VIERNES",
        "SABADO",
        "DOMINGO",
      ];
      return (
        dayOrder.indexOf(data.start_day) <= dayOrder.indexOf(data.end_day)
      );
    },
    {
      message: "start_day must not be after end_day",
      path: ["end_day"],
    }
  );

// ✅ Actualizar horario de usuario
export const updateScheduleUserSchema = z
  .object({
    ...baseScheduleFields,
  })
  .refine(
    (data) => {
      const [openH, openM] = data.opening_hour.split(":").map(Number);
      const [closeH, closeM] = data.closing_hour.split(":").map(Number);

      const openTotal = openH * 60 + openM;
      const closeTotal = closeH * 60 + closeM;

      return openTotal < closeTotal;
    },
    {
      message: "opening_hour must be earlier than closing_hour",
      path: ["closing_hour"],
    }
  )
  .refine(
    (data) => {
      const dayOrder = [
        "LUNES",
        "MARTES",
        "MIERCOLES",
        "JUEVES",
        "VIERNES",
        "SABADO",
        "DOMINGO",
      ];
      return (
        dayOrder.indexOf(data.start_day) <= dayOrder.indexOf(data.end_day)
      );
    },
    {
      message: "start_day must not be after end_day",
      path: ["end_day"],
    }
  );



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