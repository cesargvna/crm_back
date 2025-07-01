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
  await scheduleSubsidiaries(subsidiaries); 
  const actions = await seedActions();
  const sections = await seedSections();
  const allowedActions = await seedAllowedActions(sections, actions);
  const roles = await seedRolesAndPermissions(tenants, subsidiaries, allowedActions);

  const users = await seedUsers(roles, subsidiaries);
  await seedScheduleUsers(users); 
  
  console.log("✅ Seeding completed.");
}

main().catch((err) => {
  console.error("❌ Error in seed:", err);
  process.exit(1);
});