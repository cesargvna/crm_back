import express from 'express';
import { validate } from '../middleware/validate.middleware';
import { validateParams } from '../middleware/validateParams.middleware';
import { validateParamsQuery } from '../middleware/validateParamsQuery';
import { createSaleAllowNegativeStock, createSaleWithStockValidation, getSaleById, getSalesBySubsidiary } from '../controllers/sale/sale.controller';
import { createSaleSchema } from '../validators/sale/sale.validatior';



const saleRouter = express.Router();

saleRouter.post("/withStockValidation", validate(createSaleSchema), createSaleWithStockValidation);
saleRouter.post("/allowNegativeStock", validate(createSaleSchema),  createSaleAllowNegativeStock);
saleRouter.get("/bySubsidiary/:subsidiaryId", getSalesBySubsidiary);
saleRouter.get("/:id", getSaleById);

export default saleRouter;