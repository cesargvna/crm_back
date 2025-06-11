// ✅ subsidiary.router.ts
import express from "express";
import { validate } from "../middleware/validate.middleware";
import { createSubsidiarySchema, getAllSubsidiariesQuerySchema, toggleSubsidiaryStatusSchema, updateSubsidiarySchema } from "../validators/subsidiary.validator";
import { createSubsidiary, deleteSubsidiary, getAllSubsidiariesByTenantId, getSubsidiaryById, toggleSubsidiaryStatus, updateSubsidiary } from "../controllers/subsidiary.controller";
import { validateQuery } from "../middleware/validateQuery.middleware";


const subsidiaryRouter = express.Router();

subsidiaryRouter.post("/", validate(createSubsidiarySchema), createSubsidiary);
subsidiaryRouter.put("/:id", validate(updateSubsidiarySchema), updateSubsidiary);
subsidiaryRouter.patch("/:id/status", validate(toggleSubsidiaryStatusSchema), toggleSubsidiaryStatus);
subsidiaryRouter.delete("/:id", deleteSubsidiary);
subsidiaryRouter.get("/tenantid/:tenantId",validateQuery(getAllSubsidiariesQuerySchema),getAllSubsidiariesByTenantId);
subsidiaryRouter.get("/:id", getSubsidiaryById);

export default subsidiaryRouter;