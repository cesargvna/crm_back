import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";

// ✅ Crear Inventory
export const createInventory = asyncHandler(async (req: Request, res: Response) => {
  const {
    productId,
    quantity_available,
    min_quantity,
    lastUpdateReason,
    lastUpdateQuantity,
    userId,
    tenantId,
    subsidiaryId,
  } = req.body;

  // Validar si ya existe inventario para el mismo producto y subsidiary
  const exists = await prisma.inventory.findFirst({
    where: { productId, subsidiaryId },
  });

  if (exists) {
    return res.status(409).json({
      message: "Inventory for this product and subsidiary already exists.",
    });
  }

  const created = await prisma.inventory.create({
    data: {
      productId,
      quantity_available,
      min_quantity,
      lastUpdateReason,
      lastUpdateQuantity,
      userId,
      tenantId,
      subsidiaryId,
    },
  });

  res.status(201).json({
    message: "Inventory created successfully.",
    inventory: created,
  });
});

// ✅ Get Inventories por Subsidiary (con product name y category)
export const getInventoriesBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;
    const { search, page = "1", limit = "10" } = req.query;

    if (!subsidiaryId) {
      return res.status(400).json({ message: "subsidiaryId is required." });
    }

    const where: any = { subsidiaryId };

    if (search && String(search).trim().length >= 2) {
      const normalizedSearch = String(search).trim().toLowerCase();
      where.product = {
        name: { contains: normalizedSearch, mode: "insensitive" },
      };
    }

    const take = Math.max(parseInt(limit as string) || 10, 5);
    const skip = (parseInt(page as string) - 1) * take;

    const [total, inventories] = await Promise.all([
      prisma.inventory.count({ where }),
      prisma.inventory.findMany({
        where,
        skip,
        take,
        orderBy: { updated_at: "desc" },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              productCategory: {
                select: { id: true, name: true },
              },
            },
          },
        },
      }),
    ]);

    res.json({
      total,
      page: parseInt(page as string),
      limit: take,
      totalPages: Math.ceil(total / take),
      inventories,
    });
  }
);



export const getInventoryByProductId = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;

  // ✅ Validar existencia del parámetro
  if (!productId || typeof productId !== "string") {
    return res.status(400).json({ message: "Parámetro 'productId' inválido o no proporcionado." });
  }

  // 🔍 1. Obtener producto con relaciones
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      productCategory: true,
      unitMeasurement: true,
      inventory: true,
      productPrices: {
        include: {
          priceType: true,
          currency: true,
        },
      },
      purchaseDetails: {
        include: {
          purchase: {
            select: {
              id: true,
              purchaseDate: true,
              paymentType: true,
              supplier: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!product) {
    return res.status(404).json({ message: "Producto no encontrado." });
  }

  // 🔍 2. Extraer todos los userIds de inventario y compras
  const userIdsSet = new Set<string>();

  for (const inv of product.inventory) {
    if (inv.userId) userIdsSet.add(inv.userId);
  }

  for (const detail of product.purchaseDetails) {
    if (detail.userId) userIdsSet.add(detail.userId);
  }

  const userIds = Array.from(userIdsSet);

  // 🔍 3. Obtener usuarios únicos relacionados
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      name: true,
      lastname: true,
      username: true,
    },
  });

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  // 🔄 4. Enriquecer inventario con datos del usuario
  const enrichedInventory = product.inventory.map((inv) => ({
    ...inv,
    user: userMap[inv.userId] || null,
  }));

  // 🔄 5. Enriquecer detalles de compra con datos del usuario
  const enrichedPurchaseDetails = product.purchaseDetails.map((detail) => ({
    ...detail,
    user: userMap[detail.userId] || null,
  }));

  // ✅ 6. Devolver datos finales
  res.json({
    ...product,
    inventory: enrichedInventory,
    purchaseDetails: enrichedPurchaseDetails,
  });
});
