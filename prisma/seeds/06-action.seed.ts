import prisma from "../../src/utils/prisma";
import normalize from "normalize-text";
import { PermissionAction } from "../../generated/prisma";

const actions: string[] = [
  "ver",
  "crear",
  "editar",
  "estado",
  "exportar",
  "eliminar",
];

export async function seedActions(): Promise<PermissionAction[]> {
  console.log("⏳ Seeding permission actions...");

  const results: PermissionAction[] = [];

  for (const actionName of actions) {
    const normalized = normalize(actionName.trim());

    const existing = await prisma.permissionAction.findFirst({
      where: {
        name: { equals: normalized, mode: "insensitive" },
      },
    });

    if (existing) {
      console.log(`⚠️ Action "${actionName}" already exists`);
      results.push(existing);
      continue;
    }

    const created = await prisma.permissionAction.create({
      data: { name: normalized },
    });

    console.log(`✅ Created action "${created.name}"`);
    results.push(created);
  }

  return results;
}