// seeds/seedUsers.ts
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
  console.log("\n🌱 Seeding users by role, subsidiary and tenant...");

  const defaultPassword = await bcrypt.hash("Password123", 10);
  const createdUsers: SeededUser[] = [];

  for (const subsidiary of subsidiaries) {
    const { id: subsidiaryId, tenantId } = subsidiary;
    const roles = rolesBySubsidiary[subsidiaryId];

    for (const [roleName, role] of Object.entries(roles)) {
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
          description: "Automatically generated user",
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

  console.log("✅ User seeding completed.\n");
  return createdUsers;
};
