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

scheduleSubsidiaryRouter.post(
  "/",
  validate(scheduleSubsidiarySchema),
  createScheduleSubsidiary
);
scheduleSubsidiaryRouter.get("/", getAllScheduleSubsidiaries);
scheduleSubsidiaryRouter.get(
  "/subsidiary/:subsidiaryId",
  getSchedulesBySubsidiaryId
);
scheduleSubsidiaryRouter.put(
  "/:id",
  validate(updateScheduleSubsidiarySchema),
  updateScheduleSubsidiary
);
scheduleSubsidiaryRouter.patch(
  "/:id/toggle",
  validateParams(toggleScheduleSubsidiaryStatusSchema),
  toggleScheduleSubsidiaryStatus
);

export default scheduleSubsidiaryRouter;
