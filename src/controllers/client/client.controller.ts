// src/controllers/client/client.controller.ts

import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { asyncHandler } from "../../utils/asyncHandler";

/* ──────────────────────────────────────────────────────────────────────────────
   Normalización y validación (en este mismo archivo)
   Reglas según tu schema/comentarios por campo:

   - name:         MAYÚSCULAS, sin acentos, SOLO letras y espacios (A–Z y Ñ),
                   sin dobles espacios ni espacios extremos.
   - ci, nit:      SOLO números (1–20 chars después de normalizar).
   - description:  MAYÚSCULAS, sin acentos, Ñ preservada, permite letras/números/
                   símbolos básicos; sin dobles espacios ni extremos; máx 255.
   - address:      Igual que description; máx 255.
   - cellphone,
     telephone:    Guardar como "+591 ########" (8 dígitos locales). Acepta entradas
                   con 8 dígitos, "591" + 8 dígitos, o "0" + 8 dígitos.
   - email:        trim + lowercase; validación de formato básica.
──────────────────────────────────────────────────────────────────────────────── */

const NYE_SENTINEL = "\uFFFF";

const collapseSpaces = (s: string): string =>
  typeof s === "string" ? s.replace(/\s+/g, " ").trim() : (s as any);

const upperNoAccentsPreserveEnye = (s: string): string => {
  if (typeof s !== "string") return s as any;
  const noDiacritics = s
    .replace(/ñ/gi, NYE_SENTINEL) // proteger ñ/Ñ
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar acentos (á->a, ü->u, etc.)
    .toUpperCase()
    .replace(new RegExp(NYE_SENTINEL, "g"), "Ñ");
  return collapseSpaces(noDiacritics);
};

// NAME: upper/sin acentos → solo letras (A-Z y Ñ) + espacios, colapsar de nuevo
export function normalizeClientName(value: string): string {
  const up = upperNoAccentsPreserveEnye(String(value ?? ""));
  const lettersOnly = up.replace(/[^A-ZÑ ]+/g, "");
  return collapseSpaces(lettersOnly);
}

function isValidClientName(s: string): boolean {
  // Solo letras A-Z/Ñ con espacios simples entre palabras (ya colapsados)
  return /^[A-ZÑ]+(?: [A-ZÑ]+)*$/.test(s);
}

// CI / NIT: solo dígitos; 1–20 chars
function normalizeDigits(value?: string | null): string | null {
  if (typeof value !== "string") return null;
  const digits = value.replace(/\D+/g, "");
  return digits.length ? digits : null;
}

function validateDigitsLength(label: string, digits: string | null) {
  if (digits && (digits.length < 1 || digits.length > 20)) {
    throw new Error(`${label} must have 1 to 20 digits.`);
  }
}

// Celular/Teléfono Bolivia: +591 ########
function normalizeBOPhone(value?: string | null): string | null {
  if (typeof value !== "string") return null;
  const raw = value.replace(/\D+/g, ""); // solo dígitos

  let local8: string | null = null;
  if (raw.length === 8) {
    local8 = raw;
  } else if (raw.length === 11 && raw.startsWith("591")) {
    local8 = raw.slice(3);
  } else if (raw.length === 9 && raw.startsWith("0")) {
    local8 = raw.slice(1);
  }

  if (!local8) return null;
  if (!/^\d{8}$/.test(local8)) return null;

  return `+591 ${local8}`;
}

// DESCRIPTION / ADDRESS: upper/sin acentos (Ñ preservada), espacios colapsados
// Se permite cualquier símbolo básico; validamos longitud máx 255
function normalizeLongText255(value?: string | null): string | null {
  if (typeof value !== "string") return null;
  const up = upperNoAccentsPreserveEnye(value);
  return up.length > 255 ? up.slice(0, 255) : up;
}

// Email: trim + lowercase + validación básica
function normalizeEmail(value?: string | null): string | null {
  if (typeof value !== "string") return null;
  const e = value.trim().toLowerCase();
  return e || null;
}

function isValidEmail(e: string | null): boolean {
  if (!e) return true; // null/undefined permitido
  // Regex básica y razonable
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

/* ──────────────────────────────────────────────────────────────────────────────
   Crear Client
──────────────────────────────────────────────────────────────────────────────── */

export const createClient = asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
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

  // Normalizaciones
  const normalizedName = normalizeClientName(name);
  const normalizedCI = normalizeDigits(ci);
  const normalizedNIT = normalizeDigits(nit);
  const normalizedDesc = normalizeLongText255(description);
  const normalizedAddr = normalizeLongText255(address);
  const normalizedCell = normalizeBOPhone(cellphone);
  const normalizedTel = normalizeBOPhone(telephone);
  const normalizedEmail = normalizeEmail(email);

  // Validaciones
  if (!normalizedName || !isValidClientName(normalizedName)) {
    return res.status(400).json({
      message:
        "Nombre inválido: use SOLO letras y espacios (incluye Ñ). Ej: 'JUAN PEREZ'.",
    });
  }
  try {
    validateDigitsLength("CI", normalizedCI);
    validateDigitsLength("NIT", normalizedNIT);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
  if ((cellphone && !normalizedCell) || (telephone && !normalizedTel)) {
    return res.status(400).json({
      message:
        "Teléfono/Celular inválido: use 8 dígitos locales o incluya prefijo '591'. Se guardará como '+591 ########'.",
    });
  }
  if (!isValidEmail(normalizedEmail)) {
    return res.status(400).json({ message: "Email inválido." });
  }

  // Validar categoría y pertenencia
  const category = await prisma.clientCategory.findUnique({
    where: { id: String(clientCategoryId) },
  });
  if (!category) {
    return res.status(404).json({ message: "Client category not found." });
  }
  if (
    String(category.tenantId) !== String(tenantId) ||
    String(category.subsidiaryId) !== String(subsidiaryId)
  ) {
    return res.status(400).json({
      message: "The Client Category does not belong to the specified Tenant/Subsidiary.",
    });
  }

  // Duplicado por unique (name, tenantId, subsidiaryId)
  const exists = await prisma.client.findFirst({
    where: {
      name: normalizedName,
      tenantId: String(tenantId),
      subsidiaryId: String(subsidiaryId),
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
      ci: normalizedCI,
      nit: normalizedNIT,
      description: normalizedDesc,
      address: normalizedAddr,
      cellphone: normalizedCell,
      telephone: normalizedTel,
      email: normalizedEmail,
      tenantId: String(tenantId),
      subsidiaryId: String(subsidiaryId),
      clientCategoryId: String(clientCategoryId),
      client_points: 0,
      // status: true // ya es default
    },
    include: { clientCategory: true },
  });

  res.status(201).json({
    message: "Client created successfully.",
    client: created,
  });
});

/* ──────────────────────────────────────────────────────────────────────────────
   Actualizar Client
──────────────────────────────────────────────────────────────────────────────── */

export const updateClient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    name,
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

  // Normalizaciones condicionadas
  const normalizedName = typeof name === "string" ? normalizeClientName(name) : undefined;
  const normalizedCI = typeof ci === "string" ? normalizeDigits(ci) : undefined;
  const normalizedNIT = typeof nit === "string" ? normalizeDigits(nit) : undefined;
  const normalizedDesc =
    typeof description === "string" ? normalizeLongText255(description) : undefined;
  const normalizedAddr =
    typeof address === "string" ? normalizeLongText255(address) : undefined;
  const normalizedCell =
    typeof cellphone === "string" ? normalizeBOPhone(cellphone) : undefined;
  const normalizedTel =
    typeof telephone === "string" ? normalizeBOPhone(telephone) : undefined;
  const normalizedEmail = typeof email === "string" ? normalizeEmail(email) : undefined;

  // Validaciones
  if (typeof name === "string") {
    if (!normalizedName || !isValidClientName(normalizedName)) {
      return res.status(400).json({
        message: "Nombre inválido: use SOLO letras y espacios (incluye Ñ).",
      });
    }
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
          message:
            "Another client with this name already exists for this tenant and subsidiary.",
        });
      }
    }
  }
  try {
    if (typeof ci === "string") validateDigitsLength("CI", normalizedCI ?? null);
    if (typeof nit === "string") validateDigitsLength("NIT", normalizedNIT ?? null);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
  if (typeof cellphone === "string" && cellphone && !normalizedCell) {
    return res.status(400).json({
      message:
        "Celular inválido: use 8 dígitos locales o incluya prefijo '591'. Se guardará como '+591 ########'.",
    });
  }
  if (typeof telephone === "string" && telephone && !normalizedTel) {
    return res.status(400).json({
      message:
        "Teléfono inválido: use 8 dígitos locales o incluya prefijo '591'. Se guardará como '+591 ########'.",
    });
  }
  if (typeof email === "string" && !isValidEmail(normalizedEmail ?? null)) {
    return res.status(400).json({ message: "Email inválido." });
  }

  // Cambio de categoría: validar pertenencia
  if (clientCategoryId && clientCategoryId !== existing.clientCategoryId) {
    const category = await prisma.clientCategory.findUnique({
      where: { id: String(clientCategoryId) },
    });
    if (!category) {
      return res.status(404).json({ message: "Client category not found." });
    }
    if (
      String(category.tenantId) !== String(existing.tenantId) ||
      String(category.subsidiaryId) !== String(existing.subsidiaryId)
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
      ci: normalizedCI ?? undefined,
      nit: normalizedNIT ?? undefined,
      description: normalizedDesc ?? undefined,
      address: normalizedAddr ?? undefined,
      cellphone: normalizedCell ?? undefined,
      telephone: normalizedTel ?? undefined,
      email: normalizedEmail ?? undefined,
      clientCategoryId: clientCategoryId ? String(clientCategoryId) : undefined,
    },
    include: { clientCategory: true },
  });

  res.json({
    message: "Client updated successfully.",
    client: updated,
  });
});

/* ──────────────────────────────────────────────────────────────────────────────
   Obtener Clients por Subsidiary (paginado + filtros + búsqueda)
   NOTA: Este método es para LISTADOS EN TABLA. Soporta:
   - búsqueda normalizada (MAYÚSCULAS/sin acentos/Ñ preservada) para name/desc/address,
   - búsqueda insensitive para ci/nit/email/cell/phone,
   - filtro por estado y categoría,
   - paginación (page/limit) y total/totalPages.
──────────────────────────────────────────────────────────────────────────────── */

export const getClientsBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;
    const { search, status, categoryId, page = "1", limit = "5" } = req.query;

    if (!subsidiaryId) {
      return res.status(400).json({ message: "subsidiaryId is required." });
    }

    const where: any = { subsidiaryId: String(subsidiaryId) };

    // 🔍 Búsqueda acentos/case-insensible en campos normalizados (NAME/DESCRIPTION/ADDRESS)
    //     y búsqueda 'insensitive' en campos no normalizados (CI/NIT/EMAIL/CELLPHONE/TELEPHONE).
    if (search && String(search).trim().length >= 3) {
      const rawTrim = String(search).trim();
      const normalizedSearch = upperNoAccentsPreserveEnye(String(search));

      const or: any[] = [
        // Campos normalizados a MAYÚSCULAS/sin acentos → usamos 'contains' directo
        { name: { contains: normalizedSearch } },
        { description: { contains: normalizedSearch } },
        { address: { contains: normalizedSearch } },

        // Campos no upper-normalizados: usar insensitive con el término crudo
        { ci: { contains: rawTrim, mode: "insensitive" } },
        { nit: { contains: rawTrim, mode: "insensitive" } },
        { email: { contains: rawTrim, mode: "insensitive" } },
        { cellphone: { contains: rawTrim, mode: "insensitive" } },
        { telephone: { contains: rawTrim, mode: "insensitive" } },
      ];

      // (Opcional) Relajar Ñ → N para capturar búsquedas sin tilde de Ñ
      const relaxedSearch = normalizedSearch.replace(/Ñ/g, "N");
      if (relaxedSearch !== normalizedSearch) {
        or.push({ name: { contains: relaxedSearch } });
        or.push({ description: { contains: relaxedSearch } });
        or.push({ address: { contains: relaxedSearch } });
      }

      where.OR = or;
    }

    // ✅ Filtro por estado
    if (status === "true" || status === "1") where.status = true;
    else if (status === "false" || status === "0") where.status = false;

    // ✅ Filtro por categoría
    if (categoryId && categoryId !== "all") {
      where.clientCategoryId = String(categoryId);
    }

    // 📄 Paginación
    const take = Math.max(parseInt(String(limit)) || 5, 5);
    const pageNum = Math.max(parseInt(String(page)) || 1, 1);
    const skip = (pageNum - 1) * take;

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
      page: pageNum,
      limit: take,
      totalPages: Math.ceil(total / take),
      clients,
    });
  }
);

/* ──────────────────────────────────────────────────────────────────────────────
   Obtener Client por ID (detalle)
──────────────────────────────────────────────────────────────────────────────── */

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

/* ──────────────────────────────────────────────────────────────────────────────
   Toggle Client status
──────────────────────────────────────────────────────────────────────────────── */

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
    message: `Client status changed to ${updated.status ? "active" : "inactive"}.`,
    client: updated,
  });
});

/* ──────────────────────────────────────────────────────────────────────────────
   Obtener solo Clients ACTIVOS por Subsidiary (para SELECTs)
   NOTA: Este método es liviano y pensado para combos, por eso solo devuelve
   un subconjunto de campos y NO pagina ni filtra por búsqueda.
──────────────────────────────────────────────────────────────────────────────── */

export const getActiveClientsBySubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;

    if (!subsidiaryId) {
      return res.status(400).json({ message: "subsidiaryId is required." });
    }

    const activeClients = await prisma.client.findMany({
      where: { subsidiaryId: String(subsidiaryId), status: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
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

/* ──────────────────────────────────────────────────────────────────────────────
   Obtener Clients por Subsidiary (ACTIVOS) con filtros y paginación
   ⚠️ DIFERENCIA VS getActiveClientsBySubsidiary:
      - ESTE método SÍ pagina y soporta búsqueda/filtro de categoría/estado.
      - getActiveClientsBySubsidiary es para SELECTs (rápido, sin paginar).
──────────────────────────────────────────────────────────────────────────────── */

export const getActiveClientsBySubsidiaryWithFilters = asyncHandler(
  async (req: Request, res: Response) => {
    const { subsidiaryId } = req.params;
    const { search, categoryId, status = "true", page = "1", limit = "5" } = req.query;

    if (!subsidiaryId) {
      return res.status(400).json({ message: "subsidiaryId is required." });
    }

    const where: any = { subsidiaryId: String(subsidiaryId) };

    if (status === "true" || status === "1") where.status = true;
    else if (status === "false" || status === "0") where.status = false;

    if (search && String(search).trim().length >= 3) {
      const normalizedSearch = upperNoAccentsPreserveEnye(String(search));
      where.OR = [
        { name: { contains: normalizedSearch } },
        { description: { contains: normalizedSearch } },
        { address: { contains: normalizedSearch } },
        { ci: { contains: String(search).trim(), mode: "insensitive" } },
        { nit: { contains: String(search).trim(), mode: "insensitive" } },
        { email: { contains: String(search).trim(), mode: "insensitive" } },
        { cellphone: { contains: String(search).trim(), mode: "insensitive" } },
        { telephone: { contains: String(search).trim(), mode: "insensitive" } },
      ];
    }

    if (categoryId && categoryId !== "all") {
      where.clientCategoryId = String(categoryId);
    }

    const take = Math.max(parseInt(String(limit)) || 5, 5);
    const pageNum = Math.max(parseInt(String(page)) || 1, 1);
    const skip = (pageNum - 1) * take;

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
      page: pageNum,
      limit: take,
      totalPages: Math.ceil(total / take),
      clients,
    });
  }
);