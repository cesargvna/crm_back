import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../../generated/prisma";
import { tokenSign } from "../../src/utils/handleToken";

const prisma = new PrismaClient();

export const seedSystemAdmin = async () => {
  const globalTenant = await prisma.tenant.upsert({
    where: { name: "GLOBAL" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000000",
      name: "GLOBAL",
      description: "Tenant especial para System.Admin",
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
    where: { name: "system.admin", tenantId: null },
  });

  if (!systemAdminRole) {
    systemAdminRole = await prisma.role.create({
      data: {
        id: uuidv4(),
        name: "system.admin",
        description: "Rol global sin tenant",
        tenantId: null,
        status: true,
      },
    });
  }

  const username = "system.admin";
  const exists = await prisma.user.findUnique({
    where: { username },
  });

  if (exists) {
    console.log("⏩ Usuario system.admin ya existe");
    return;
  }

  const plaintextPassword = "12345678";
  const hashed = await bcrypt.hash(plaintextPassword, 10);

  const user = await prisma.user.create({
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

  const token = await tokenSign(user);
  console.log("✅ Usuario especial system.admin creado");
  console.log(`👤 Username: ${username}`);
  console.log(`🔑 Password: ${plaintextPassword}`);
  console.log(`🔐 Token: ${token}`);
};
