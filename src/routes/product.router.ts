import express from 'express';
import { validate } from '../middleware/validate.middleware';
import { validateParams } from '../middleware/validateParams.middleware';
import { createProductCategory, getActiveProductCategoriesBySubsidiary, getAllProductCategoriesBySubsidiary, getProductCategoriesBySubsidiary, getProductCategoryById, toggleProductCategoryStatus, updateProductCategory } from '../controllers/product/productCategory.controller';
import { createProductCategorySchema, getProductCategoriesBySubsidiarySchema, getProductCategoryByIdSchema, toggleProductCategoryStatusParamsSchema, updateProductCategorySchema } from '../validators/product/productCategory.validation';
import { createUnitMeasurementSchema, getUnitMeasurementByIdSchema, getUnitMeasurementsBySubsidiarySchema, toggleUnitMeasurementStatusParamsSchema, updateUnitMeasurementSchema } from '../validators/product/unitMeasurement.validatior';
import { createUnitMeasurement, getActiveUnitMeasurementsBySubsidiary, getUnitMeasurementById, getUnitMeasurementsBySubsidiary, toggleUnitMeasurementStatus, updateUnitMeasurement } from '../controllers/product/unitMeasurement.controller';
import { createPriceTypeSchema, getPriceTypeByIdSchema, getPriceTypesBySubsidiarySchema, togglePriceTypeStatusParamsSchema, updatePriceTypeSchema } from '../validators/product/priceType.validatior';
import { createPriceType, getActivePriceTypesBySubsidiary, getPriceTypeById, getPriceTypesBySubsidiary, togglePriceTypeStatus, updatePriceType } from '../controllers/product/priceType.controller';
import { createCurrencySchema, getCurrenciesBySubsidiarySchema, getCurrencyByIdSchema, toggleCurrencyStatusParamsSchema, updateCurrencySchema } from '../validators/product/currency.validatior';
import { createCurrency, getActiveCurrenciesBySubsidiary, getCurrenciesBySubsidiary, getCurrencyById, toggleCurrencyStatus, updateCurrency } from '../controllers/product/currency.controller';
import { createProductSchema, getProductByIdSchema, getProductsBySubsidiarySchema, toggleProductStatusParamsSchema, updateProductSchema } from '../validators/product/product.validatior';
import { createProduct, getActiveProductsBySubsidiary, getActiveProductsWithStockForSale, getAllProductsForSale, getProductById, getProductsBySubsidiary, toggleProductStatus, updateProduct } from '../controllers/product/product.controller';
import { importProductsWithCategoriesAndUnits } from '../controllers/product/importProduct.controller';
import { importExcelFormSchema } from '../validators/product/importProduct.validator';
import { createProductPrice, getActivePricesByProduct, getPricesByProduct, getProductPriceById, updateProductPrice } from '../controllers/product/productPrice.controller';
import { createProductPriceSchema, getPricesByProductParamsSchema, getPricesByProductQuerySchema, getProductPriceByIdSchema, updateProductPriceSchema } from '../validators/product/productPrice.validator';
import { validateQuery } from '../middleware/validateQuery.middleware';


const productRouter = express.Router();


productRouter.post("/categories", validate(createProductCategorySchema), createProductCategory);
productRouter.put("/categories/:id", validate(updateProductCategorySchema), updateProductCategory);
productRouter.get("/categories/bySubsidiary/:subsidiaryId", validateParams(getProductCategoriesBySubsidiarySchema), getProductCategoriesBySubsidiary);
productRouter.get("/categories/:id", validateParams(getProductCategoryByIdSchema), getProductCategoryById);
productRouter.patch("/categories/:id/status", validateParams(toggleProductCategoryStatusParamsSchema), toggleProductCategoryStatus);
productRouter.get("/categoriesActive/bySubsidiary/:subsidiaryId", validateParams(getProductCategoriesBySubsidiarySchema), getActiveProductCategoriesBySubsidiary);
productRouter.get("/allCategories/bySubsidiary/:subsidiaryId", validateParams(getProductCategoriesBySubsidiarySchema), getAllProductCategoriesBySubsidiary);

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

productRouter.post("/products", validate(createProductSchema), createProduct);
productRouter.put("/products/:id", validate(updateProductSchema), updateProduct);
productRouter.get("/products/bySubsidiary/:subsidiaryId", validateParams(getProductsBySubsidiarySchema), getProductsBySubsidiary);
productRouter.get("/products/:id", validateParams(getProductByIdSchema), getProductById);
productRouter.patch("/products/:id/status", validateParams(toggleProductStatusParamsSchema), toggleProductStatus);
productRouter.get("/productsActive/bySubsidiary/:subsidiaryId", validateParams(getProductsBySubsidiarySchema), getActiveProductsBySubsidiary);
productRouter.get("/for-sale/all/:subsidiaryId", validateParams(getProductsBySubsidiarySchema), getAllProductsForSale);
productRouter.get("/for-sale/active-with-stock/:subsidiaryId", validateParams(getProductsBySubsidiarySchema), getActiveProductsWithStockForSale);

//import EXCEL 
productRouter.post("/import/product-category-unit", ...importProductsWithCategoriesAndUnits);

productRouter.get("/prices/:productId", validateParams(getPricesByProductParamsSchema), validateQuery(getPricesByProductQuerySchema), getPricesByProduct);
productRouter.get("/prices/active/:productId", validateParams(getPricesByProductParamsSchema), getActivePricesByProduct);
productRouter.post("/prices/:productId", validateParams(getPricesByProductParamsSchema), validate(createProductPriceSchema), createProductPrice);
productRouter.get("/price/:id", validateParams(getProductPriceByIdSchema), getProductPriceById);
productRouter.patch("/price/:id", validateParams(getProductPriceByIdSchema), validate(updateProductPriceSchema), updateProductPrice);

export default productRouter;