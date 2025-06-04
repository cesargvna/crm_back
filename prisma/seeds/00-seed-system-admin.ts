import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

export const seedSystemAdmin = async () => {
  const globalTenant = await prisma.tenant.upsert({
    where: { name: "GLOBAL" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000000",
      name: "GLOBAL",
      description: "Tenant especial para System_Admin",
      status: true,
    },
  });

  const globalSubsidiary = await prisma.subsidiary.upsert({
    where: {
      name_tenantId: {
        name: "GLOBAL",
        tenantId: globalTenant.id,
      },
    },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000000",
      name: "GLOBAL",
      subsidiary_type: "OFICINA",
      allowNegativeStock: false,
      address: "Oficina central",
      city: "N/A",
      country: "N/A",
      tenantId: globalTenant.id,
      status: true,
    },
  });

  let systemAdminRole = await prisma.role.findFirst({
    where: { name: "SYSTEM_ADMIN", tenantId: null },
  });

  if (!systemAdminRole) {
    systemAdminRole = await prisma.role.create({
      data: {
        id: uuidv4(),
        name: "SYSTEM_ADMIN",
        description: "Rol global sin tenant",
        tenantId: null,
        status: true,
      },
    });
  }

  const username = "sysadmin";
  const exists = await prisma.user.findFirst({
    where: { username, tenantId: null },
  });

  if (exists) {
    console.log("⏩ Usuario System_Admin ya existe");
    return;
  }

  const hashed = await bcrypt.hash("12345678", 10);

  await prisma.user.create({
    data: {
      id: uuidv4(),
      username,
      password: hashed,
      name: "System",
      lastname: "Admin",
      roleId: systemAdminRole.id,
      subsidiaryId: globalSubsidiary.id,
      tenantId: null,
      status: true,
    },
  });

  console.log("✅ Usuario especial System_Admin creado");
};
