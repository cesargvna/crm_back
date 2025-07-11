import express from 'express';
import { validate } from '../middleware/validate.middleware';
import { validateParams } from '../middleware/validateParams.middleware';
import { createSupplierCategory, getActiveSupplierCategoriesBySubsidiary, getSupplierCategoriesBySubsidiary, getSupplierCategoryById, toggleSupplierCategoryStatus, updateSupplierCategory } from '../controllers/supplierCategory.controller';
import { createSupplierCategorySchema, getSupplierCategoriesBySubsidiarySchema, getSupplierCategoryByIdSchema, toggleSupplierCategoryStatusParamsSchema, updateSupplierCategorySchema } from '../validators/supplierCategory.validator';
import { createSupplier, getActiveSuppliersBySubsidiary, getAllSupplierCategoriesBySubsidiary, getSupplierById, getSuppliersBySubsidiary, toggleSupplierStatus, updateSupplier } from '../controllers/supplier.controller';
import { createSupplierSchema, getSupplierByIdSchema, getSuppliersBySubsidiarySchema, toggleSupplierStatusParamsSchema, updateSupplierSchema } from '../validators/supplier.validator';

const supplierRouter = express.Router();

supplierRouter.post("/categories", validate(createSupplierCategorySchema), createSupplierCategory);
supplierRouter.get("/categories/bySubsidiary/:subsidiaryId", validateParams(getSupplierCategoriesBySubsidiarySchema), getSupplierCategoriesBySubsidiary);
supplierRouter.get("/allCategories/bySubsidiary/:subsidiaryId", validateParams(getSupplierCategoriesBySubsidiarySchema), getAllSupplierCategoriesBySubsidiary);
supplierRouter.get("/categoriesActive/bySubsidiary/:subsidiaryId", validateParams(getSupplierCategoriesBySubsidiarySchema), getActiveSupplierCategoriesBySubsidiary);
supplierRouter.get("/categories/:id", validateParams(getSupplierCategoryByIdSchema), getSupplierCategoryById);
supplierRouter.put("/categories/:id", validate(updateSupplierCategorySchema), updateSupplierCategory);
supplierRouter.patch("/categories/:id/status", validateParams(toggleSupplierCategoryStatusParamsSchema), toggleSupplierCategoryStatus);

supplierRouter.post("/", validate(createSupplierSchema), createSupplier);
supplierRouter.put("/:id", validate(updateSupplierSchema), updateSupplier);
supplierRouter.get("/bySubsidiary/:subsidiaryId", validateParams(getSuppliersBySubsidiarySchema), getSuppliersBySubsidiary);
supplierRouter.get("/activeBySubsidiary/:subsidiaryId", validateParams(getSuppliersBySubsidiarySchema), getActiveSuppliersBySubsidiary);
supplierRouter.get("/:id", validateParams(getSupplierByIdSchema), getSupplierById);
supplierRouter.patch("/:id/status", validateParams(toggleSupplierStatusParamsSchema), toggleSupplierStatus);

export default supplierRouter;