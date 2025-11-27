import express from 'express';
import { validate } from '../middleware/validate.middleware';
import { validateParams } from '../middleware/validateParams.middleware';
import { createPurchaseSchema } from '../validators/purchase/purchase.validation';
import { validateParamsQuery } from '../middleware/validateParamsQuery';
import { createPurchaseCreditPayment } from '../controllers/purchase/purchaseCreditPayment.controller';
import { createPurchase } from '../controllers/purchase/purchase.controller';

const purchaseRouter = express.Router();

purchaseRouter.post("/", createPurchase );
purchaseRouter.post("/creditPayment/:purchaseId", validate(createPurchaseSchema), createPurchaseCreditPayment );

export default purchaseRouter;