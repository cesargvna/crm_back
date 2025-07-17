import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";

/**
 * GET /cashSession/:id
 * Obtener una CashSession por ID
 */
export const getCashSessionById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const session = await prisma.cashSession.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, username: true, lastname: true } },
    },
  });

  if (!session) return res.status(404).json({ message: "CashSession not found." });

  const [subsidiary, tenant] = await Promise.all([
    prisma.subsidiary.findUnique({ where: { id: session.subsidiaryId }, select: { id: true, name: true } }),
    prisma.tenant.findUnique({ where: { id: session.tenantId }, select: { id: true, name: true } }),
  ]);

  res.status(200).json({ message: "CashSession retrieved successfully.", ...session, subsidiary, tenant });
});

/**
 * GET /cashSession/byUser/:userId/closed
 * Obtener sesiones cerradas por usuario con búsqueda solo por workDate (enum)
 */
export const getClosedCashSessionsByUserId = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { search, page = "1", limit = "5" } = req.query;

  if (!userId) return res.status(400).json({ message: "userId is required." });

  const take = Math.max(parseInt(limit as string), 5);
  const skip = (parseInt(page as string) - 1) * take;

  const where: any = {
    userId,
    status: false,
  };

  // ✅ Solo buscar por workDate si se da el valor exacto del enum
  if (search && String(search).trim().length >= 2) {
    const normalized = String(search).trim().toUpperCase();
    where.workDate = { equals: normalized };
  }

  const [total, sessions] = await Promise.all([
    prisma.cashSession.count({ where }),
    prisma.cashSession.findMany({
      where,
      orderBy: { openDateTime: "desc" },
      skip,
      take,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastname: true,
            username: true,
          },
        },
      },
    }),
  ]);

  const enriched = await Promise.all(
    sessions.map(async (s) => {
      const [subsidiary, tenant] = await Promise.all([
        prisma.subsidiary.findUnique({
          where: { id: s.subsidiaryId },
          select: { id: true, name: true },
        }),
        prisma.tenant.findUnique({
          where: { id: s.tenantId },
          select: { id: true, name: true },
        }),
      ]);
      return { ...s, subsidiary, tenant };
    })
  );

  res.status(200).json({
    message: "Closed sessions retrieved successfully.",
    total,
    page: parseInt(page as string),
    limit: take,
    totalPages: Math.ceil(total / take),
    sessions: enriched,
  });
});

/**
 * GET /cashSession/byUser/:userId/open
 * Obtener sesión abierta por usuario
 */
export const getOpenCashSessionByUserId = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: "userId is required." });

  const session = await prisma.cashSession.findFirst({
    where: { userId, status: true },
    orderBy: { openDateTime: "desc" },
    include: {
      user: { select: { id: true, name: true, lastname: true, username: true } },
    },
  });

  if (!session) return res.status(200).json({ message: "No open session." });

  const [subsidiary, tenant] = await Promise.all([
    prisma.subsidiary.findUnique({ where: { id: session.subsidiaryId }, select: { id: true, name: true } }),
    prisma.tenant.findUnique({ where: { id: session.tenantId }, select: { id: true, name: true } }),
  ]);

  res.status(200).json({ message: "Open session retrieved.", ...session, subsidiary, tenant });
});

/**
 * POST /cashSession/open
 * Crear sesión de caja
 */
export const openCashSession = asyncHandler(async (req: Request, res: Response) => {
  const { userId, tenantId, subsidiaryId, workDate, openDate, closeDate, initialAmount, note } = req.body;

  if (!userId || !tenantId || !subsidiaryId || !initialAmount || !workDate || !openDate) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const [user, subsidiary] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.subsidiary.findUnique({ where: { id: subsidiaryId } }),
  ]);

  if (!user) return res.status(404).json({ message: "User not found." });
  if (!subsidiary) return res.status(404).json({ message: "Subsidiary not found." });
  if (subsidiary.tenantId !== tenantId) return res.status(400).json({ message: "Subsidiary does not belong to Tenant." });

  const today = new Date();
  const openSession = await prisma.cashSession.findFirst({
    where: {
      userId,
      openDateTime: {
        gte: new Date(today.setHours(0, 0, 0, 0)),
        lt: new Date(today.setHours(23, 59, 59, 999)),
      },
      status: true,
    },
  });

  if (openSession) {
    return res.status(409).json({ message: "An open CashSession already exists for today." });
  }

  const created = await prisma.cashSession.create({
    data: {
      userId,
      tenantId,
      subsidiaryId,
      workDate,
      openDate: openDate.trim(),
      closeDate: closeDate?.trim() ?? null,
      initialAmount,
      note: note?.trim() || null,
    },
    include: {
      user: { select: { id: true, username: true, name: true, lastname: true } },
    },
  });

  res.status(201).json({ message: "CashSession opened successfully.", ...created });
});

/**
 * PATCH /cashSession/:id/close
 * Cerrar sesión de caja
 */
export const closeCashSession = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { countedAmount, note } = req.body;

  if (!countedAmount) return res.status(400).json({ message: "countedAmount is required to close the session." });

  const session = await prisma.cashSession.findUnique({ where: { id } });

  if (!session) return res.status(404).json({ message: "CashSession not found." });
  if (!session.status) return res.status(400).json({ message: "CashSession is already closed." });

  const salesCash = 0;
  const totalCreditPayments = 0;
  const creditGivenToday = 0;
  const systemAmount = Number(session.initialAmount) + salesCash + totalCreditPayments;
  const difference = Number(countedAmount) - systemAmount;

  const updated = await prisma.cashSession.update({
    where: { id },
    data: {
      salesCash,
      totalCreditPayments,
      creditGivenToday,
      systemAmount,
      countedAmount,
      difference,
      closeDateTime: new Date(),
      status: false,
      note: note?.trim() || null,
    },
    include: {
      user: { select: { id: true, username: true, name: true, lastname: true } },
    },
  });

  res.status(200).json({ message: "CashSession closed successfully.", ...updated });
});