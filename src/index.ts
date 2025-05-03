import app from "./app";
import prisma from './utils/prisma';
import { PORT } from './utils/config';



process.on('SIGINT', async () => {
  console.log('cloing prisma connection');
  await prisma.$disconnect();
  process.exit(0);
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});