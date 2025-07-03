import prisma from "../../src/utils/prisma";
import bcrypt from "bcryptjs";
import normalize from "normalize-text";
import { fakerES as faker } from "@faker-js/faker";

export type SeededUser = {
  id: string;
  tenantId: string;
  subsidiaryId: string;
};

export const seedUsers = async (
  rolesBySubsidiary: Record<string, Record<string, any>>,
  subsidiaries: { id: string; tenantId: string }[]
): Promise<SeededUser[]> => {
  console.log("\n🌱 Seeding users by role, subsidiary, and tenant...");

  const defaultPassword = await bcrypt.hash("123456789", 10);
  const createdUsers: SeededUser[] = [];

  const fixedTenantId = "00000000-0000-0000-0000-000000000000";
  const fixedSubsidiaryId = "00000000-0000-0000-0000-000000000000";

  // === System.Admin user único ===
  const systemAdminRole = await prisma.role.findFirst({
    where: {
      name: "System.Admin",
      tenantId: fixedTenantId,
      subsidiaryId: fixedSubsidiaryId,
    },
  });

  if (!systemAdminRole) {
    throw new Error("❌ System.Admin role not found. Run seedRolesAndPermissions first.");
  }

  const existingSystemAdminUser = await prisma.user.findFirst({
    where: { username: "system.admin" },
  });

  if (!existingSystemAdminUser) {
    const sysAdminUser = await prisma.user.create({
      data: {
        username: "system.admin",
        password: defaultPassword,
        name: "System",
        lastname: "Admin",
        description: "Unique system admin user",
        roleId: systemAdminRole.id,
        subsidiaryId: fixedSubsidiaryId,
        tenantId: fixedTenantId,
        email: "system@admin.com",
      },
      select: { id: true },
    });

    createdUsers.push({
      id: sysAdminUser.id,
      tenantId: fixedTenantId,
      subsidiaryId: fixedSubsidiaryId,
    });

    console.log(`✅ System.Admin user created: system.admin`);
  } else {
    console.log("⚠️ System.Admin user already exists.");
  }

  // === Usuarios por rol por Subsidiary (saltando la fija) ===
  for (const subsidiary of subsidiaries) {
    if (subsidiary.tenantId === fixedTenantId && subsidiary.id === fixedSubsidiaryId) {
      console.log(`🔒 Skipping users for fixed Subsidiary ${subsidiary.id}`);
      continue;
    }

    const { id: subsidiaryId, tenantId } = subsidiary;
    const roles = rolesBySubsidiary[subsidiaryId];

    for (const [roleName, role] of Object.entries(roles)) {
      if (roleName === "System.Admin") continue; // Nunca crear más System.Admin

      let username;
      let attempts = 0;

      do {
        const nombre = faker.person.firstName();
        const apellido = faker.person.lastName();
        const num = Math.random() < 0.3 ? faker.number.int({ min: 10, max: 99 }) : "";
        username = `${nombre}.${apellido}${num}`
          .toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9.]/g, "")
          .slice(0, 20);

        attempts++;
      } while (
        attempts < 5 &&
        (await prisma.user.findUnique({ where: { username } }))
      );

      if (attempts >= 5) {
        console.warn(`⚠️ Could not generate unique username for role ${roleName} in subsidiary ${subsidiaryId}`);
        continue;
      }

      const name = faker.person.firstName().slice(0, 20);
      const lastname = faker.person.lastName().slice(0, 20);
      const email = faker.internet.email({ firstName: name, lastName: lastname }).slice(0, 20);
      const address = faker.location.streetAddress().slice(0, 100);

      const user = await prisma.user.create({
        data: {
          username,
          password: defaultPassword,
          name: normalize(name),
          lastname: normalize(lastname),
          email,
          ci: faker.string.numeric(8),
          nit: faker.string.numeric(7),
          address,
          cellphone: `7${faker.string.numeric(7)}`.slice(0, 20),
          telephone: `2${faker.string.numeric(6)}`.slice(0, 20),
          description: `User for role ${roleName}`,
          roleId: role.id,
          subsidiaryId,
          tenantId,
        },
        select: { id: true },
      });

      createdUsers.push({ id: user.id, tenantId, subsidiaryId });
      console.log(`✅ User ${username} created for role ${roleName} in subsidiary ${subsidiaryId}`);
    }
  }

  console.log("\n✅ All user seeding completed.\n");
  return createdUsers;
};
