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

scheduleUserRouter.post("/", validate(scheduleUserSchema), createScheduleUser);
scheduleUserRouter.get("/", getAllSchedules);
scheduleUserRouter.get("/user/:userId", getSchedulesByUserId);
scheduleUserRouter.put(
  "/:id",
  validate(updateScheduleUserSchema),
  updateScheduleUser
);
scheduleUserRouter.patch(
  "/:id/toggle",
  validateParams(toggleScheduleStatusSchema),
  toggleScheduleUserStatus
);

export default scheduleUserRouter;
