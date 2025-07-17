import express from 'express';
import { validate } from '../middleware/validate.middleware';
import { validateParams } from '../middleware/validateParams.middleware';
import { createSale, getSaleById, getSalesBySubsidiary, getSalesByUserId } from '../controllers/sale/sale.controller';
import { createSaleCreditPayment, getSaleCreditPaymentsBySale } from '../controllers/sale/saleCreditPayment.controller';
import { getSaleDetailsBySaleId } from '../controllers/sale/saleDetails.controller';




const saleRouter = express.Router();

saleRouter.post("/", createSale);
saleRouter.get("/bySubsidiary/:subsidiaryId", getSalesBySubsidiary);
saleRouter.get("/byUser/:userId", getSalesByUserId);
saleRouter.get("/:id", getSaleById);

saleRouter.get("/saleDetails/bySale/:saleId", getSaleDetailsBySaleId);

saleRouter.post("/creditPayments", createSaleCreditPayment);
saleRouter.get("/creditPayments/bySale/:saleId", getSaleCreditPaymentsBySale);

export default saleRouter;