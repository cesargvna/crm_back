// middleware/checkCashSessionOpen.ts
import prisma from "../utils/prisma";
import { Request, Response, NextFunction } from "express";

export const checkCashSessionOpen = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id; // asegúrate de tener `req.user` inyectado por auth
  if (!userId) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const session = await prisma.cashSession.findFirst({
    where: {
      userId,
      openDateTime: { gte: todayStart, lte: todayEnd },
    },
  });

  if (!session) {
    return res
      .status(403)
      .json({ message: "No active CashSession. Please open a CashSession first." });
  }

  if (!session.status) {
    return res.status(403).json({
      message: "Your CashSession is closed. No further actions are allowed.",
    });
  }

  // ✅ Continuar si está abierta
  next();
};
