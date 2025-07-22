import express from 'express';
import { validate } from '../middleware/validate.middleware';
import { validateParams } from '../middleware/validateParams.middleware';
import { getInventoryBySubsidiary } from '../controllers/inventory/inventory.controller';



const inventoryRouter = express.Router();

inventoryRouter.get("/bySubsidiary/:subsidiaryId",  getInventoryBySubsidiary);


export default inventoryRouter;