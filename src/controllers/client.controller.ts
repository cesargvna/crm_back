// src/controllers/client.controller.ts

import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";

// 🔵 Helpers de normalización
export function normalizeClientName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeClientEmail(value: string): string {
  return value.trim().toLowerCase();
}

// ✅ Crear Client
export const createClient = asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    lastname,
    ci,
    nit,
    description,
    address,
    cellphone,
    telephone,
    email,
    tenantId,
    subsidiaryId,
    clientCategoryId,
  } = req.body;

  const normalizedName = normalizeClientName(name);
  const normalizedEmail = email ? normalizeClientEmail(email) : null;

  // ✅ Validar categoría de cliente
  const category = await prisma.clientCategory.findUnique({
    where: { id: clientCategoryId },
  });

  if (!category) {
    return res.status(404).json({ message: "Client category not found." });
  }

  if (category.tenantId !== tenantId || category.subsidiaryId !== subsidiaryId) {
    return res.status(400).json({
      message: "The Client Category does not belong to the specified Tenant/Subsidiary.",
    });
  }

  // ✅ Validar duplicado por nombre
  const exists = await prisma.client.findFirst({
    where: {
      name: normalizedName,
      tenantId,
      subsidiaryId,
    },
  });

  if (exists) {
    return res.status(409).json({
      message: "A client with this name already exists for this tenant and subsidiary.",
    });
  }

  const created = await prisma.client.create({
    data: {
      name: normalizedName,
      lastname,
      ci,
      nit,
      description,
      address,
      cellphone,
      telephone,
      email: normalizedEmail,
      tenantId,
      subsidiaryId,
      clientCategoryId,
      client_points: 0,
    },
  });

  res.status(201).json({
    message: "Client created successfully.",
    client: created,
  });
});

// ✅ Actualizar Client
export const updateClient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    name,
    lastname,
    ci,
    nit,
    description,
    address,
    cellphone,
    telephone,
    email,
    clientCategoryId,
  } = req.body;

  const existing = await prisma.client.findUnique({ where: { id } });

  if (!existing) {
    return res.status(404).json({ message: "Client not found." });
  }

  let normalizedName: string | undefined = undefined;
  let normalizedEmail: string | undefined = undefined;

  if (name) {
    normalizedName = normalizeClientName(name);

    if (normalizedName !== existing.name) {
      const duplicate = await prisma.client.findFirst({
        where: {
          id: { not: id },
          name: normalizedName,
          tenantId: existing.tenantId,
          subsidiaryId: existing.subsidiaryId,
        },
      });

      if (duplicate) {
        return res.status(409).json({
          message: "Another client with this name already exists for this tenant and subsidiary.",
        });
      }
    }
  }

  if (email) {
    normalizedEmail = normalizeClientEmail(email);
  }

  // ✅ Si se cambia de categoría, validar pertenencia
  if (clientCategoryId && clientCategoryId !== existing.clientCategoryId) {
    const category = await prisma.clientCategory.findUnique({
      where: { id: clientCategoryId },
    });

    if (!category) {
      return res.status(404).json({ message: "Client category not found." });
    }

    if (
      category.tenantId !== existing.tenantId ||
      category.subsidiaryId !== existing.subsidiaryId
    ) {
      return res.status(400).json({
        message: "The new Client Category does not belong to the same Tenant/Subsidiary.",
      });
    }
  }

  const updated = await prisma.client.update({
    where: { id },
    data: {
      name: normalizedName ?? undefined,
      lastname,
      ci,
      nit,
      description,
      address,
      cellphone,
      telephone,
      email: normalizedEmail ?? undefined,
      clientCategoryId: clientCategoryId ?? undefined,
    },
  });

  res.json({
    message: "Client updated successfully.",
    client: updated,
  });
});

// ✅ Obtener Clients por Subsidiary
export const getClientsBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;
    const {
      search,
      status,
      categoryId,
      page = "1",
      limit = "5",
    } = req.query;

    if (!subsidiaryId) {
      return res.status(400).json({ message: "subsidiaryId is required." });
    }

    const where: any = { subsidiaryId: subsidiaryId as string };

    // 🔍 Búsqueda opcional
    if (search && String(search).trim().length >= 3) {
      const normalizedSearch = String(search).trim().toLowerCase();
      where.OR = [
        { name: { contains: normalizedSearch, mode: "insensitive" } },
        { lastname: { contains: normalizedSearch, mode: "insensitive" } },
        { ci: { contains: normalizedSearch, mode: "insensitive" } },
        { nit: { contains: normalizedSearch, mode: "insensitive" } },
      ];
    }

    // ✅ Filtro por estado
    if (status === "true") {
      where.status = true;
    } else if (status === "false") {
      where.status = false;
    }
    // Si es "all" o no se manda => no se agrega nada

    // ✅ Filtro por categoría
    if (categoryId && categoryId !== "all") {
      where.clientCategoryId = categoryId as string;
    }

    // 📄 Paginación
    const take = Math.max(parseInt(limit as string) || 5, 5);
    const skip = (parseInt(page as string) - 1) * take;

    const [total, clients] = await Promise.all([
      prisma.client.count({ where }),
      prisma.client.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take,
        include: { clientCategory: true },
      }),
    ]);

    res.json({
      total,
      page: parseInt(page as string),
      limit: take,
      totalPages: Math.ceil(total / take),
      clients,
    });
  }
);

// ✅ Obtener Client por ID
export const getClientById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: { clientCategory: true },
  });

  if (!client) {
    return res.status(404).json({ message: "Client not found." });
  }

  res.json(client);
});

// ✅ Toggle Client status
export const toggleClientStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const client = await prisma.client.findUnique({ where: { id } });

  if (!client) {
    return res.status(404).json({ message: "Client not found." });
  }

  const updated = await prisma.client.update({
    where: { id },
    data: { status: !client.status },
  });

  res.json({
    message: `Client status changed to ${
      updated.status ? "active" : "inactive"
    }.`,
    client: updated,
  });
});

// ✅ Obtener solo Clients activos por Subsidiary
export const getActiveClientsBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;

    if (!subsidiaryId) {
      return res.status(400).json({ message: "subsidiaryId is required." });
    }

    const activeClients = await prisma.client.findMany({
      where: { subsidiaryId, status: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        lastname: true,
        email: true,
        cellphone: true,
      },
    });

    res.json({
      total: activeClients.length,
      clients: activeClients,
    });
  }
);
