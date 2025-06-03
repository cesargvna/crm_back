// ✅ scheduleUser.router.ts
import express from "express";
const scheduleUserRouter = express.Router();

import {
  createScheduleUser,
  getSchedulesByUserId,
  updateScheduleUser,
  toggleScheduleUserStatus,
  getAllSchedules,
} from "../controllers/scheduleUser.controller";

import { validate } from "../middleware/validate.middleware";
import { validateParams } from "../middleware/validateParams.middleware";
import {
  scheduleUserSchema,
  updateScheduleUserSchema,
  toggleScheduleStatusSchema,
} from "../validators/scheduleUser.validator";

import { authenticate } from "../middleware/auth.middleware";
import { injectTenantId } from "../middleware/injectTenantId.middleware";

scheduleUserRouter.post("/", authenticate, injectTenantId, validate(scheduleUserSchema), createScheduleUser);
scheduleUserRouter.put("/:id", authenticate, injectTenantId, validate(updateScheduleUserSchema), updateScheduleUser);

scheduleUserRouter.get("/", authenticate, getAllSchedules);
scheduleUserRouter.get("/user/:userId", authenticate, getSchedulesByUserId);
scheduleUserRouter.patch("/:id/toggle", authenticate, validateParams(toggleScheduleStatusSchema), toggleScheduleUserStatus);

export default scheduleUserRouter;
