import { seedTenant } from "./seeds/01-tenant.seed";
import { seedSubsidiaries } from "./seeds/02-subsidiary.seed";
import { seedSections } from "./seeds/03-section.seed";
import { seedModules } from "./seeds/04-module.seed";
import { seedSubmodules } from "./seeds/05-submodule.seed";
import { seedActions } from "./seeds/06-action.seed";
import { seedRoles } from "./seeds/07-role.seed";
import { seedRolePermissions } from "./seeds/08-role-permission.seed";
import { scheduleSubsidiaries } from "./seeds/09-schedule-subsidiaries";
import { seedUsers } from "./seeds/10-user.seed";

async function main() {
  console.log("🌱 Seeding started...");

  const tenants = await seedTenant();
  const subsidiary = await seedSubsidiaries(tenants);
  await scheduleSubsidiaries(subsidiary);
  const sections = await seedSections();
  const modules = await seedModules(sections);
  const submodules = await seedSubmodules(modules);
  const actions = await seedActions();
  const roles = await seedRoles(tenants, subsidiary);
  await seedRolePermissions(roles, actions, sections, modules, submodules);
  await seedUsers(roles, subsidiary);
  
  console.log("✅ Seeding completed.");
}

main().catch((err) => {
  console.error("❌ Error in seed:", err);
  process.exit(1);
});