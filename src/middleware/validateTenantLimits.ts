// src/middlewares/validateTenantLimits.ts

import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";

// ✅ Middleware genérico: valida límite según tipo de entidad
export const validateTenantLimit = (entity: "subsidiary" | "user" | "role") =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let tenantId: string;

    // Cada entidad puede venir con tenantId diferente
    switch (entity) {
      case "subsidiary":
        tenantId = req.body.tenantId;
        break;
      case "user":
        tenantId = req.body.tenantId;
        break;
      case "role":
        tenantId = req.body.tenantId;
        break;
      default:
        return res.status(400).json({ message: "Invalid entity type" });
    }

    if (!tenantId) {
      return res.status(400).json({ message: "tenantId is required" });
    }

    // Traer Tenant
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Contar entidades actuales
    let currentCount = 0;
    let maxAllowed = 0;

    if (entity === "subsidiary") {
      currentCount = await prisma.subsidiary.count({ where: { tenantId } });
      maxAllowed = tenant.maxSubsidiaries;
    } else if (entity === "user") {
      currentCount = await prisma.user.count({ where: { tenantId } });
      maxAllowed = tenant.maxUsers;
    } else if (entity === "role") {
      currentCount = await prisma.role.count({ where: { tenantId } });
      maxAllowed = tenant.maxRoles;
    }

    if (currentCount >= maxAllowed) {
      return res.status(400).json({
        message: `Cannot create new ${entity}. Limit reached: ${maxAllowed}`,
      });
    }

    next();
  });
