import express from 'express';
import { validate } from '../middleware/validate.middleware';
import { validateParams } from '../middleware/validateParams.middleware';
import { createPurchase, getPurchaseById, getPurchasesBySubsidiary } from '../controllers/purchase/purchase.controller';
import { createPurchaseCreditPayment, getPurchaseCreditPaymentsByPurchase } from '../controllers/purchase/purchaseCreditPayment.controller';
import { getPurchaseDetailsByPurchaseId } from '../controllers/purchase/purchaseDetail.controller';
import { createPurchaseSchema, getPurchaseByIdSchema, getPurchasesBySubsidiarySchema } from '../validators/purchase/purchase.validation';
import { validateParamsQuery } from '../middleware/validateParamsQuery';

const purchaseRouter = express.Router();

purchaseRouter.post("/", validate(createPurchaseSchema), createPurchase);
purchaseRouter.get("/:id", validateParams(getPurchaseByIdSchema), getPurchaseById);
purchaseRouter.get("/bySubsidiary/:subsidiaryId", validateParamsQuery(getPurchasesBySubsidiarySchema), getPurchasesBySubsidiary );



purchaseRouter.get("/purchaseDetails/byPurchase/:purchaseId", getPurchaseDetailsByPurchaseId);

purchaseRouter.post("/purchaseCreditPayments", createPurchaseCreditPayment);
purchaseRouter.get("/purchaseCreditPayments/byPurchase/:purchaseId", getPurchaseCreditPaymentsByPurchase);

export default purchaseRouter;