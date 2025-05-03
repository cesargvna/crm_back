import express from "express";
const subsidiaryRouter = express.Router();
import { validate } from "../middleware/validate.middleware";
import { subsidiarySchema } from "../validators/subsidiary.validator";
import { createSubsidiary, getSubsidiaryById,updateSubsidiary,getAllSubsidiaries } from "../controllers/subsidiary.controller";


subsidiaryRouter.get("/", getAllSubsidiaries);
subsidiaryRouter.post("/", validate(subsidiarySchema), createSubsidiary);
subsidiaryRouter.get("/:id", getSubsidiaryById);
subsidiaryRouter.put("/:id", validate(subsidiarySchema), updateSubsidiary);


export default subsidiaryRouter;
