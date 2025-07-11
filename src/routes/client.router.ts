import express from 'express';
import { validate } from '../middleware/validate.middleware';
import { validateParams } from '../middleware/validateParams.middleware';
import { createClientCategory, getActiveClientCategoriesBySubsidiary, getAllClientCategoriesBySubsidiary, getClientCategoriesBySubsidiary, getClientCategoryById, toggleClientCategoryStatus, updateClientCategory } from '../controllers/clientCategory.controller';
import { createClientCategorySchema, getClientCategoriesBySubsidiarySchema, getClientCategoryByIdSchema, toggleClientCategoryStatusParamsSchema, updateClientCategorySchema } from '../validators/clientCategory.validator';
import { createClientSchema, getClientByIdSchema, getClientsBySubsidiarySchema, toggleClientStatusParamsSchema, updateClientSchema } from '../validators/client.validator';
import { createClient, getActiveClientsBySubsidiary, getClientById, getClientsBySubsidiary, toggleClientStatus, updateClient } from '../controllers/client.controller';

const clientRouter = express.Router();

clientRouter.post("/categories", validate(createClientCategorySchema), createClientCategory);
clientRouter.get("/categories/bySubsidiary/:subsidiaryId", validateParams(getClientCategoriesBySubsidiarySchema), getClientCategoriesBySubsidiary);
clientRouter.get("/allCategories/bySubsidiary/:subsidiaryId", validateParams(getClientCategoriesBySubsidiarySchema), getAllClientCategoriesBySubsidiary);
clientRouter.get("/categoriesActive/bySubsidiary/:subsidiaryId", validateParams(getClientCategoriesBySubsidiarySchema), getActiveClientCategoriesBySubsidiary);
clientRouter.get("/categories/:id", validateParams(getClientCategoryByIdSchema), getClientCategoryById);
clientRouter.put("/categories/:id", validate(updateClientCategorySchema), updateClientCategory);
clientRouter.patch("/categories/:id/status", validateParams(toggleClientCategoryStatusParamsSchema), toggleClientCategoryStatus);

clientRouter.post("/", validate(createClientSchema), createClient);
clientRouter.get("/bySubsidiary/:subsidiaryId", validateParams(getClientsBySubsidiarySchema), getClientsBySubsidiary);
clientRouter.get("/activeBySubsidiary/:subsidiaryId", validateParams(getClientsBySubsidiarySchema), getActiveClientsBySubsidiary);
clientRouter.get("/:id", validateParams(getClientByIdSchema), getClientById);
clientRouter.put("/:id", validate(updateClientSchema), updateClient);
clientRouter.patch("/:id/status", validateParams(toggleClientStatusParamsSchema), toggleClientStatus);

export default clientRouter;