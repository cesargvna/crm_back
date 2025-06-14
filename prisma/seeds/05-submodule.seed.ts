// seeders/05-submodule.seed.ts
import prisma from "../../src/utils/prisma";
import normalize from "normalize-text";
import {
  SubmoduleGroup,
  PermissionSection,
  ModuleGroup,
} from "../../generated/prisma";

type SeedSubmodule = {
  name: string;
  route: string;
  moduleName: string;
  sectionName: string;
};

const submodules: SeedSubmodule[] = [
  {
    name: "Cierres de Caja",
    route: "/report/cash-closures",
    moduleName: "Ventas",
    sectionName: "Reportes",
  },
  {
    name: "Actividad de Ventas",
    route: "/report/sales-activity",
    moduleName: "Ventas",
    sectionName: "Reportes",
  },
  {
    name: "Inactividad de productos",
    route: "/report/inactive-products",
    moduleName: "Ventas",
    sectionName: "Reportes",
  },
  {
    name: "Ventas por producto",
    route: "/report/sales-by-product",
    moduleName: "Ventas",
    sectionName: "Reportes",
  },
  {
    name: "Actividad de Clientes",
    route: "/report/client-activity",
    moduleName: "Clientes",
    sectionName: "Reportes",
  },
  {
    name: "Compras por proveedor",
    route: "/report/purchases-by-supplier",
    moduleName: "Compras",
    sectionName: "Reportes",
  },
  {
    name: "Compras por producto",
    route: "/report/purchases-by-product",
    moduleName: "Compras",
    sectionName: "Reportes",
  },
  {
    name: "Actividad por sucursal",
    route: "/report/subsidiary-activity",
    moduleName: "Sucursales",
    sectionName: "Reportes",
  },
  {
    name: "Actividad por usuario",
    route: "/report/user-activity",
    moduleName: "Usuarios",
    sectionName: "Reportes",
  },
  {
    name: "Reporte de gastos",
    route: "/report/expenses",
    moduleName: "Finanzas",
    sectionName: "Reportes",
  },
  {
    name: "Reporte de ingresos",
    route: "/report/income",
    moduleName: "Finanzas",
    sectionName: "Reportes",
  },
];

type ModuleWithSection = ModuleGroup & { section: PermissionSection };

export async function seedSubmodules(
  modules: ModuleWithSection[]
): Promise<SubmoduleGroup[]> {
  console.log("⏳ Seeding submodules...");

  const results: SubmoduleGroup[] = [];

  for (const sub of submodules) {
    const normalizedName = normalize(sub.name.trim());
    const normalizedModuleName = normalize(sub.moduleName.trim());
    const normalizedSectionName = normalize(sub.sectionName.trim());

    const module = modules.find(
      (m) =>
        normalize(m.name) === normalizedModuleName &&
        m.section &&
        normalize(m.section.name) === normalizedSectionName
    );

    if (!module) {
      console.log(
        `❌ Module "${sub.moduleName}" in section "${sub.sectionName}" not found for submodule "${sub.name}"`
      );
      continue;
    }

    const existing = await prisma.submoduleGroup.findFirst({
      where: {
        name: { equals: normalizedName, mode: "insensitive" },
        moduleId: module.id,
      },
    });

    if (existing) {
      console.log(
        `⚠️ Submodule "${sub.name}" already exists in module "${sub.moduleName}"`
      );
      results.push(existing);
      continue;
    }

    const created = await prisma.submoduleGroup.create({
      data: {
        name: normalizedName,
        route: sub.route,
        moduleId: module.id,
      },
    });

    console.log(
      `✅ Created submodule "${created.name}" under module "${sub.moduleName}"`
    );
    results.push(created);
  }

  return results;
}
