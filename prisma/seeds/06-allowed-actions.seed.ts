import prisma from "../../src/utils/prisma";
import { PermissionAction, Section } from "../../generated/prisma";

export async function seedAllowedActions(
  sections: (Section & {
    modules: {
      id: string;
      name: string;
      submodules: { id: string; name: string }[];
    }[];
  })[],
  actions: PermissionAction[]
) {
  console.log("\n🚀 Starting AllowedActions seed...");

  const allowedActionsData: any[] = [];

  for (const section of sections) {
    for (const module of section.modules) {
      if (module.submodules.length > 0) {
        // 🔑 Si tiene submódulos → solo se aplican acciones a submódulos
        for (const sub of module.submodules) {
          for (const action of actions) {
            if (action.name === "ver" || action.name === "exportar") {
              allowedActionsData.push({
                submoduleId: sub.id,
                actionId: action.id,
                compositeKey: `${sub.id}_${action.id}`,
              });
              console.log(`✅ AllowedAction for submodule ${sub.name}: ${action.name}`);
            }
          }
        }
      } else {
        // 🔑 Si NO tiene submódulos → permitir solo ver, crear, editar, estado
        for (const action of actions) {
          if (["ver", "crear", "editar", "estado"].includes(action.name)) {
            allowedActionsData.push({
              moduleId: module.id,
              actionId: action.id,
              compositeKey: `${module.id}_${action.id}`,
            });
            console.log(`✅ AllowedAction for module ${module.name}: ${action.name}`);
          }
        }
      }
    }
  }

  if (allowedActionsData.length > 0) {
    await prisma.allowedAction.createMany({
      data: allowedActionsData,
      skipDuplicates: true,
    });
    console.log(`🎉 ${allowedActionsData.length} AllowedActions inserted.`);
  } else {
    console.log("⚠️ No AllowedActions to insert.");
  }

  console.log("✅ AllowedActions seeding completed.\n");
  return allowedActionsData;
}
