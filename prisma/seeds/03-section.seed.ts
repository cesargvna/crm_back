import prisma from "../../src/utils/prisma";
import normalize from "normalize-text";
import { PermissionSection } from "../../generated/prisma";

export async function seedSections(): Promise<PermissionSection[]> {
  console.log("⏳ Seeding permission sections...");

  const sections = [
    { name: "Administracion", order: 0 },
    { name: "Dashboard", order: 1 },
    { name: "Ventas", order: 2 },
    { name: "Clientes", order: 3 },
    { name: "Compras", order: 4 },
    { name: "Almacen", order: 5 },
    { name: "Empresa", order: 6 },
    { name: "Usuarios y Roles", order: 7 },
    { name: "Finanzas", order: 8 },
    { name: "Reportes", order: 9 },
  ];

  const results: PermissionSection[] = [];

  for (const section of sections) {
    const normalized = normalize(section.name.trim());

    const existing = await prisma.permissionSection.findFirst({
      where: {
        name: { equals: normalized, mode: "insensitive" },
      },
    });

    if (existing) {
      console.log(`⚠️ Section "${section.name}" already exists`);
      results.push(existing);
      continue;
    }

    const created = await prisma.permissionSection.create({
      data: {
        name: normalized,
        order: section.order,
      },
    });

    console.log(`✅ Created permission section "${created.name}"`);
    results.push(created);
  }

  return results;
}
