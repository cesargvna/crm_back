import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";

// ✅ Crear horario para un usuario
export const createScheduleUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const {
    start_day,
    end_day,
    opening_hour,
    closing_hour,
  } = req.body;

  // ✅ Obtener usuario y tenantId
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      tenantId: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // ✅ Verificar duplicado
  const existing = await prisma.scheduleUser.findFirst({
    where: {
      userId,
      start_day: start_day ?? null,
      end_day: end_day ?? null,
      opening_hour: opening_hour ? new Date(opening_hour) : null,
      closing_hour: closing_hour ? new Date(closing_hour) : null,
    },
  });

  if (existing) {
    return res.status(409).json({ message: "Schedule already exists for this user." });
  }

  // ✅ Crear horario
  const schedule = await prisma.scheduleUser.create({
    data: {
      userId,
      tenantId: user.tenantId!,
      start_day,
      end_day,
      opening_hour,
      closing_hour,
    },
  });

  res.status(201).json(schedule);
});

// ✅ Obtener horarios por usuario
export const getSchedulesByUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const schedules = await prisma.scheduleUser.findMany({
    where: { userId },
    orderBy: { created_at: "asc" },
  });

  res.json(schedules);
});

// ✅ Actualizar horario
export const updateScheduleUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    start_day,
    end_day,
    opening_hour,
    closing_hour,
  } = req.body;

  const existing = await prisma.scheduleUser.findUnique({
    where: { id },
  });

  if (!existing) {
    return res.status(404).json({ message: "Schedule not found" });
  }

  const updated = await prisma.scheduleUser.update({
    where: { id },
    data: {
      start_day,
      end_day,
      opening_hour,
      closing_hour,
    },
  });

  res.json(updated);
});

// ✅ Eliminar horario
export const deleteScheduleUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existing = await prisma.scheduleUser.findUnique({
    where: { id },
  });

  if (!existing) {
    return res.status(404).json({ message: "Schedule not found" });
  }

  await prisma.scheduleUser.delete({ where: { id } });

  res.json({ message: "Schedule deleted successfully" });
});

// ✅ Activar/desactivar horario
export const toggleScheduleUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const schedule = await prisma.scheduleUser.findUnique({ where: { id } });

  if (!schedule) {
    return res.status(404).json({ message: "Schedule not found" });
  }

  const updated = await prisma.scheduleUser.update({
    where: { id },
    data: {
      status: !schedule.status,
    },
  });

  res.json({
    message: `Schedule is now ${updated.status ? "active" : "inactive"}`,
    schedule: updated,
  });
});
