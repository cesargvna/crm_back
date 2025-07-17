import express from 'express';
import { validate } from '../middleware/validate.middleware';
import { validateParams } from '../middleware/validateParams.middleware';
import { createPurchase, getPurchaseById, getPurchasesBySubsidiary, getPurchasesByUserId } from '../controllers/purchase/purchase.controller';
import { createPurchaseCreditPayment, getPurchaseCreditPaymentsByPurchase } from '../controllers/purchase/purchaseCreditPayment.controller';
import { getPurchaseDetailsByPurchaseId } from '../controllers/purchase/purchaseDetail.controller';

const purchaseRouter = express.Router();

purchaseRouter.post("/", createPurchase);
purchaseRouter.get("/bySubsidiary/:subsidiaryId", getPurchasesBySubsidiary);
purchaseRouter.get("/byUser/:userId", getPurchasesByUserId);
purchaseRouter.get("/:id", getPurchaseById);

purchaseRouter.get("/purchaseDetails/byPurchase/:purchaseId", getPurchaseDetailsByPurchaseId);

purchaseRouter.post("/purchaseCreditPayments", createPurchaseCreditPayment);
purchaseRouter.get("/purchaseCreditPayments/byPurchase/:purchaseId", getPurchaseCreditPaymentsByPurchase);

export default purchaseRouter;