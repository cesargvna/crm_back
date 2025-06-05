// ✅ expense.router.ts
import express from "express";
import {
  createExpense,
  updateExpense,
  getAllExpenses,
  getExpenseById,
  toggleExpenseStatus,
} from "../controllers/expense.controller";

import { validate } from "../middleware/validate.middleware";
import { validateParams } from "../middleware/validateParams.middleware";
import { validateQuery } from "../middleware/validateQuery.middleware";
import {
  expenseSchema,
  updateExpenseSchema,
  toggleExpenseStatusSchema,
  getAllExpensesQuerySchema,
} from "../validators/expense.validator";
import { authenticate } from "../middleware/auth.middleware";
import { injectTenantId } from "../middleware/injectTenantId.middleware";

const expenseRouter = express.Router();

expenseRouter.post(
  "/",
  authenticate,
  injectTenantId,
  validate(expenseSchema),
  createExpense
);

expenseRouter.put(
  "/:id",
  authenticate,
  injectTenantId,
  validate(updateExpenseSchema),
  updateExpense
);

expenseRouter.get(
  "/",
  authenticate,
  validateQuery(getAllExpensesQuerySchema),
  getAllExpenses
);

expenseRouter.get("/:id", authenticate, getExpenseById);

expenseRouter.patch(
  "/:id/toggle",
  authenticate,
  validateParams(toggleExpenseStatusSchema),
  toggleExpenseStatus
);

export default expenseRouter;
