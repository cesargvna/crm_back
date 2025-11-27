// src/controllers/client/clientCategory.controller.ts

import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";

/* ──────────────────────────────────────────────────────────────────────────────
   Normalización y validación (en este mismo archivo)
   Reglas:
   - NAME: MAYÚSCULAS, sin acentos, SOLO letras y espacios (A–Z y Ñ), sin dobles
     espacios ni espacios al inicio/fin.
   - DESCRIPTION: MAYÚSCULAS, sin acentos, preserva Ñ, permite números/símbolos,
     sin dobles espacios ni espacios al inicio/fin.
──────────────────────────────────────────────────────────────────────────────── */

const NYE_SENTINEL = "\uFFFF";

function collapseSpaces(s: string): string {
  return typeof s === "string" ? s.replace(/\s+/g, " ").trim() : (s as any);
}

// Quita diacríticos preservando ñ/Ñ y pasa a MAYÚSCULAS; además colapsa espacios
function upperNoAccentsPreserveEnye(s: string): string {
  if (typeof s !== "string") return s as any;
  const noDiacritics = s
    .replace(/ñ/gi, NYE_SENTINEL) // proteger ñ/Ñ
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar acentos (á->a, ü->u, etc.)
    .toUpperCase()
    .replace(new RegExp(NYE_SENTINEL, "g"), "Ñ");
  return collapseSpaces(noDiacritics);
}

// NAME: upper/sin acentos → solo letras (A-Z y Ñ) + espacios, colapsar de nuevo
export function normalizeClientCategoryName(value: string): string {
  const up = upperNoAccentsPreserveEnye(String(value ?? ""));
  const lettersOnly = up.replace(/[^A-ZÑ ]+/g, "");
  return collapseSpaces(lettersOnly);
}

// DESCRIPTION: upper/sin acentos/Ñ preservada; permite números/símbolos
export function normalizeClientCategoryDescription(value: string): string {
  return upperNoAccentsPreserveEnye(String(value ?? ""));
}

// Validador NAME: solo letras y espacios (incluye Ñ), sin dobles espacios
function isValidCategoryName(s: string): boolean {
  return /^[A-ZÑ]+(?: [A-ZÑ]+)*$/.test(s);
}

/* ──────────────────────────────────────────────────────────────────────────────
   Crear ClientCategory
──────────────────────────────────────────────────────────────────────────────── */

export const createClientCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, tenantId, subsidiaryId } = req.body;

  const normalizedName = normalizeClientCategoryName(name);
  const normalizedDescription =
    typeof description === "string" ? normalizeClientCategoryDescription(description) : null;

  if (!normalizedName || !isValidCategoryName(normalizedName)) {
    return res.status(400).json({
      message:
        "Nombre inválido: use SOLO letras y espacios (incluye Ñ). Ej: 'CLIENTE MAYORISTA'.",
    });
  }

  const subsidiary = await prisma.subsidiary.findUnique({
    where: { id: String(subsidiaryId) },
  });

  if (!subsidiary) {
    return res.status(404).json({ message: "Subsidiary not found." });
  }

  if (String(subsidiary.tenantId) !== String(tenantId)) {
    return res.status(400).json({
      message: "The Subsidiary does not belong to the specified Tenant.",
    });
  }

  const exists = await prisma.clientCategory.findFirst({
    where: {
      name: normalizedName,
      tenantId: String(tenantId),
      subsidiaryId: String(subsidiaryId),
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
      tenantId: String(tenantId),
      subsidiaryId: String(subsidiaryId),
    },
  });

  res.status(201).json({
    message: "Client category created successfully.",
    category: created,
  });
});

/* ──────────────────────────────────────────────────────────────────────────────
   Actualizar ClientCategory
──────────────────────────────────────────────────────────────────────────────── */

export const updateClientCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const existing = await prisma.clientCategory.findUnique({ where: { id } });

  if (!existing) {
    return res.status(404).json({ message: "Client category not found." });
  }

  let normalizedName: string | undefined;

  if (typeof name === "string") {
    normalizedName = normalizeClientCategoryName(name);

    if (!normalizedName || !isValidCategoryName(normalizedName)) {
      return res.status(400).json({
        message: "Nombre inválido: use SOLO letras y espacios (incluye Ñ).",
      });
    }

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
      description:
        typeof description === "string"
          ? normalizeClientCategoryDescription(description)
          : undefined,
    },
  });

  res.json({
    message: "Client category updated successfully.",
    category: updated,
  });
});

/* ──────────────────────────────────────────────────────────────────────────────
   Obtener ClientCategories por Subsidiary (paginado + filtros + búsqueda)
   NOTA: Este método es para LISTADOS EN TABLA. Soporta:
   - búsqueda normalizada (MAYÚSCULAS/sin acentos/Ñ preservada),
   - filtro por estado,
   - paginación (page/limit) y total/totalPages.
──────────────────────────────────────────────────────────────────────────────── */

export const getClientCategoriesBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;
    const { search, status, page = "1", limit = "5" } = req.query;

    if (!subsidiaryId) {
      return res.status(400).json({ message: "subsidiaryId is required." });
    }

    const where: any = { subsidiaryId: String(subsidiaryId) };

    if (search && String(search).trim().length >= 3) {
      const normalizedSearch = upperNoAccentsPreserveEnye(String(search));
      where.OR = [
        { name: { contains: normalizedSearch } },
        { description: { contains: normalizedSearch } },
      ];
    }

    // Acepta true/false o 1/0
    if (status === "true" || status === "1") {
      where.status = true;
    } else if (status === "false" || status === "0") {
      where.status = false;
    }

    const take = Math.max(parseInt(String(limit)) || 5, 5);
    const pageNum = Math.max(parseInt(String(page)) || 1, 1);
    const skip = (pageNum - 1) * take;

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
      page: pageNum,
      limit: take,
      totalPages: Math.ceil(total / take),
      categories,
    });
  }
);

/* ──────────────────────────────────────────────────────────────────────────────
   Obtener ClientCategory por ID (detalle)
──────────────────────────────────────────────────────────────────────────────── */

export const getClientCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const category = await prisma.clientCategory.findUnique({ where: { id } });

  if (!category) {
    return res.status(404).json({ message: "Client category not found." });
  }

  res.json(category);
});

/* ──────────────────────────────────────────────────────────────────────────────
   Toggle ClientCategory status (y cascada a clientes)
──────────────────────────────────────────────────────────────────────────────── */

export const toggleClientCategoryStatus = asyncHandler(async (req: Request, res: Response) => {
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
});

/* ──────────────────────────────────────────────────────────────────────────────
   Obtener solo ClientCategories ACTIVAS por Subsidiary (para SELECTs)
   NOTA: Este método es liviano y pensado para combos, por eso solo devuelve
   id/name/description y NO pagina ni filtra por búsqueda.
──────────────────────────────────────────────────────────────────────────────── */

export const getActiveClientCategoriesBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;

    if (!subsidiaryId) {
      return res.status(400).json({ message: "subsidiaryId is required." });
    }

    const activeCategories = await prisma.clientCategory.findMany({
      where: { subsidiaryId: String(subsidiaryId), status: true },
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

/* ──────────────────────────────────────────────────────────────────────────────
   Obtener TODAS las ClientCategories por Subsidiary (sin paginar)
   ⚠️ DIFERENCIA VS getClientCategoriesBySubsidiary:
      - ESTE método NO pagina NI busca: trae TODO para vistas simples o admin.
      - El otro método SÍ pagina y soporta búsqueda/filtro de estado.
──────────────────────────────────────────────────────────────────────────────── */

export const getAllClientCategoriesBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;

    if (!subsidiaryId) {
      return res.status(400).json({ message: "subsidiaryId is required." });
    }

    const categories = await prisma.clientCategory.findMany({
      where: { subsidiaryId: String(subsidiaryId) },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
      },
    });

    res.json({
      total: categories.length,
      categories,
    });
  }
);
