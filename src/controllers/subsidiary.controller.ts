import { Request, Response } from "express";
import prisma from "../utils/prisma";
import normalize from "normalize-text";
import { asyncHandler } from "../utils/asyncHandler";

// ✔ Subsidiary name (permite ñ, mayúsculas, espacios limpios)
export function normalizeSubsidiaryName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/\s+/g, " ")            
    .trim();
}

// ✔ Para opcionales (ci, nit, descripción, address, etc)
export function optionalNormalize(value?: string): string | undefined {
  if (!value) return undefined;
  return value.trim().replace(/\s+/g, " ");
}

// ✔ Validador de email válido
export function isValidEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

// ✔ Validador de teléfono celular internacional
export function isValidPhoneNumber(value: string): boolean {
  const phoneRegex = /^\+\d{6,20}$/;
  return phoneRegex.test(value);
}

// ✔ Normalizador de nombres de personas (opcional, para users)
export function normalizeNameSpaces(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/[^a-zA-ZñÑ\s]/g, "")   
    .replace(/\s+/g, " ")            
    .trim();
}

export const createSubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      tenantId,
      name,
      subsidiary_type,
      maxUsers = 3,
      maxRoles = 3,
      allowNegativeStock = false,
      ci,
      nit,
      description,
      address,
      city,
      country,
      cellphone,
      telephone,
      email,
    } = req.body;

    // ✅ Validar Tenant y límites de roles/users
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // ✅ Normalizar nombre
    const normalizedName = normalizeSubsidiaryName(name);

    // ✅ Verificar unicidad dentro del tenant
    const exists = await prisma.subsidiary.findFirst({
      where: {
        tenantId,
        name: { equals: normalizedName, mode: "insensitive" },
      },
    });
    if (exists) {
      return res.status(409).json({
        message: `Subsidiary "${name}" already exists in this tenant.`,
      });
    }

    // ✅ Validar maxUsers/maxRoles ≤ tenant limits
    if (maxUsers > tenant.maxUsers) {
      return res.status(400).json({
        message: `Cannot set maxUsers to ${maxUsers}. Tenant limit is ${tenant.maxUsers}.`,
      });
    }

    if (maxRoles > tenant.maxRoles) {
      return res.status(400).json({
        message: `Cannot set maxRoles to ${maxRoles}. Tenant limit is ${tenant.maxRoles}.`,
      });
    }

    // ✅ Validar formatos de teléfono/email
    if (cellphone && !isValidPhoneNumber(cellphone)) {
      return res.status(400).json({ message: "Invalid cellphone format." });
    }

    if (telephone && !isValidPhoneNumber(telephone)) {
      return res.status(400).json({ message: "Invalid telephone format." });
    }

    if (email && !isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // ✅ Crear Subsidiary
    const created = await prisma.subsidiary.create({
      data: {
        tenantId,
        name: normalizedName,
        subsidiary_type,
        maxUsers,
        maxRoles,
        allowNegativeStock,
        ci: optionalNormalize(ci),
        nit: optionalNormalize(nit),
        description: optionalNormalize(description),
        address: optionalNormalize(address),
        city: optionalNormalize(city),
        country: optionalNormalize(country),
        cellphone: optionalNormalize(cellphone),
        telephone: optionalNormalize(telephone),
        email: optionalNormalize(email),
      },
    });

    res.status(201).json(created);
  }
);

export const updateSubsidiary = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      name,
      subsidiary_type,
      maxUsers,
      maxRoles,
      allowNegativeStock,
      ci,
      nit,
      description,
      address,
      city,
      country,
      cellphone,
      telephone,
      email,
    } = req.body;

    // ✅ Subsidiary actual
    const subsidiary = await prisma.subsidiary.findUnique({
      where: { id },
    });
    if (!subsidiary) {
      return res.status(404).json({ message: "Subsidiary not found" });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: subsidiary.tenantId },
    });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // ✅ Normalizar nombre
    const normalizedName = normalizeSubsidiaryName(name);

    // ✅ Verificar unicidad dentro del tenant
    const exists = await prisma.subsidiary.findFirst({
      where: {
        id: { not: id },
        tenantId: subsidiary.tenantId,
        name: { equals: normalizedName, mode: "insensitive" },
      },
    });
    if (exists) {
      return res.status(409).json({
        message: `Subsidiary "${name}" already exists in this tenant.`,
      });
    }

    // ✅ Contar entidades actuales
    const [currentUsers, currentRoles] = await Promise.all([
      prisma.user.count({ where: { subsidiaryId: id } }),
      prisma.role.count({ where: { subsidiaryId: id } }),
    ]);

    // ✅ Validar que no se baje por debajo de los actuales
    if (maxUsers < currentUsers) {
      return res.status(400).json({
        message: `Cannot set maxUsers to ${maxUsers} because there are already ${currentUsers} users in this Subsidiary.`,
      });
    }

    if (maxRoles < currentRoles) {
      return res.status(400).json({
        message: `Cannot set maxRoles to ${maxRoles} because there are already ${currentRoles} roles in this Subsidiary.`,
      });
    }

    // ✅ Validar que no exceda los límites del Tenant
    if (maxUsers > tenant.maxUsers) {
      return res.status(400).json({
        message: `Cannot set maxUsers to ${maxUsers}. Tenant limit is ${tenant.maxUsers}.`,
      });
    }

    if (maxRoles > tenant.maxRoles) {
      return res.status(400).json({
        message: `Cannot set maxRoles to ${maxRoles}. Tenant limit is ${tenant.maxRoles}.`,
      });
    }

    // ✅ Validar teléfono/email
    if (cellphone && !isValidPhoneNumber(cellphone)) {
      return res.status(400).json({ message: "Invalid cellphone format." });
    }

    if (telephone && !isValidPhoneNumber(telephone)) {
      return res.status(400).json({ message: "Invalid telephone format." });
    }

    if (email && !isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // ✅ Actualizar Subsidiary
    const updated = await prisma.subsidiary.update({
      where: { id },
      data: {
        name: normalizedName,
        subsidiary_type,
        maxUsers,
        maxRoles,
        allowNegativeStock,
        ci: optionalNormalize(ci),
        nit: optionalNormalize(nit),
        description: optionalNormalize(description),
        address: optionalNormalize(address),
        city: optionalNormalize(city),
        country: optionalNormalize(country),
        cellphone: optionalNormalize(cellphone),
        telephone: optionalNormalize(telephone),
        email: optionalNormalize(email),
      },
    });

    res.json(updated);
  }
);

export const toggleSubsidiaryStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // ✅ Buscar la subsidiary
    const subsidiary = await prisma.subsidiary.findUnique({ where: { id } });
    if (!subsidiary) {
      return res.status(404).json({ message: "Subsidiary not found" });
    }

    const newStatus = !subsidiary.status;

    // ✅ Actualizar estado de la subsidiary
    const updatedSubsidiary = await prisma.subsidiary.update({
      where: { id },
      data: { status: newStatus },
    });

    // ✅ Actualizar estado de usuarios y roles relacionados
    await Promise.all([
      prisma.user.updateMany({
        where: { subsidiaryId: id },
        data: { status: newStatus },
      }),
      prisma.role.updateMany({
        where: { subsidiaryId: id },
        data: { status: newStatus },
      }),
    ]);

    // ✅ Respuesta clara
    res.json({
      message: `Subsidiary status updated to ${newStatus ? "active" : "inactive"}`,
      updated: {
        subsidiaryStatus: newStatus,
        affectedEntities: {
          users: `All users under subsidiary set to ${newStatus}`,
          roles: `All roles under subsidiary set to ${newStatus}`,
        },
      },
      subsidiary: updatedSubsidiary,
    });
  }
);

export const getAllSubsidiariesByTenantId = asyncHandler(
  async (req: Request, res: Response) => {
    const { tenantId } = req.params;
    const {
      page = "1",
      limit = "5",
      search = "",
      status = "all",
      orderBy = "name",
      sort = "asc",
      type,
    } = req.query;

    if (!tenantId) {
      return res.status(400).json({ message: "tenantId is required" });
    }

    // 🔒 Verificar existencia del tenant (opcional pero recomendado)
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found." });
    }

    const take = Math.min(parseInt(limit as string), 1000);
    const skip = (parseInt(page as string) - 1) * take;

    // ✅ Construir filtros dinámicos
    const filters: any = { tenantId };

    if (search) {
      filters.OR = [
        {
          name: {
            contains: normalize(search.toString().trim()),
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: normalize(search.toString().trim()),
            mode: "insensitive",
          },
        },
      ];
    }

    if (status === "true" || status === "false") {
      filters.status = status === "true";
    }

    if (
      type &&
      type !== "all" &&
      ["MATRIZ", "SUCURSAL", "ALMACEN", "OFICINA"].includes(type as string)
    ) {
      filters.subsidiary_type = type;
    }

    // 🔒 Validar orderBy y sort
    const allowedOrderFields = ["name", "created_at", "updated_at"];
    const safeOrderBy = allowedOrderFields.includes(orderBy as string)
      ? (orderBy as string)
      : "name";

    const safeSort = sort === "desc" ? "desc" : "asc";

    // ✅ Consulta principal
    const [data, total] = await Promise.all([
      prisma.subsidiary.findMany({
        where: filters,
        orderBy: { [safeOrderBy]: safeSort },
        skip,
        take,
        include: {
          schedulesSubsidiaries: {
            orderBy: { start_day: "asc" },
            select: {
              id: true,
              start_day: true,
              end_day: true,
              opening_hour: true,
              closing_hour: true,
              status: true,
            },
          },
        },
      }),
      prisma.subsidiary.count({ where: filters }),
    ]);

    res.json({
      total,
      page: Number(page),
      limit: take,
      totalPages: Math.ceil(total / take),
      data,
    });
  }
);

export const getSubsidiaryById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // ✅ Buscar Subsidiary con relaciones
    const subsidiary = await prisma.subsidiary.findUnique({
      where: { id },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        users: {
          select: {
            id: true,
            username: true,
            name: true,
            lastname: true,
            status: true,
            email: true,
            cellphone: true,
            role: {
              select: {
                id: true,
                name: true,
                description: true,
                status: true,
              },
            },
          },
          orderBy: { created_at: "desc" },
        },
        schedulesSubsidiaries: {
          select: {
            id: true,
            start_day: true,
            end_day: true,
            opening_hour: true,
            closing_hour: true,
            status: true,
          },
          orderBy: { start_day: "asc" },
        },
      },
    });

    if (!subsidiary) {
      return res.status(404).json({ message: "Subsidiary not found." });
    }

    res.json({ subsidiary });
  }
);