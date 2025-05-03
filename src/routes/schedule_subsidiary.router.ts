import express from "express";
const scheduleSubsidiaryRouter = express.Router();
import { validate } from "../middleware/validate.middleware";
import { scheduleSubsidiarySchema } from "../validators/schedule_subsidiary.validator";
import { 
  createScheduleSubsidiary, 
  getScheduleSubsidiaryById, 
  updateScheduleSubsidiary, 
  getAllScheduleSubsidiaries 
} from "../controllers/schedule_subsidiary.controller";

scheduleSubsidiaryRouter.get("/", getAllScheduleSubsidiaries);
scheduleSubsidiaryRouter.post("/", validate(scheduleSubsidiarySchema), createScheduleSubsidiary);
scheduleSubsidiaryRouter.get("/:id", getScheduleSubsidiaryById);
scheduleSubsidiaryRouter.put("/:id", validate(scheduleSubsidiarySchema), updateScheduleSubsidiary);

export default scheduleSubsidiaryRouter;
