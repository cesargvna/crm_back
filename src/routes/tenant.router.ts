import express from "express";
const tenantRouter = express.Router();

import { validate } from "../middleware/validate.middleware";
import { validateParams } from "../middleware/validateParams.middleware";
import { validateQuery } from "../middleware/validateQuery.middleware";
import {
  tenantSchema,
  toggleTenantStatusSchema,
  getAllTenantsQuerySchema,
} from "../validators/tenant.validator";

import {
  createTenant,
  getTenantById,
  updateTenant,
  getAllTenants,
  toggleTenantStatus,
} from "../controllers/tenant.controller";

import { authenticate } from "../middleware/auth.middleware";
import { getMyTenant } from "../controllers/tenant.controller";

// 👇 Solo System_Admin podrá acceder a estas rutas
tenantRouter.get("/", authenticate, validateQuery(getAllTenantsQuerySchema), getAllTenants);
tenantRouter.post("/", authenticate, validate(tenantSchema), createTenant);
tenantRouter.get("/:id", authenticate, getTenantById);
tenantRouter.put("/:id", authenticate, validate(tenantSchema), updateTenant);
tenantRouter.patch("/:id/toggle", authenticate, validateParams(toggleTenantStatusSchema), toggleTenantStatus);

// 🔹 Ruta para usuarios normales: ver su propio tenant
tenantRouter.get("/my-tenant", authenticate, getMyTenant);

export default tenantRouter;