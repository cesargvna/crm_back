// ✅ subsidiary.router.ts
import express from "express";
const subsidiaryRouter = express.Router();

import {
  createSubsidiary,
  getAllSubsidiaries,
  getSubsidiaryById,
  updateSubsidiary,
  toggleSubsidiaryStatus
} from "../controllers/subsidiary.controller";

import { validate } from "../middleware/validate.middleware";
import { validateParams } from "../middleware/validateParams.middleware";
import {
  subsidiarySchema,
  toggleSubsidiaryStatusSchema,
  getAllSubsidiariesQuerySchema
} from "../validators/subsidiary.validator";

import { authenticate } from "../middleware/auth.middleware";
import { injectTenantId } from "../middleware/injectTenantId.middleware";

subsidiaryRouter.post("/", authenticate, injectTenantId, validate(subsidiarySchema), createSubsidiary);
subsidiaryRouter.put("/:id", authenticate, injectTenantId, validate(subsidiarySchema), updateSubsidiary);

subsidiaryRouter.get("/", authenticate, validate(getAllSubsidiariesQuerySchema), getAllSubsidiaries);
subsidiaryRouter.get("/:id", authenticate, getSubsidiaryById);
subsidiaryRouter.patch("/:id/toggle", authenticate, validateParams(toggleSubsidiaryStatusSchema), toggleSubsidiaryStatus);

export default subsidiaryRouter;