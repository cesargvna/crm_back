import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { DayOfWeek, PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

export const seedUsers = async () => {
  const tenants = await prisma.tenant.findMany();

  const roles = await prisma.role.findMany({
    where: {
      NOT: { name: "SYSTEM_ADMIN" },
    },
  });

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

        const exists = await prisma.user.findFirst({
          where: { username, tenantId: tenant.id },
        });

        if (exists) {
          console.log(`⏩ Usuario ya existe: ${username}`);
          continue;
        }

        const hashedPassword = await bcrypt.hash("12345678", 10);
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

        console.log(`✅ Usuario creado: ${username} (${tenant.name} / ${role.name})`);
      }
    }
  }
};
