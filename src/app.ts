import express from 'express';
const app = express();
import cors from 'cors';
import errorHandler from './middleware/global.middleware';

import rolePermissionRouter from './routes/rolePermission.router';
import tenatRouter from './routes/tenant.router';
import subsidiaryRouter from './routes/subsidiary.router';
import userRouter from './routes/user.router';

import { swaggerConfig } from "./docs";
import swaggerUi from 'swagger-ui-express';
import authRouter from './routes/auth.router';
import expenseRouter from './routes/expense.router';
import incomeRouter from './routes/income.router';
import clientRouter from './routes/client.router';
import supplierRouter from './routes/supplier.router';
import productRouter from './routes/product.router';
import cashSessionRouter from './routes/cashSession.router';
import inventoryRouter from './routes/inventory.router';
import purchaseRouter from './routes/purchase.router';
import saleRouter from './routes/sale.router';

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerConfig));

app.use(express.json());
app.use(cors());

app.use('/login', authRouter);
app.use('/role', rolePermissionRouter);
app.use('/tenant', tenatRouter);
app.use('/subsidiary', subsidiaryRouter);
app.use('/user', userRouter);
app.use('/expense', expenseRouter);
app.use('/income', incomeRouter);
app.use('/client', clientRouter);
app.use('/supplier', supplierRouter);
app.use('/product', productRouter);
app.use('/inventory', inventoryRouter);
app.use('/purchase', purchaseRouter);
app.use('/sale', saleRouter);
app.use('/cashSession', cashSessionRouter);

app.use(errorHandler);

export default app;