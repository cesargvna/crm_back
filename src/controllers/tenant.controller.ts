import { Request, Response } from "express";
import prisma from "../utils/prisma";
import normalize from "normalize-text";
import { asyncHandler } from "../utils/asyncHandler";

function normalizeTenantName(name: string): string {
  return name
    .trim() // Quitar espacios al inicio/final
    .replace(/\s+/g, " ") // Reducir múltiples espacios a uno
    .replace(/ñ/g, "n") // Reemplazar ñ por n
    .replace(/[^a-zA-Z0-9.,\- ]/g, "") // Solo letras, números, puntos, comas, guiones y espacios
    .toLowerCase(); // Opcional: mantener consistente en minúsculas
}

function normalizeTenantDescription(description?: string): string | undefined {
  if (!description) return undefined;
  return description.trim().replace(/\s+/g, " ").replace(/ñ/g, "n");
}

export const createTenant = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      description,
      maxSubsidiaries = 1,
      maxRoles = 3,
      maxUsers = 3,
    } = req.body;

    const normalizedName = normalizeTenantName(name);
    const normalizedDescription = normalizeTenantDescription(description);

    const exists = await prisma.tenant.findFirst({
      where: {
        name: { equals: normalizedName, mode: "insensitive" },
      },
    });

    if (exists) {
      return res.status(409).json({
        message: `Tenant "${name}" already exists.`,
      });
    }

    const created = await prisma.tenant.create({
      data: {
        name: normalizedName,
        description: normalizedDescription,
        maxSubsidiaries,
        maxRoles,
        maxUsers,
      },
    });

    res.status(201).json(created);
  }
);

export const updateTenant = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, maxSubsidiaries, maxRoles, maxUsers } = req.body;

    const normalizedName = normalizeTenantName(name);
    const normalizedDescription = normalizeTenantDescription(description);

    const existing = await prisma.tenant.findFirst({
      where: {
        id: { not: id },
        name: { equals: normalizedName, mode: "insensitive" },
      },
    });

    if (existing) {
      return res.status(409).json({
        message: `Tenant "${name}" already exists.`,
      });
    }

    // Control de límites
    const [currentSubsidiaries, currentRoles, currentUsers] = await Promise.all(
      [
        prisma.subsidiary.count({ where: { tenantId: id } }),
        prisma.role.count({ where: { tenantId: id } }),
        prisma.user.count({ where: { tenantId: id } }),
      ]
    );

    if (maxSubsidiaries < currentSubsidiaries) {
      return res.status(400).json({
        message: `Cannot set maxSubsidiaries to ${maxSubsidiaries} because there are already ${currentSubsidiaries} subsidiaries.`,
      });
    }

    if (maxRoles < currentRoles) {
      return res.status(400).json({
        message: `Cannot set maxRoles to ${maxRoles} because there are already ${currentRoles} roles.`,
      });
    }

    if (maxUsers < currentUsers) {
      return res.status(400).json({
        message: `Cannot set maxUsers to ${maxUsers} because there are already ${currentUsers} users.`,
      });
    }

    const updated = await prisma.tenant.update({
      where: { id },
      data: {
        name: normalizedName,
        description: normalizedDescription,
        maxSubsidiaries,
        maxRoles,
        maxUsers,
      },
    });

    res.json(updated);
  }
);

export const toggleTenantStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    const newStatus = !tenant.status;

    // Actualiza el estado del tenant
    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: { status: newStatus },
    });

    // Actualiza el estado de users, subsidiaries y roles directos
    await Promise.all([
      prisma.user.updateMany({
        where: { tenantId: id },
        data: { status: newStatus },
      }),
      prisma.subsidiary.updateMany({
        where: { tenantId: id },
        data: { status: newStatus },
      }),
      prisma.role.updateMany({
        where: { tenantId: id },
        data: { status: newStatus },
      }),
    ]);

    // Si tus users/roles dependen de cada subsidiary, actualiza también:
    const subsidiaries = await prisma.subsidiary.findMany({
      where: { tenantId: id },
      select: { id: true },
    });

    await Promise.all(
      subsidiaries.map((subsidiary) =>
        Promise.all([
          prisma.user.updateMany({
            where: { subsidiaryId: subsidiary.id },
            data: { status: newStatus },
          }),
          prisma.role.updateMany({
            where: { subsidiaryId: subsidiary.id },
            data: { status: newStatus },
          }),
        ])
      )
    );

    res.json({
      message: `Tenant status updated to ${newStatus ? "active" : "inactive"}`,
      updated: {
        tenantStatus: newStatus,
        affectedEntities: {
          users: `All users under tenant and subsidiaries set to ${newStatus}`,
          subsidiaries: `All subsidiaries under tenant set to ${newStatus}`,
          roles: `All roles under tenant and subsidiaries set to ${newStatus}`,
        },
      },
      tenant: updatedTenant,
    });
  }
);

export const getAllTenants = asyncHandler(
  async (req: Request, res: Response) => {
    let { page = "1", limit = "5", search = "", status = "all" } = req.query;

    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    // Construir filtros dinámicos
    const whereClause: any = {};

    if (search) {
      whereClause.name = {
        contains: search.toString().trim(),
        mode: "insensitive",
      };
    }

    if (status !== "all") {
      whereClause.status = status === "true";
    }

    // Obtener total de registros y paginados
    const [total, tenants] = await Promise.all([
      prisma.tenant.count({ where: whereClause }),
      prisma.tenant.findMany({
        where: whereClause,
        skip,
        take: limitNumber,
        orderBy: { created_at: "desc" },
      }),
    ]);

    res.json({
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
      tenants,
    });
  }
);

export const getTenantById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        subsidiaries: {
          select: {
            id: true,
            name: true,
            status: true,
            subsidiary_type: true,
            maxUsers: true,
            maxRoles: true,
            allowNegativeStock: true,
            ci: true,
            nit: true,
            description: true,
            address: true,
            city: true,
            country: true,
            cellphone: true,
            telephone: true,
            email: true,
            created_at: true,
            updated_at: true,
            users: {
              select: {
                id: true,
                status: true,
                username: true,
                name: true,
                lastname: true,
                ci: true,
                nit: true,
                description: true,
                address: true,
                cellphone: true,
                telephone: true,
                email: true,
                created_at: true,
                updated_at: true,
                role: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    status: true,
                    created_at: true,
                    updated_at: true,
                  },
                },
              },
              orderBy: { created_at: "desc" },
            },
            schedulesSubsidiaries: {
              select: {
                id: true,
                status: true,
                start_day: true,
                end_day: true,
                opening_hour: true,
                closing_hour: true,
                created_at: true,
                updated_at: true,
              },
              orderBy: { created_at: "desc" },
            },
          },
          orderBy: { created_at: "desc" },
        },
        // Si algún día tienes `roles` directos en Tenant, inclúyelos aquí:
        // roles: true,
      },
    });

    if (!tenant) {
      return res.status(404).json({
        message: `Tenant with id ${id} not found.`,
      });
    }

    res.json({
      tenant,
    });
  }
);