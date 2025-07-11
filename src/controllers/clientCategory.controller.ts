// src/controllers/clientCategory.controller.ts

import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";

// 🔵 Helpers de normalización
export function normalizeClientCategoryName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function normalizeClientCategoryDescription(value: string): string {
  return value.replace(/ñ/gi, "n").replace(/\s+/g, " ").trim();
}

// ✅ Crear ClientCategory
export const createClientCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, description, tenantId, subsidiaryId } = req.body;

    const normalizedName = normalizeClientCategoryName(name);
    const normalizedDescription = description
      ? normalizeClientCategoryDescription(description)
      : null;

    const subsidiary = await prisma.subsidiary.findUnique({
      where: { id: subsidiaryId },
    });

    if (!subsidiary) {
      return res.status(404).json({ message: "Subsidiary not found." });
    }

    if (subsidiary.tenantId !== tenantId) {
      return res.status(400).json({
        message: "The Subsidiary does not belong to the specified Tenant.",
      });
    }

    const exists = await prisma.clientCategory.findFirst({
      where: {
        name: normalizedName,
        tenantId,
        subsidiaryId,
      },
    });

    if (exists) {
      return res.status(409).json({
        message:
          "A client category with this name already exists for this tenant and subsidiary.",
      });
    }

    const created = await prisma.clientCategory.create({
      data: {
        name: normalizedName,
        description: normalizedDescription,
        tenantId,
        subsidiaryId,
      },
    });

    res.status(201).json({
      message: "Client category created successfully.",
      category: created,
    });
  }
);

// ✅ Actualizar ClientCategory
export const updateClientCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description } = req.body;

    const existing = await prisma.clientCategory.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: "Client category not found." });
    }

    let normalizedName: string | undefined = undefined;

    if (name) {
      normalizedName = normalizeClientCategoryName(name);

      if (normalizedName !== existing.name) {
        const duplicate = await prisma.clientCategory.findFirst({
          where: {
            id: { not: id },
            name: normalizedName,
            tenantId: existing.tenantId,
            subsidiaryId: existing.subsidiaryId,
          },
        });

        if (duplicate) {
          return res.status(409).json({
            message:
              "Another client category with this name already exists for this tenant and subsidiary.",
          });
        }
      }
    }

    const updated = await prisma.clientCategory.update({
      where: { id },
      data: {
        name: normalizedName ?? undefined,
        description: description
          ? normalizeClientCategoryDescription(description)
          : undefined,
      },
    });

    res.json({
      message: "Client category updated successfully.",
      category: updated,
    });
  }
);

// ✅ Obtener ClientCategories por Subsidiary
export const getClientCategoriesBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;
    const { search, status, page = "1", limit = "5" } = req.query;

    if (!subsidiaryId) {
      return res.status(400).json({ message: "subsidiaryId is required." });
    }

    const where: any = { subsidiaryId: subsidiaryId as string };

    if (search && String(search).trim().length >= 3) {
      const normalizedSearch = String(search).trim().toLowerCase();
      where.OR = [
        { name: { contains: normalizedSearch, mode: "insensitive" } },
        { description: { contains: normalizedSearch, mode: "insensitive" } },
      ];
    }

    if (status === "true") {
      where.status = true;
    } else if (status === "false") {
      where.status = false;
    }

    const take = Math.max(parseInt(limit as string) || 5, 5);
    const skip = (parseInt(page as string) - 1) * take;

    const [total, categories] = await Promise.all([
      prisma.clientCategory.count({ where }),
      prisma.clientCategory.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take,
      }),
    ]);

    res.json({
      total,
      page: parseInt(page as string),
      limit: take,
      totalPages: Math.ceil(total / take),
      categories,
    });
  }
);

// ✅ Obtener ClientCategory por ID
export const getClientCategoryById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const category = await prisma.clientCategory.findUnique({ where: { id } });

    if (!category) {
      return res.status(404).json({ message: "Client category not found." });
    }

    res.json(category);
  }
);

// ✅ Toggle ClientCategory status
export const toggleClientCategoryStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const category = await prisma.clientCategory.findUnique({ where: { id } });

    if (!category) {
      return res.status(404).json({ message: "Client category not found." });
    }

    // Nuevo estado invertido
    const newStatus = !category.status;

    // Actualiza la categoría
    const updatedCategory = await prisma.clientCategory.update({
      where: { id },
      data: { status: newStatus },
    });

    // Desactiva o activa todos los clientes relacionados
    await prisma.client.updateMany({
      where: { clientCategoryId: id },
      data: { status: newStatus },
    });

    res.json({
      message: `Client category status changed to ${
        newStatus ? "active" : "inactive"
      }, and all related clients have been ${newStatus ? "activated" : "deactivated"}.`,
      category: updatedCategory,
    });
  }
);

// ✅ Obtener solo ClientCategories activas por Subsidiary
export const getActiveClientCategoriesBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;

    if (!subsidiaryId) {
      return res.status(400).json({ message: "subsidiaryId is required." });
    }

    const activeCategories = await prisma.clientCategory.findMany({
      where: { subsidiaryId, status: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    res.json({
      total: activeCategories.length,
      categories: activeCategories,
    });
  }
);
