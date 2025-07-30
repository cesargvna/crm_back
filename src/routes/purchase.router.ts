import express from 'express';
import { validate } from '../middleware/validate.middleware';
import { validateParams } from '../middleware/validateParams.middleware';
import { createPurchaseWithPriceSync, getPurchaseById, getPurchasesBySubsidiary } from '../controllers/purchase/purchase.controller';
import { createPurchaseCreditPayment, getPurchaseCreditPaymentsByPurchase } from '../controllers/purchase/purchaseCreditPayment.controller';
import { getPurchaseDetailsByPurchaseId } from '../controllers/purchase/purchaseDetail.controller';
import { createPurchaseSchema, getPurchaseByIdSchema, getPurchasesBySubsidiarySchema } from '../validators/purchase/purchase.validation';
import { validateParamsQuery } from '../middleware/validateParamsQuery';

const purchaseRouter = express.Router();

purchaseRouter.post("/", createPurchaseWithPriceSync );
purchaseRouter.get("/bySubsidiary/:subsidiaryId", getPurchasesBySubsidiary );
purchaseRouter.get("/:id", getPurchaseById );

export default purchaseRouter;