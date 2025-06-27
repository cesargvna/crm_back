import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";

// ✅ Crear horario para un usuario
export const createScheduleUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { start_day, end_day, opening_hour, closing_hour } = req.body;

    // ✅ Obtener usuario con tenantId y subsidiaryId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        tenantId: true,
        subsidiaryId: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Verificar duplicado
    const existing = await prisma.scheduleUser.findFirst({
      where: {
        userId,
        start_day,
        end_day,
        opening_hour,
        closing_hour,
      },
    });

    if (existing) {
      return res
        .status(409)
        .json({ message: "Schedule already exists for this user." });
    }

    // ✅ Crear horario con tenantId y subsidiaryId
    const schedule = await prisma.scheduleUser.create({
      data: {
        userId,
        tenantId: user.tenantId!,
        subsidiaryId: user.subsidiaryId,
        start_day,
        end_day,
        opening_hour,
        closing_hour,
      },
    });

    res.status(201).json(schedule);
  }
);

// ✅ Obtener horarios por usuario con paginación, búsqueda y filtros
export const getSchedulesByUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const {
      page = "1",
      limit = "5",
      search = "",
      status = "all",
      sort = "desc",
      orderBy = "updated_at",
    } = req.query as Record<string, string>;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const whereClause: any = {
      userId,
    };

    // 🕵️‍♂️ Filtro de búsqueda por días
    const dayNames = [
      "LUNES",
      "MARTES",
      "MIERCOLES",
      "JUEVES",
      "VIERNES",
      "SABADO",
      "DOMINGO",
    ];

    if (search) {
      const searchUpper = search.trim().toUpperCase();
      const matchedDays = dayNames.filter((day) => day.includes(searchUpper));

      if (matchedDays.length > 0) {
        whereClause.OR = [
          { start_day: { in: matchedDays } },
          { end_day: { in: matchedDays } },
        ];
      } else {
        whereClause.OR = [{ start_day: { equals: "__NO_MATCH__" } }];
      }
    }

    // ✅ Filtro por estado
    if (status !== "all") {
      whereClause.status = status === "true";
    }

    const sortDirection = sort?.toLowerCase() === "desc" ? "desc" : "asc";

    const [total, data] = await Promise.all([
      prisma.scheduleUser.count({
        where: whereClause,
      }),
      prisma.scheduleUser.findMany({
        where: whereClause,
        skip,
        take: limitNumber,
        orderBy: {
          [orderBy]: sortDirection,
        },
      }),
    ]);

    res.json({
      total,
      page: pageNumber,
      limit: limitNumber,
      data,
    });
  }
);

// ✅ Actualizar horario
export const updateScheduleUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { start_day, end_day, opening_hour, closing_hour } = req.body;

    const existing = await prisma.scheduleUser.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    // ✅ Verificar si ya existe otro horario igual para el mismo usuario
    const duplicate = await prisma.scheduleUser.findFirst({
      where: {
        id: { not: id },
        userId: existing.userId,
        start_day,
        end_day,
        opening_hour,
        closing_hour,
      },
    });

    if (duplicate) {
      return res.status(409).json({
        message:
          "Another schedule with the same range already exists for this user.",
      });
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
  }
);

// ✅ Eliminar horario
export const deleteScheduleUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const existing = await prisma.scheduleUser.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    await prisma.scheduleUser.delete({ where: { id } });

    res.json({ message: "Schedule deleted successfully" });
  }
);

// ✅ Activar/desactivar horario
export const toggleScheduleUserStatus = asyncHandler(
  async (req: Request, res: Response) => {
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
  }
);
