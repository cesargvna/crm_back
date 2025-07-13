import express from 'express';
import { validate } from '../middleware/validate.middleware';
import { validateParams } from '../middleware/validateParams.middleware';
import { createProductCategory, getActiveProductCategoriesBySubsidiary, getProductCategoriesBySubsidiary, getProductCategoryById, toggleProductCategoryStatus, updateProductCategory } from '../controllers/productCategory.controller';
import { createProductCategorySchema, getProductCategoriesBySubsidiarySchema, getProductCategoryByIdSchema, toggleProductCategoryStatusParamsSchema, updateProductCategorySchema } from '../validators/productCategory.validation';

const productRouter = express.Router();


productRouter.post("/categories", validate(createProductCategorySchema), createProductCategory);
productRouter.put("/categories/:id", validate(updateProductCategorySchema), updateProductCategory);
productRouter.get("/categories/bySubsidiary/:subsidiaryId", validateParams(getProductCategoriesBySubsidiarySchema), getProductCategoriesBySubsidiary);
productRouter.get("/categories/:id", validateParams(getProductCategoryByIdSchema), getProductCategoryById);
productRouter.patch("/categories/:id/status", validateParams(toggleProductCategoryStatusParamsSchema), toggleProductCategoryStatus);
productRouter.get("/categoriesActive/bySubsidiary/:subsidiaryId", validateParams(getProductCategoriesBySubsidiarySchema), getActiveProductCategoriesBySubsidiary);

export default productRouter;