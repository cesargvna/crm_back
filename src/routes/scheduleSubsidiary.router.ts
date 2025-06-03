// ✅ scheduleSubsidiary.router.ts
import express from "express";
const scheduleSubsidiaryRouter = express.Router();

import {
  createScheduleSubsidiary,
  getAllScheduleSubsidiaries,
  getSchedulesBySubsidiaryId,
  updateScheduleSubsidiary,
  toggleScheduleSubsidiaryStatus,
} from "../controllers/scheduleSubsidiary.controller";

import { validate } from "../middleware/validate.middleware";
import { validateParams } from "../middleware/validateParams.middleware";
import {
  scheduleSubsidiarySchema,
  updateScheduleSubsidiarySchema,
  toggleScheduleSubsidiaryStatusSchema,
} from "../validators/scheduleSubsidiary.validator";

import { authenticate } from "../middleware/auth.middleware";
import { injectTenantId } from "../middleware/injectTenantId.middleware";

scheduleSubsidiaryRouter.post("/", authenticate, injectTenantId, validate(scheduleSubsidiarySchema), createScheduleSubsidiary);
scheduleSubsidiaryRouter.put("/:id", authenticate, injectTenantId, validate(updateScheduleSubsidiarySchema), updateScheduleSubsidiary);

scheduleSubsidiaryRouter.get("/", authenticate, getAllScheduleSubsidiaries);
scheduleSubsidiaryRouter.get("/subsidiary/:subsidiaryId", authenticate, getSchedulesBySubsidiaryId);
scheduleSubsidiaryRouter.patch("/:id/toggle", authenticate, validateParams(toggleScheduleSubsidiaryStatusSchema), toggleScheduleSubsidiaryStatus);

export default scheduleSubsidiaryRouter;
