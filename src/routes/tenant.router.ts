import express from "express";
import { validate } from "../middleware/validate.middleware";
import { validateParams } from "../middleware/validateParams.middleware";
import { validateQuery } from "../middleware/validateQuery.middleware";
import { createTenantSchema, getAllTenantsQuerySchema, toggleTenantStatusSchema, updateTenantSchema } from "../validators/tenant.validator";
import { createTenant, deleteTenant, getAllTenants, getTenantById, toggleTenantStatus, updateTenant } from "../controllers/tenant.controller";

const tenantRouter = express.Router();

// ✅ TENANT ROUTES
tenantRouter.post('/', validate(createTenantSchema), createTenant);
tenantRouter.put('/:id', validate(updateTenantSchema), updateTenant);
tenantRouter.patch('/:id/status', validate(toggleTenantStatusSchema), toggleTenantStatus);
tenantRouter.delete('/:id', deleteTenant);
tenantRouter.get('/', validateQuery(getAllTenantsQuerySchema), getAllTenants);
tenantRouter.get('/:id', getTenantById);

export default tenantRouter;
