// prisma/seeders/03-user.seed.ts
import prisma from "../../src/utils/prisma";
import bcrypt from "bcryptjs";
import normalize from "normalize-text";
import { fakerES as faker } from "@faker-js/faker";
import { User } from "../../generated/prisma";

// ---------- helpers ----------
const USER_MIN = 3;
const USER_MAX = 10;

const toUpperNormalized = (s?: string | null) =>
  s ? normalize(s).replace(/\s+/g, " ").trim().toUpperCase() : null;

const onlyDigits = (s?: string | null) => (s ?? "").replace(/\D/g, "");

const cleanUsername = (s: string) =>
  normalize(s).toLowerCase().replace(/[^a-z0-9]/g, "");

function padUsernameToRange(base: string): string {
  let u = cleanUsername(base);
  if (u.length < USER_MIN) u = (u + "user").slice(0, USER_MIN);
  if (u.length > USER_MAX) u = u.slice(0, USER_MAX);
  return u;
}

function withSuffix(base: string, n: number) {
  const s = String(n);
  // si base ya está al límite, recorta para que entre el sufijo (<= 10)
  return (base.slice(0, USER_MAX - s.length) + s).slice(0, USER_MAX);
}

async function genUniqueUsername(seedA: string, seedB?: string): Promise<string> {
  const baseA = padUsernameToRange(seedA);
  const existsA = await prisma.user.findUnique({ where: { username: baseA } });
  if (!existsA) return baseA;

  // variantes con sufijos 2..9999
  for (let i = 2; i <= 9999; i++) {
    const cand = withSuffix(baseA, i);
    const exists = await prisma.user.findUnique({ where: { username: cand } });
    if (!exists) return cand;
  }

  if (seedB) {
    const baseB = padUsernameToRange(seedB);
    const existsB = await prisma.user.findUnique({ where: { username: baseB } });
    if (!existsB) return baseB;

    for (let i = 2; i <= 9999; i++) {
      const cand = withSuffix(baseB, i);
      const exists = await prisma.user.findUnique({ where: { username: cand } });
      if (!exists) return cand;
    }
  }

  throw new Error("No se pudo generar un username único después de varios intentos.");
}

const randomCellBolivia = () => `+591 6${faker.string.numeric(7)}`; // ej: "+591 6XXXXXXX"
// ---------- helpers ----------

export const seedUsers = async (
  rolesBySubsidiary: Record<string, Record<string, any>>,
  subsidiaries: { id: string; tenantId: string }[]
): Promise<User[]> => {
  console.log("\n🌱 Seeding users by role, subsidiary, and tenant...");

  const defaultPassword = await bcrypt.hash("123456789", 10);
  const createdUsers: User[] = [];

  const fixedTenantId = "00000000-0000-0000-0000-000000000000";
  const fixedSubsidiaryId = "00000000-0000-0000-0000-000000000000";

  // ---- Usuario fijo System.Admin (tenant/subsidiary fijos) ----
  const systemAdminRole = await prisma.role.findFirst({
    where: {
      name: "System.Admin",
      tenantId: fixedTenantId,
      subsidiaryId: fixedSubsidiaryId,
    },
  });
  if (!systemAdminRole) throw new Error("❌ System.Admin role not found.");

  const sysUsername = "sysadmin"; // válido [a-z0-9], 3–10
  const existingSystemAdminUser = await prisma.user.findUnique({
    where: { username: sysUsername },
  });

  if (!existingSystemAdminUser) {
    const sysAdminUser = await prisma.user.create({
      data: {
        username: sysUsername,
        password: defaultPassword,
        name: toUpperNormalized("System Admin")!, // un solo campo 'name'
        description: toUpperNormalized("Unique system admin user"),
        roleId: systemAdminRole.id,
        subsidiaryId: fixedSubsidiaryId,
        tenantId: fixedTenantId,
        email: "system@admin.com",
        cellphone: "+591 60000000",
        isNopCommerce: false,
        status: true,
      },
    });
    createdUsers.push(sysAdminUser);
    console.log(`✅ System.Admin user created: ${sysUsername}`);
  } else {
    console.log("⚠️ System.Admin user already exists.");
    createdUsers.push(existingSystemAdminUser);
  }

  // ---- Usuarios por cada subsidiaria/rol (excepto System.Admin) ----
  for (const { id: subsidiaryId, tenantId } of subsidiaries) {
    if (tenantId === fixedTenantId && subsidiaryId === fixedSubsidiaryId) continue;

    const roles = rolesBySubsidiary[subsidiaryId] ?? {};
    for (const [roleName, role] of Object.entries(roles)) {
      if (roleName === "System.Admin") continue;

      // Generar nombre y username válidos
      const first = faker.person.firstName();
      const last = faker.person.lastName();
      const uname = await genUniqueUsername(first, last);

      const name = toUpperNormalized(`${first} ${last}`)!;
      const email = faker
        .internet
        .email({ firstName: first, lastName: last })
        .toLowerCase()
        .slice(0, 255);

      const user = await prisma.user.create({
        data: {
          username: uname,
          password: defaultPassword,
          name,
          jobPosition: toUpperNormalized("Empleado"),
          description: toUpperNormalized(`User for role ${roleName}`),
          address: toUpperNormalized(faker.location.streetAddress()),
          email,

          ci: onlyDigits(faker.string.numeric(8)),
          nit: onlyDigits(faker.string.numeric(7)),

          cellphone: randomCellBolivia(),

          roleId: role.id,
          subsidiaryId,
          tenantId,

          isNopCommerce: false,
          status: true,
        },
      });

      createdUsers.push(user);
      console.log(`✅ User ${uname} created for role ${roleName} in subsidiary ${subsidiaryId}`);
    }
  }

  console.log("\n✅ All user seeding completed.\n");
  return createdUsers;
};