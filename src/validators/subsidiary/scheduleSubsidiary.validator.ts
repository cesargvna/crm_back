import { z } from "zod";

// ✅ Enum para los días
export const DayOfWeekEnum = z.enum([
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
  "DOMINGO",
]);

// ✅ Campos base obligatorios
const baseScheduleSubsidiaryFields = {
  start_day: DayOfWeekEnum,
  end_day: DayOfWeekEnum,
  opening_hour: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "opening_hour must be in HH:mm format (e.g. 08:00)",
  }),
  closing_hour: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "closing_hour must be in HH:mm format (e.g. 16:30)",
  }),
};

// ✅ Crear horario de subsidiaria
export const createScheduleSubsidiarySchema = z
  .object({
    ...baseScheduleSubsidiaryFields,
  })
  .refine(
    (data) => {
      const [h1, m1] = data.opening_hour.split(":").map(Number);
      const [h2, m2] = data.closing_hour.split(":").map(Number);
      return h1 * 60 + m1 < h2 * 60 + m2;
    },
    {
      message: "opening_hour must be earlier than closing_hour",
      path: ["closing_hour"],
    }
  )
  .refine(
    (data) => {
      const order = [
        "LUNES",
        "MARTES",
        "MIERCOLES",
        "JUEVES",
        "VIERNES",
        "SABADO",
        "DOMINGO",
      ];
      return order.indexOf(data.start_day) <= order.indexOf(data.end_day);
    },
    {
      message: "start_day must not be after end_day",
      path: ["end_day"],
    }
  );

// ✅ Actualizar horario de subsidiaria
export const updateScheduleSubsidiarySchema = createScheduleSubsidiarySchema;

// ✅ Activar/desactivar horario (opcional si se usa en PATCH body)
export const toggleScheduleStatusSchema = z.object({
  status: z.boolean().optional(),
});

// ✅ Param: subsidiaryId
export const subsidiaryIdParamsSchema = z.object({
  subsidiaryId: z.string().uuid({ message: "Invalid subsidiary ID" }),
});

// ✅ Param: schedule ID
export const scheduleSubsidiaryIdParamsSchema = z.object({
  id: z.string().uuid({ message: "Invalid schedule ID" }),
});
