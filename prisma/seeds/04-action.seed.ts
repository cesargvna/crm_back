import prisma from "../../src/utils/prisma";
import { PermissionAction } from "../../generated/prisma"; // 👈 Asegúrate de importar bien

export async function seedActions(): Promise<PermissionAction[]> {
  console.log('🚀 Starting PermissionActions seed...');

  const actionsList = [
    'ver',
    'crear',
    'editar',
    'eliminar',
    'estado',
    'exportar',
    'importar',
  ];

  const results: PermissionAction[] = [];

  for (const name of actionsList) {
    const action = await prisma.permissionAction.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    results.push(action);
    console.log(`✅ Action: ${action.name} ready`);
  }

  console.log('🎉 Actions seeding done.');
  return results; // ⬅️ Devuelve con todos los campos
}
