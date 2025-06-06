import express from "express";
const tenantRouter = express.Router();
import { validate } from "../middleware/validate.middleware";
import { validateParams } from "../middleware/validateParams.middleware";
import { validateQuery } from "../middleware/validateQuery.middleware";
import { tenantSchema, toggleTenantStatusSchema, getAllTenantsQuerySchema } from "../validators/tenant.validator";
import { createTenant, getTenantById, updateTenant, getAllTenants, toggleTenantStatus } from "../controllers/tenant.controller";


tenantRouter.get("/", validateQuery(getAllTenantsQuerySchema), getAllTenants);
tenantRouter.post("/", validate(tenantSchema), createTenant);
tenantRouter.get("/:id", getTenantById);
tenantRouter.put("/:id", validate(tenantSchema), updateTenant);
tenantRouter.patch("/:id/toggle", validateParams(toggleTenantStatusSchema), toggleTenantStatus);

export default tenantRouter;
