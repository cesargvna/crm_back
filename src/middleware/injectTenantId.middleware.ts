import { asyncHandler } from "../utils/asyncHandler";
import { RequestHandler } from "express";

export const injectTenantId: RequestHandler = asyncHandler(async (req, res, next) => {
  const method = req.method.toUpperCase();

  if (["POST", "PUT", "PATCH"].includes(method)) {
    if (req.user && req.user.tenantId) {
      if (!req.body.tenantId) {
        req.body.tenantId = req.user.tenantId;
      }
    } else {
      return res.status(401).json({ message: "Unauthorized: tenantId not found in user context" });
    }
  }

  next();
});
