import express from 'express';
import { validate } from '../middleware/validate.middleware';
import { validateParams } from '../middleware/validateParams.middleware';
import { createIncomeCategory, getActiveIncomeCategoriesBySubsidiary, getIncomeCategoriesBySubsidiary, getIncomeCategoryById, toggleIncomeCategoryStatus, updateIncomeCategory } from '../controllers/incomeCategory.controller';
import { createIncomeCategorySchema, getIncomeCategoriesBySubsidiarySchema, getIncomeCategoryByIdSchema, toggleIncomeCategoryStatusParamsSchema, updateIncomeCategorySchema } from '../validators/incomeCategory.validator';
import { createIncomeSchema, getIncomeByIdSchema, getIncomesBySubsidiarySchema, updateIncomeSchema } from '../validators/income.validator';
import { createIncome, getIncomeById, getIncomesBySubsidiary, updateIncome } from '../controllers/income.controller';

const incomeRouter = express.Router();

incomeRouter.post("/categories", validate(createIncomeCategorySchema), createIncomeCategory);
incomeRouter.get("/categories/bySubsidiary/:subsidiaryId", validateParams(getIncomeCategoriesBySubsidiarySchema), getIncomeCategoriesBySubsidiary);
incomeRouter.get("/categoriesActive/bySubsidiary/:subsidiaryId", validateParams(getIncomeCategoriesBySubsidiarySchema), getActiveIncomeCategoriesBySubsidiary);
incomeRouter.get("/categories/:id", validateParams(getIncomeCategoryByIdSchema), getIncomeCategoryById);
incomeRouter.put("/categories/:id", validate(updateIncomeCategorySchema), updateIncomeCategory);
incomeRouter.patch("/categories/:id/status", validateParams(toggleIncomeCategoryStatusParamsSchema), toggleIncomeCategoryStatus);

incomeRouter.post('/', validate(createIncomeSchema), createIncome);
incomeRouter.get('/bySubsidiary/:subsidiaryId', validateParams(getIncomesBySubsidiarySchema), getIncomesBySubsidiary);
incomeRouter.get('/:id', validateParams(getIncomeByIdSchema), getIncomeById);
incomeRouter.put('/:id', validate(updateIncomeSchema), updateIncome);

export default incomeRouter;