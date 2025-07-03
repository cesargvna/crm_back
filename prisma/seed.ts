import prisma from "../src/utils/prisma";
import { seedTenant } from "./seeds/01-tenant.seed";
import { seedSubsidiaries } from "./seeds/02-subsidiary.seed";
import { scheduleSubsidiaries } from "./seeds/03-schedule-subsidiaries";
import { seedActions } from "./seeds/04-action.seed";
import { seedSections } from "./seeds/05-section-module-submodule.seed";
import { seedAllowedActions } from "./seeds/06-allowed-actions.seed";
import { seedRolesAndPermissions } from "./seeds/07-role.seed";

import { seedUsers } from "./seeds/10-user.seed";
import { seedScheduleUsers } from "./seeds/11-schedule-users.seed";

async function main() {
  console.log("🌱 Seeding started...");

  const tenants = await seedTenant();
  const subsidiaries = await seedSubsidiaries(tenants);
  const subsidiariesFull = await prisma.subsidiary.findMany({
    where: { id: { in: subsidiaries.map((s) => s.id) } },
  });

  await scheduleSubsidiaries(subsidiariesFull);
  const actions = await seedActions();
  const sections = await seedSections();
  const allowedActions = await seedAllowedActions(sections, actions);
  const roles = await seedRolesAndPermissions(tenants, subsidiariesFull, allowedActions);

  const users = await seedUsers(roles, subsidiariesFull);
  await seedScheduleUsers(users);

  console.log("✅ Seeding completed.");
}

main().catch((err) => {
  console.error("❌ Error in seed:", err);
  process.exit(1);
});
