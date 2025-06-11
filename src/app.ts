import express from 'express';
const app = express();
import cors from 'cors';
import errorHandler from './middleware/global.middleware';

import rolePermissionRouter from './routes/rolePermission.router';
import tenatRouter from './routes/tenant.router';
import subsidiaryRouter from './routes/subsidiary.router';

import { swaggerConfig } from "./docs";
import swaggerUi from 'swagger-ui-express';

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerConfig));

app.use(express.json());
app.use(cors());


app.use('/role', rolePermissionRouter);
app.use('/tenant', tenatRouter);
app.use('/subsidiary', subsidiaryRouter);

app.use(errorHandler);

export default app;