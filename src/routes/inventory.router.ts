import express from 'express';
import { validate } from '../middleware/validate.middleware';
import { validateParams } from '../middleware/validateParams.middleware';
import { createInventory, getInventoryBySubsidiary, getProductsWithoutInventory, updateInventory } from '../controllers/inventory/inventory.controller';
import { createInventorySchema, getInventoryBySubsidiarySchema, updateInventorySchema } from '../validators/inventory/inventory.validatior';

const inventoryRouter = express.Router();

inventoryRouter.post("/", validate(createInventorySchema), createInventory);
inventoryRouter.patch("/:id", validate(updateInventorySchema), updateInventory);
inventoryRouter.get("/bySubsidiary/:subsidiaryId", validateParams(getInventoryBySubsidiarySchema), getInventoryBySubsidiary);
inventoryRouter.get("/productsWithoutInventory/:subsidiaryId", validateParams(getInventoryBySubsidiarySchema), getProductsWithoutInventory);

export default inventoryRouter;