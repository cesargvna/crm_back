import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";

// ✅ Crear horario para una sucursal
export const createScheduleSubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;
    const { start_day, end_day, opening_hour, closing_hour } = req.body;

    // ✅ Obtener la subsidiaria y su tenantId
    const subsidiary = await prisma.subsidiary.findUnique({
      where: { id: subsidiaryId },
      select: {
        id: true,
        tenantId: true,
      },
    });

    if (!subsidiary) {
      return res.status(404).json({ message: "Subsidiary not found" });
    }

    // ✅ Verificar duplicado
    const existing = await prisma.scheduleSubsidiary.findFirst({
      where: {
        subsidiaryId,
        start_day,
        end_day,
        opening_hour,
        closing_hour,
      },
    });

    if (existing) {
      return res.status(409).json({
        message: "Schedule already exists for this subsidiary.",
      });
    }

    // ✅ Crear horario
    const schedule = await prisma.scheduleSubsidiary.create({
      data: {
        subsidiaryId,
        tenantId: subsidiary.tenantId,
        start_day,
        end_day,
        opening_hour,
        closing_hour,
      },
    });

    res.status(201).json(schedule);
  }
);

// ✅ Obtener horarios por subsidiaria con paginación, búsqueda y filtros
export const getSchedulesBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;
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
      subsidiaryId,
    };

    // Mapping de días para búsqueda parcial
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

      const matchedDays = dayNames.filter((day) =>
        day.includes(searchUpper)
      );

      if (matchedDays.length > 0) {
        whereClause.OR = [
          {
            start_day: { in: matchedDays },
          },
          {
            end_day: { in: matchedDays },
          },
        ];
      } else {
        // Si no hay match, forzar un resultado vacío
        whereClause.OR = [
          {
            start_day: { equals: "__NO_MATCH__" },
          },
        ];
      }
    }

    // Filtro de estado
    if (status !== "all") {
      whereClause.status = status === "true";
    }

    const sortDirection = sort?.toLowerCase() === "desc" ? "desc" : "asc";

    const [total, data] = await Promise.all([
      prisma.scheduleSubsidiary.count({
        where: whereClause,
      }),
      prisma.scheduleSubsidiary.findMany({
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

export const getScheduleSubsidiaryById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const schedule = await prisma.scheduleSubsidiary.findUnique({
    where: { id },
  });

  if (!schedule) {
    return res.status(404).json({ message: "Schedule not found" });
  }

  res.json(schedule);
});

// ✅ Actualizar horario (con verificación de duplicado)
export const updateScheduleSubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { start_day, end_day, opening_hour, closing_hour } = req.body;

    const existing = await prisma.scheduleSubsidiary.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    // ✅ Verificar duplicado (excepto el mismo)
    const duplicate = await prisma.scheduleSubsidiary.findFirst({
      where: {
        id: { not: id },
        subsidiaryId: existing.subsidiaryId,
        start_day,
        end_day,
        opening_hour,
        closing_hour,
      },
    });

    if (duplicate) {
      return res.status(409).json({
        message: "Another schedule already exists with these values.",
      });
    }

    // ✅ Actualizar
    const updated = await prisma.scheduleSubsidiary.update({
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
export const deleteScheduleSubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const existing = await prisma.scheduleSubsidiary.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    await prisma.scheduleSubsidiary.delete({
      where: { id },
    });

    res.json({ message: "Schedule deleted successfully" });
  }
);

// ✅ Cambiar estado (activar/desactivar)
export const toggleScheduleStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const schedule = await prisma.scheduleSubsidiary.findUnique({
      where: { id },
    });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const updated = await prisma.scheduleSubsidiary.update({
      where: { id },
      data: {
        status: !schedule.status,
        updated_at: new Date(),
      },
    });

    res.json({
      message: `Schedule is now ${updated.status ? "active" : "inactive"}`,
      schedule: updated,
    });
  }
);
