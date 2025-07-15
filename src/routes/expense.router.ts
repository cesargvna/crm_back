import express from 'express';
import { validate } from '../middleware/validate.middleware';
import { createExpenseCategory, getActiveExpenseCategoriesBySubsidiary, getExpenseCategoriesBySubsidiary, getExpenseCategoryById, toggleExpenseCategoryStatus, updateExpenseCategory } from '../controllers/expense/expenseCategory.controller';
import { createExpense, getExpenseById, getExpensesBySubsidiary, updateExpense } from '../controllers/expense/expense.controller';
import { createExpenseSchema, getExpenseByIdSchema, getExpensesBySubsidiarySchema, updateExpenseSchema } from '../validators/expense/expense.validator';
import { createExpenseCategorySchema, getExpenseCategoriesBySubsidiarySchema, getExpenseCategoryByIdSchema, toggleExpenseCategoryStatusParamsSchema, updateExpenseCategorySchema } from '../validators/expense/expenseCategory.validator';
import { validateParams } from '../middleware/validateParams.middleware';

const expenseRouter = express.Router();

expenseRouter.post('/categories', validate(createExpenseCategorySchema), createExpenseCategory);
expenseRouter.get('/categories/bySubsidiary/:subsidiaryId', validateParams(getExpenseCategoriesBySubsidiarySchema), getExpenseCategoriesBySubsidiary);
expenseRouter.get('/categoriesActive/bySubsidiary/:subsidiaryId', validateParams(getExpenseCategoriesBySubsidiarySchema), getActiveExpenseCategoriesBySubsidiary);
expenseRouter.get('/categories/:id', validateParams(getExpenseCategoryByIdSchema), getExpenseCategoryById);
expenseRouter.put('/categories/:id', validate(updateExpenseCategorySchema), updateExpenseCategory);
expenseRouter.patch('/categories/:id/status', validateParams(toggleExpenseCategoryStatusParamsSchema), toggleExpenseCategoryStatus);

expenseRouter.post('/', validate(createExpenseSchema), createExpense);
expenseRouter.get('/bySubsidiary/:subsidiaryId', validateParams(getExpensesBySubsidiarySchema), getExpensesBySubsidiary);
expenseRouter.get('/:id', validateParams(getExpenseByIdSchema), getExpenseById);
expenseRouter.put('/:id', validate(updateExpenseSchema), updateExpense);

export default expenseRouter;