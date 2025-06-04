import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

export const seedActions = async () => {
  const actions = ["ver", "crear", "editar", "estado", "exportar"];

  for (const name of actions) {
    const exists = await prisma.permissionAction.findFirst({ where: { name } });

    if (exists) {
      console.log(`⏩ Action already exists: ${name}`);
      continue;
    }

    await prisma.permissionAction.create({
      data: {
        id: uuidv4(),
        name,
      },
    });

    console.log(`✅ Action created: ${name}`);
  }
};
