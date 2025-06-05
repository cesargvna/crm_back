import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { DayOfWeek, PrismaClient } from "../../generated/prisma";
import { tokenSign } from "../../src/utils/handleToken";

const prisma = new PrismaClient();

export const seedUsers = async () => {
  const tenants = await prisma.tenant.findMany();
  const roles = await prisma.role.findMany();

  // ✅ Asegurar existencia de usuario especial único
  const systemUser = await prisma.user.findUnique({
    where: { username: "system.admin" },
  });

  if (!systemUser) {
    const systemAdminRole = roles.find((r) => r.name === "system.admin");

    if (!systemAdminRole) {
      console.warn("⚠️ No se encontró el rol system.admin. Se omitirá system.admin.");
    } else {
      const systemPlaintextPassword = "admin123";
      const hashedPassword = await bcrypt.hash(systemPlaintextPassword, 10);

      const user = await prisma.user.create({
        data: {
          id: uuidv4(),
          username: "system.admin",
          password: hashedPassword,
          name: "System",
          lastname: "Admin",
          roleId: systemAdminRole.id,
          subsidiaryId: "00000000-0000-0000-0000-000000000000",
          tenantId: null,
          status: true,
        },
      });

      const token = await tokenSign(user);
      console.log("✅ Usuario system.admin creado.");
      console.log(`👤 Username: system.admin`);
      console.log(`🔑 Password: ${systemPlaintextPassword}`);
      console.log(`🔐 Token: ${token}`);
    }
  } else {
    console.log("⏩ Usuario system.admin ya existe.");
  }

  // ✅ Crear los demás usuarios por tenant y rol
  for (const tenant of tenants) {
    const subsidiaries = await prisma.subsidiary.findMany({
      where: { tenantId: tenant.id },
    });

    const tenantRoles = roles.filter((r) => r.tenantId === tenant.id);

    for (const role of tenantRoles) {
      for (let i = 1; i <= 2; i++) {
        const rolePrefix = role.name.split(".")[0].substring(0, 3).toLowerCase();
        const tenantPrefix = tenant.name.substring(0, 2).toLowerCase();
        let username = `${rolePrefix}${tenantPrefix}${i}`;

        if (username.length > 10) {
          username = username.slice(0, 10);
          console.warn(`⚠️ Username too long, truncated: ${username}`);
        }

        const exists = await prisma.user.findUnique({
          where: { username },
        });

        if (exists) {
          console.log(`⏩ Usuario ya existe: ${username}`);
          continue;
        }

        const plaintextPassword = "12345678";
        const hashedPassword = await bcrypt.hash(plaintextPassword, 10);
        const subsidiary = subsidiaries[i % subsidiaries.length];

        const user = await prisma.user.create({
          data: {
            id: uuidv4(),
            username,
            password: hashedPassword,
            name: `${role.name.split(".")[0]}${i}`,
            lastname: "Test",
            roleId: role.id,
            subsidiaryId: subsidiary.id,
            tenantId: tenant.id,
            status: true,
          },
        });

        await prisma.scheduleUser.create({
          data: {
            id: uuidv4(),
            userId: user.id,
            tenantId: tenant.id,
            start_day: DayOfWeek.LUNES,
            end_day: DayOfWeek.VIERNES,
            opening_hour: new Date("2024-01-01T08:00:00Z"),
            closing_hour: new Date("2024-01-01T18:00:00Z"),
            status: true,
          },
        });

        const token = await tokenSign(user);
        console.log("✅ Usuario creado:");
        console.log(`👤 Username: ${username}`);
        console.log(`🔑 Password: ${plaintextPassword}`);
        console.log(`🌍 Tenant: ${tenant.name}`);
        console.log(`🎭 Rol: ${role.name}`);
        console.log(`🔐 Token: ${token}`);
        console.log("-----------------------------");
      }
    }
  }
};
