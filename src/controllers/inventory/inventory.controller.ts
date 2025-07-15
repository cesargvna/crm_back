import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";

// ✅ Crear inventario
export const createInventory = asyncHandler(async (req: Request, res: Response) => {
  const { productId, quantity_available, min_quantity, lastUpdateReason, lastUpdateQuantity, userId, tenantId, subsidiaryId } = req.body;

  // Validar duplicado por productId + subsidiaryId
  const exists = await prisma.inventory.findFirst({ where: { productId, subsidiaryId } });
  if (exists) {
    return res.status(409).json({ message: "Inventory record already exists for this product in this subsidiary." });
  }

  const created = await prisma.inventory.create({
    data: { productId, quantity_available, min_quantity, lastUpdateReason, lastUpdateQuantity, userId, tenantId, subsidiaryId },
  });

  res.status(201).json({ message: "Inventory created successfully.", inventory: created });
});

// ✅ Obtener por subsidiary
export const getInventoriesBySubsidiary = asyncHandler(async (req: Request, res: Response) => {
  const { subsidiaryId } = req.params;

  const inventories = await prisma.inventory.findMany({
    where: { subsidiaryId },
    orderBy: { created_at: "desc" },
  });

  res.json({ total: inventories.length, inventories });
});
