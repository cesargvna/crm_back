import express from 'express';
import { validate } from '../middleware/validate.middleware';
import { validateParams } from '../middleware/validateParams.middleware';
import { createPurchaseManualPrices, createPurchaseWithPriceSync, getPurchaseById, getPurchasesBySubsidiary } from '../controllers/purchase/purchase.controller';
import { createPurchaseCreditPayment, getPurchaseCreditPaymentsByPurchase } from '../controllers/purchase/purchaseCreditPayment.controller';
import { getPurchaseDetailsByPurchaseId } from '../controllers/purchase/purchaseDetail.controller';
import { createPurchaseSchema } from '../validators/purchase/purchase.validation';
import { validateParamsQuery } from '../middleware/validateParamsQuery';

const purchaseRouter = express.Router();

purchaseRouter.post("/withPriceSync", validate(createPurchaseSchema), createPurchaseWithPriceSync );
purchaseRouter.post("/manual", validate(createPurchaseSchema), createPurchaseManualPrices );
purchaseRouter.get("/bySubsidiary/:subsidiaryId", getPurchasesBySubsidiary );
purchaseRouter.get("/:id", getPurchaseById );

export default purchaseRouter;