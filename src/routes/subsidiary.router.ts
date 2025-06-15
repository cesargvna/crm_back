// ✅ subsidiary.router.ts
import express from "express";
import { validate } from "../middleware/validate.middleware";
import { createSubsidiarySchema, getAllSubsidiariesQuerySchema, toggleSubsidiaryStatusSchema, updateSubsidiarySchema } from "../validators/subsidiary.validator";
import { createSubsidiary, getAllSubsidiariesByTenantId, getSubsidiaryById, toggleSubsidiaryStatus, updateSubsidiary } from "../controllers/subsidiary.controller";
import { validateQuery } from "../middleware/validateQuery.middleware";
import { createScheduleSubsidiarySchema, toggleScheduleStatusSchema, updateScheduleSubsidiarySchema } from "../validators/scheduleSubsidiary.validator";
import { createScheduleSubsidiary, deleteScheduleSubsidiary, getSchedulesBySubsidiary, toggleScheduleStatus, updateScheduleSubsidiary } from "../controllers/scheduleSubsidiary.controller";


const subsidiaryRouter = express.Router();

subsidiaryRouter.post("/", validate(createSubsidiarySchema), createSubsidiary);
subsidiaryRouter.put("/:id", validate(updateSubsidiarySchema), updateSubsidiary);
subsidiaryRouter.patch("/:id/status", validate(toggleSubsidiaryStatusSchema), toggleSubsidiaryStatus);
subsidiaryRouter.get("/tenantid/:tenantId",validateQuery(getAllSubsidiariesQuerySchema),getAllSubsidiariesByTenantId);
subsidiaryRouter.get("/:id", getSubsidiaryById);

subsidiaryRouter.post("/:subsidiaryId/schedules", validate(createScheduleSubsidiarySchema), createScheduleSubsidiary);
subsidiaryRouter.get("/:subsidiaryId/schedules", getSchedulesBySubsidiary);
subsidiaryRouter.put("/schedules/:id", validate(updateScheduleSubsidiarySchema), updateScheduleSubsidiary);
subsidiaryRouter.patch("/schedules/:id/status", validate(toggleScheduleStatusSchema), toggleScheduleStatus);
subsidiaryRouter.delete("/schedules/:id", deleteScheduleSubsidiary);

export default subsidiaryRouter;