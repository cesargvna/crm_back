import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";

// ✅ Crear AllowedAction
export const createAllowedAction = asyncHandler(
  async (req: Request, res: Response) => {
    const { moduleId, submoduleId, actionId } = req.body;

    if (!moduleId && !submoduleId) {
      return res
        .status(400)
        .json({ message: "Either moduleId or submoduleId is required." });
    }

    const compositeKey = `${actionId}-${moduleId || ""}-${submoduleId || ""}`;

    const exists = await prisma.allowedAction.findFirst({
      where: { compositeKey },
    });

    if (exists) {
      return res.status(409).json({
        message: "AllowedAction already exists for this combination.",
      });
    }

    const created = await prisma.allowedAction.create({
      data: {
        moduleId,
        submoduleId,
        actionId,
        compositeKey,
      },
    });

    res.status(201).json(created);
  }
);

// ✅ Obtener AllowedActions (filtrado opcional)
export const getAllAllowedActions = asyncHandler(
  async (req: Request, res: Response) => {
    const { moduleId, submoduleId } = req.query;

    const where = {
      moduleId: moduleId as string | undefined,
      submoduleId: submoduleId as string | undefined,
    };

    const actions = await prisma.allowedAction.findMany({
      where,
      include: { action: true },
      orderBy: { id: "asc" },
    });

    res.json(actions);
  }
);

// ✅ Eliminar AllowedAction
export const deleteAllowedAction = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const exists = await prisma.allowedAction.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ message: "AllowedAction not found." });
    }

    await prisma.allowedAction.delete({ where: { id } });

    res.json({ message: "AllowedAction deleted successfully." });
  }
);
