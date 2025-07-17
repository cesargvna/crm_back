import express from 'express';
import { validate } from '../middleware/validate.middleware';
import { validateParams } from '../middleware/validateParams.middleware';
import { createInventory, getInventoriesBySubsidiary, getInventoryByProductId } from '../controllers/inventory/inventory.controller';


const inventoryRouter = express.Router();

inventoryRouter.post("/", createInventory);
inventoryRouter.get("/bySubsidiary/:subsidiaryId",  getInventoriesBySubsidiary);
inventoryRouter.get("/byProduct/:productId",  getInventoryByProductId);

export default inventoryRouter;