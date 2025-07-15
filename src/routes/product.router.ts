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
import { createProduct, getActiveProductsBySubsidiary, getProductById, getProductsBySubsidiary, toggleProductStatus, updateProduct } from '../controllers/product/product.controller';
import { createExchangeRateSchema, getExchangeRateByIdSchema, getExchangeRatesBySubsidiarySchema, updateExchangeRateSchema } from '../validators/product/exchangeRate.validatior';
import { createExchangeRate, getExchangeRateById, getExchangeRatesBySubsidiary, updateExchangeRate } from '../controllers/product/exchangeRate.controller';
import { createCreditPayment, getCreditPaymentsBySale } from '../controllers/sale/saleCreditPayment.controller';
import { createSale, getSalesBySubsidiary } from '../controllers/sale/sale.controller';
import { createPurchaseCreditPayment, getPurchaseCreditPaymentsByPurchase } from '../controllers/purchase/purchaseCreditPayment.controller';
import { createPurchase, getPurchasesBySubsidiary } from '../controllers/purchase/purchase.controller';
import { getPurchaseDetailsByPurchase } from '../controllers/purchase/purchaseDetail.controller';
import { createInventory, getInventoriesBySubsidiary } from '../controllers/inventory/inventory.controller';

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

productRouter.post("/exchangeRates", validate(createExchangeRateSchema), createExchangeRate);
productRouter.put("/exchangeRates/:id", validate(updateExchangeRateSchema), updateExchangeRate);
productRouter.get("/exchangeRates/bySubsidiary/:subsidiaryId", validateParams(getExchangeRatesBySubsidiarySchema), getExchangeRatesBySubsidiary);
productRouter.get("/exchangeRates/:id", validateParams(getExchangeRateByIdSchema), getExchangeRateById);

// ✅ INVENTORY
productRouter.post("/inventories", createInventory);
productRouter.get("/inventories/bySubsidiary/:subsidiaryId",  getInventoriesBySubsidiary);

// ✅ PURCHASE
productRouter.post("/purchases", createPurchase);
productRouter.get("/purchases/bySubsidiary/:subsidiaryId", getPurchasesBySubsidiary);

// ✅ PURCHASE DETAILS
productRouter.get("/purchaseDetails/byPurchase/:purchaseId", getPurchaseDetailsByPurchase);

// ✅ PURCHASE CREDIT PAYMENTS
productRouter.post("/purchaseCreditPayments", createPurchaseCreditPayment);
productRouter.get("/purchaseCreditPayments/byPurchase/:purchaseId", getPurchaseCreditPaymentsByPurchase);

// ✅ SALES
productRouter.post("/sales",  createSale);
productRouter.get("/sales/bySubsidiary/:subsidiaryId",  getSalesBySubsidiary);

// ✅ CREDIT PAYMENTS
productRouter.post("/creditPayments", createCreditPayment);
productRouter.get("/creditPayments/bySale/:saleId", getCreditPaymentsBySale);

export default productRouter;