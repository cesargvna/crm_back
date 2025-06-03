import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // Seed acciones básicas
  const actions = ["create", "read", "update", "delete"];
  for (const name of actions) {
    await prisma.permissionAction.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Rol Admin
  await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: {
      name: "Admin",
      description: "Rol con todos los permisos",
    },
  });
}

main()
  .then(() => {
    console.log("🌱 Seed completo");
    prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
