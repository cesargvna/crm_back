import { seedSystemAdmin } from "./00-seed-system-admin";
import { seedSectionsModules } from "./01-seed-sections-modules";
import { seedActions } from "./02-seed-actions";
import { seedTenants } from "./03-seed-tenants";
import { seedSubsidiaries } from "./04-seed-subsidiaries";
import { seedRoles } from "./05-seed-roles";
import { seedUsers } from "./06-seed-users";

async function main() {
  try {
    await seedSystemAdmin();
    console.log("✅ Seed: Usuario System.Admin");
  } catch (err) {
    console.error("❌ Error en seedSystemAdmin:", err);
  }

  try {
    await seedSectionsModules();
    console.log("✅ Seed: Sections + Modules + Submodules");
  } catch (err) {
    console.error("❌ Error en seedSectionsModules:", err);
  }

  try {
    await seedActions();
    console.log("✅ Seed: Actions");
  } catch (err) {
    console.error("❌ Error en seedActions:", err);
  }

  try {
    await seedTenants();
    console.log("✅ Seed: Tenants");
  } catch (err) {
    console.error("❌ Error en seedTenants:", err);
  }

  try {
    await seedSubsidiaries();
    console.log("✅ Seed: Subsidiaries + Schedules");
  } catch (err) {
    console.error("❌ Error en seedSubsidiaries:", err);
  }

  try {
    await seedRoles();
    console.log("✅ Seed: Roles + Permisos (super.admin)");
  } catch (err) {
    console.error("❌ Error en seedRoles:", err);
  }

  try {
    await seedUsers();
    console.log("✅ Seed: Users + ScheduleUser");
  } catch (err) {
    console.error("❌ Error en seedUsers:", err);
  }
}

main().finally(() => {
  process.exit(0);
});
