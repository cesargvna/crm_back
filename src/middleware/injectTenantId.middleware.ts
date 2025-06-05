import { asyncHandler } from "../utils/asyncHandler";
import { RequestHandler } from "express";

export const injectTenantId: RequestHandler = asyncHandler(async (req, res, next) => {
  const method = req.method.toUpperCase();

  if (["POST", "PUT", "PATCH"].includes(method)) {
    // ✅ Si es System.admin (case-insensitive), no se inyecta tenantId
    if (req.user?.roleId?.toLowerCase() === "system.admin") {
      return next();
    }

    // ✅ Usuarios normales deben tener tenantId
    if (req.user?.tenantId) {
      if (!req.body.tenantId) {
        req.body.tenantId = req.user.tenantId;
      }
    } else {
      return res.status(401).json({ message: "Unauthorized: tenantId not found in user context" });
    }
  }

  next();
});
