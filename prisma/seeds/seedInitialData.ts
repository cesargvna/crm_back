import { PrismaClient } from "../../generated/prisma";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function seed() {
  let tenant = await prisma.tenant.findFirst({
    where: { name: "TENANT_PRUEBA" },
  });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        id: uuidv4(),
        name: "TENANT_PRUEBA",
      },
    });
  }

  // Crear rol
  const role = await prisma.role.create({
    data: {
      id: uuidv4(),
      name: "SUPER_ADMIN",
      description: "System administrator",
      tenantId: tenant.id,
    },
  });

  // Crear sucursal
  const subsidiary = await prisma.subsidiary.create({
    data: {
      id: uuidv4(),
      name: "CASA MATRIZ",
      subsidiary_type: "MATRIZ",
      tenantId: tenant.id,
    },
  });

  // Crear usuario admin
  const password = await hash("admin123", 10);

  const user = await prisma.user.create({
    data: {
      id: uuidv4(),
      username: "admin",
      name: "Admin",
      password,
      roleId: role.id,
      subsidiaryId: subsidiary.id,
      tenantId: tenant.id,
    },
  });

  console.log("✅ Admin user created:");
  console.log("Username: admin");
  console.log("Password: admin123");
  console.log("Tenant ID:", tenant.id);
}

seed()
  .catch((e) => {
    console.error("❌ Error seeding data", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
