import express from 'express';
import { validate } from '../middleware/validate.middleware';
import { validateParams } from '../middleware/validateParams.middleware';
import { createProductCategory, getActiveProductCategoriesBySubsidiary, getProductCategoriesBySubsidiary, getProductCategoryById, toggleProductCategoryStatus, updateProductCategory } from '../controllers/productCategory.controller';
import { createProductCategorySchema, getProductCategoriesBySubsidiarySchema, getProductCategoryByIdSchema, toggleProductCategoryStatusParamsSchema, updateProductCategorySchema } from '../validators/productCategory.validation';
import { createUnitMeasurementSchema, getUnitMeasurementByIdSchema, getUnitMeasurementsBySubsidiarySchema, toggleUnitMeasurementStatusParamsSchema, updateUnitMeasurementSchema } from '../validators/unitMeasurement.validatior';
import { createUnitMeasurement, getActiveUnitMeasurementsBySubsidiary, getUnitMeasurementById, getUnitMeasurementsBySubsidiary, toggleUnitMeasurementStatus, updateUnitMeasurement } from '../controllers/unitMeasurement.controller';

const productRouter = express.Router();


productRouter.post("/categories", validate(createProductCategorySchema), createProductCategory);
productRouter.put("/categories/:id", validate(updateProductCategorySchema), updateProductCategory);
productRouter.get("/categories/bySubsidiary/:subsidiaryId", validateParams(getProductCategoriesBySubsidiarySchema), getProductCategoriesBySubsidiary);
productRouter.get("/categories/:id", validateParams(getProductCategoryByIdSchema), getProductCategoryById);
productRouter.patch("/categories/:id/status", validateParams(toggleProductCategoryStatusParamsSchema), toggleProductCategoryStatus);
productRouter.get("/categoriesActive/bySubsidiary/:subsidiaryId", validateParams(getProductCategoriesBySubsidiarySchema), getActiveProductCategoriesBySubsidiary);

productRouter.post("/unitMeasurements", validate(createUnitMeasurementSchema), createUnitMeasurement);
productRouter.put("/unitMeasurements/:id", validate(updateUnitMeasurementSchema), updateUnitMeasurement);
productRouter.get("/unitMeasurements/bySubsidiary/:subsidiaryId", validateParams(getUnitMeasurementsBySubsidiarySchema), getUnitMeasurementsBySubsidiary);
productRouter.get("/unitMeasurements/:id", validateParams(getUnitMeasurementByIdSchema), getUnitMeasurementById);
productRouter.patch("/unitMeasurements/:id/status", validateParams(toggleUnitMeasurementStatusParamsSchema), toggleUnitMeasurementStatus);
productRouter.get("/unitMeasurementsActive/bySubsidiary/:subsidiaryId", validateParams(getUnitMeasurementsBySubsidiarySchema), getActiveUnitMeasurementsBySubsidiary);

export default productRouter;