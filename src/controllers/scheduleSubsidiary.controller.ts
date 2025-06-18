import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";

// ✅ Crear horario para una sucursal
export const createScheduleSubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;
    const {
      start_day,
      end_day,
      opening_hour,
      closing_hour,
    } = req.body;

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

    // ✅ Construir cláusula dinámica para verificar duplicado
    const whereClause: any = {
      subsidiaryId,
    };

    if (start_day) whereClause.start_day = start_day;
    if (end_day) whereClause.end_day = end_day;
    if (opening_hour) whereClause.opening_hour = new Date(opening_hour);
    if (closing_hour) whereClause.closing_hour = new Date(closing_hour);

    const existing = await prisma.scheduleSubsidiary.findFirst({
      where: whereClause,
    });

    if (existing) {
      return res
        .status(409)
        .json({ message: "Schedule already exists for this subsidiary." });
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
      sort = "asc",
      orderBy = "start_day",
    } = req.query as Record<string, string>;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const whereClause: any = {
      subsidiaryId,
    };

    // Filtro de búsqueda (por día)
    if (search) {
      whereClause.OR = [
        {
          start_day: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          end_day: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Filtro de estado
    if (status !== "all") {
      whereClause.status = status === "true";
    }

    const [total, data] = await Promise.all([
      prisma.scheduleSubsidiary.count({
        where: whereClause,
      }),
      prisma.scheduleSubsidiary.findMany({
        where: whereClause,
        skip,
        take: limitNumber,
        orderBy: {
          [orderBy]: sort,
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
export const updateScheduleSubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      start_day,
      end_day,
      opening_hour,
      closing_hour,
    } = req.body;

    const existing = await prisma.scheduleSubsidiary.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Schedule not found" });
    }

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
      },
    });

    res.json({
      message: `Schedule is now ${updated.status ? "active" : "inactive"}`,
      schedule: updated,
    });
  }
);
