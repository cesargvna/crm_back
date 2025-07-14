import express from 'express';
import { validate } from '../middleware/validate.middleware';
import { validateParams } from '../middleware/validateParams.middleware';
import { createProductCategory, getActiveProductCategoriesBySubsidiary, getProductCategoriesBySubsidiary, getProductCategoryById, toggleProductCategoryStatus, updateProductCategory } from '../controllers/productCategory.controller';
import { createProductCategorySchema, getProductCategoriesBySubsidiarySchema, getProductCategoryByIdSchema, toggleProductCategoryStatusParamsSchema, updateProductCategorySchema } from '../validators/productCategory.validation';
import { createUnitMeasurementSchema, getUnitMeasurementByIdSchema, getUnitMeasurementsBySubsidiarySchema, toggleUnitMeasurementStatusParamsSchema, updateUnitMeasurementSchema } from '../validators/unitMeasurement.validatior';
import { createUnitMeasurement, getActiveUnitMeasurementsBySubsidiary, getUnitMeasurementById, getUnitMeasurementsBySubsidiary, toggleUnitMeasurementStatus, updateUnitMeasurement } from '../controllers/unitMeasurement.controller';
import { createPriceTypeSchema, getPriceTypeByIdSchema, getPriceTypesBySubsidiarySchema, togglePriceTypeStatusParamsSchema, updatePriceTypeSchema } from '../validators/priceType.validatior';
import { createPriceType, getActivePriceTypesBySubsidiary, getPriceTypeById, getPriceTypesBySubsidiary, togglePriceTypeStatus, updatePriceType } from '../controllers/priceType.controller';
import { createCurrencySchema, getCurrenciesBySubsidiarySchema, getCurrencyByIdSchema, toggleCurrencyStatusParamsSchema, updateCurrencySchema } from '../validators/currency.validatior';
import { createCurrency, getActiveCurrenciesBySubsidiary, getCurrenciesBySubsidiary, getCurrencyById, toggleCurrencyStatus, updateCurrency } from '../controllers/currency.controller';

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

productRouter.post("/priceTypes", validate(createPriceTypeSchema), createPriceType);
productRouter.put("/priceTypes/:id", validate(updatePriceTypeSchema), updatePriceType);
productRouter.get("/priceTypes/bySubsidiary/:subsidiaryId", validateParams(getPriceTypesBySubsidiarySchema), getPriceTypesBySubsidiary);
productRouter.get("/priceTypes/:id", validateParams(getPriceTypeByIdSchema), getPriceTypeById);
productRouter.patch("/priceTypes/:id/status", validateParams(togglePriceTypeStatusParamsSchema), togglePriceTypeStatus);
productRouter.get("/priceTypesActive/bySubsidiary/:subsidiaryId", validateParams(getPriceTypesBySubsidiarySchema), getActivePriceTypesBySubsidiary);

productRouter.post("/currencies", validate(createCurrencySchema), createCurrency);
productRouter.put("/currencies/:id", validate(updateCurrencySchema), updateCurrency);
productRouter.get("/currencies/bySubsidiary/:subsidiaryId", validateParams(getCurrenciesBySubsidiarySchema), getCurrenciesBySubsidiary);
productRouter.get("/currencies/:id", validateParams(getCurrencyByIdSchema), getCurrencyById);
productRouter.patch("/currencies/:id/status", validateParams(toggleCurrencyStatusParamsSchema), toggleCurrencyStatus);
productRouter.get("/currenciesActive/bySubsidiary/:subsidiaryId", validateParams(getCurrenciesBySubsidiarySchema), getActiveCurrenciesBySubsidiary);

export default productRouter;