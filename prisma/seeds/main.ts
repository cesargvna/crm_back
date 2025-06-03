// prisma/seeds/main.ts
import { seedSectionsModules } from "./01-seed-sections-modules";
// Puedes agregar los demás cuando los tengas listos

async function main() {
  await seedSectionsModules();
  console.log("✅ Seed: Sections + Modules + Submodules");
}

main().catch((err) => {
  console.error("❌ Error al ejecutar el seeder:", err);
  process.exit(1);
});