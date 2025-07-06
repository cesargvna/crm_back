// src/middlewares/validateTenantLimits.ts

import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";

// ✅ Middleware genérico con control por subsidiaria para role y user

export const validateTenantLimit = (entity: "subsidiary" | "user" | "role") =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.body.tenantId;

    if (!tenantId) {
      return res.status(400).json({ message: "tenantId is required" });
    }

    if (entity === "subsidiary") {
      // ➜ Valida global para subsidiaries
      const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      const currentCount = await prisma.subsidiary.count({ where: { tenantId } });
      if (currentCount >= tenant.maxSubsidiaries) {
        return res.status(400).json({
          message: `Cannot create new subsidiary. Limit reached: ${tenant.maxSubsidiaries}`,
        });
      }

    } else if (entity === "role" || entity === "user") {
      const subsidiaryId = req.body.subsidiaryId;
      if (!subsidiaryId) {
        return res.status(400).json({ message: "subsidiaryId is required" });
      }

      const subsidiary = await prisma.subsidiary.findUnique({
        where: { id: subsidiaryId },
      });

      if (!subsidiary) {
        return res.status(404).json({ message: "Subsidiary not found" });
      }

      if (subsidiary.tenantId !== tenantId) {
        return res.status(400).json({
          message: "Subsidiary does not belong to the specified tenant.",
        });
      }

      // Contar roles o usuarios de esa subsidiaria
      const currentCount =
        entity === "role"
          ? await prisma.role.count({ where: { subsidiaryId } })
          : await prisma.user.count({ where: { subsidiaryId } });

      const maxAllowed =
        entity === "role" ? subsidiary.maxRoles : subsidiary.maxUsers;

      if (currentCount >= maxAllowed) {
        return res.status(400).json({
          message: `Cannot create new ${entity}. Subsidiary limit reached: ${maxAllowed}`,
        });
      }
    }

    // ✅ Todo OK
    next();
  });
