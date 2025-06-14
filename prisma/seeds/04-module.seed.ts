import prisma from "../../src/utils/prisma";
import normalize from "normalize-text";
import { ModuleGroup, PermissionSection } from "../../generated/prisma";

type SeedModule = {
  name: string;
  route: string | null;
  iconName: string;
  sectionName: string;
};

export async function seedModules(
  sections: PermissionSection[]
): Promise<(ModuleGroup & { section: PermissionSection })[]> {
  console.log("⏳ Seeding permission modules...");

  const modules: SeedModule[] = [
    { name: "Tenant", route: "/tenants", iconName: "DashboardCustomizeIcon", sectionName: "Administracion" },
    
    { name: "Dashboard", route: "/dashboard", iconName: "DashboardCustomizeIcon", sectionName: "Dashboard" },

    { name: "Caja", route: "/cash", iconName: "AccountBalanceWalletIcon", sectionName: "Ventas" },
    { name: "Ventas", route: "/sales", iconName: "PointOfSaleIcon", sectionName: "Ventas" },
    { name: "Cotizaciones", route: "/quotation", iconName: "RequestQuoteIcon", sectionName: "Ventas" },
    { name: "Devoluciones", route: "/return", iconName: "ReplayCircleFilledIcon", sectionName: "Ventas" },

    { name: "Clientes", route: "/clients", iconName: "PeopleAltIcon", sectionName: "Clientes" },
    { name: "Categoría de Clientes", route: "/client-categories", iconName: "GroupWorkIcon", sectionName: "Clientes" },

    { name: "Compras", route: "/purchases", iconName: "ShoppingBagIcon", sectionName: "Compras" },
    { name: "Proveedores", route: "/suppliers", iconName: "LocalMallIcon", sectionName: "Compras" },
    { name: "Categoría de Proveedores", route: "/supplier-categories", iconName: "Diversity3Icon", sectionName: "Compras" },

    { name: "Productos", route: "/products", iconName: "Inventory2Icon", sectionName: "Almacen" },
    { name: "Categoría de Productos", route: "/product-categories", iconName: "CategoryIcon", sectionName: "Almacen" },
    { name: "Tipo de Moneda", route: "/currency", iconName: "AttachMoneyIcon", sectionName: "Almacen" },
    { name: "Tipos de precio", route: "/price-types", iconName: "PriceChangeIcon", sectionName: "Almacen" },
    { name: "Unidad de medida", route: "/unit-measurement", iconName: "StraightenIcon", sectionName: "Almacen" },
    { name: "Tipo de cambio", route: "/exchange-rate", iconName: "CurrencyExchangeIcon", sectionName: "Almacen" },
    { name: "Inventario", route: "/inventory", iconName: "Inventory2Icon", sectionName: "Almacen" },

    { name: "Datos de la empresa", route: "/company", iconName: "BusinessCenterIcon", sectionName: "Empresa" },
    { name: "Sucursales", route: "/subsidiary", iconName: "StoreIcon", sectionName: "Empresa" },

    { name: "Usuarios", route: "/users", iconName: "PersonOutlineIcon", sectionName: "Usuarios y Roles" },
    { name: "Roles", route: "/roles", iconName: "AdminPanelSettingsIcon", sectionName: "Usuarios y Roles" },

    { name: "Gastos", route: "/expenses", iconName: "PaymentsOutlinedIcon", sectionName: "Finanzas" },
    { name: "Categorías de gastos", route: "/expense-categories", iconName: "CategoryIcon", sectionName: "Finanzas" },
    { name: "Ingresos extraordinarios", route: "/income", iconName: "PaidIcon", sectionName: "Finanzas" },
    { name: "Categoría de Ingresos", route: "/income-categories", iconName: "Diversity3Icon", sectionName: "Finanzas" },

    // Módulos de Reportes (agrupadores sin ruta propia)
    { name: "Ventas", route: null, iconName: "BarChartIcon", sectionName: "Reportes" },
    { name: "Clientes", route: null, iconName: "SummarizeIcon", sectionName: "Reportes" },
    { name: "Compras", route: null, iconName: "InsightsOutlinedIcon", sectionName: "Reportes" },
    { name: "Sucursales", route: null, iconName: "SummarizeIcon", sectionName: "Reportes" },
    { name: "Usuarios", route: null, iconName: "PersonOutlineIcon", sectionName: "Reportes" },
    { name: "Finanzas", route: null, iconName: "PaidIcon", sectionName: "Reportes" },
  ];

  const results: (ModuleGroup & { section: PermissionSection })[] = [];

  for (const mod of modules) {
    const normalized = normalize(mod.name.trim());
    const section = sections.find((s) => normalize(s.name) === normalize(mod.sectionName));

    if (!section) {
      console.log(`❌ Section "${mod.sectionName}" not found for module "${mod.name}"`);
      continue;
    }

    const existing = await prisma.moduleGroup.findFirst({
      where: {
        name: { equals: normalized, mode: "insensitive" },
        sectionId: section.id,
      },
      include: { section: true }, // ✅ necesario para seedSubmodules
    });

    if (existing) {
      console.log(`⚠️ Module "${mod.name}" already exists in section "${mod.sectionName}"`);
      results.push(existing);
      continue;
    }

    const created = await prisma.moduleGroup.create({
      data: {
        name: normalized,
        route: mod.route,
        iconName: mod.iconName,
        sectionId: section.id,
      },
      include: { section: true }, // ✅ para usar después en submodules
    });

    console.log(`✅ Created module "${created.name}" under section "${mod.sectionName}"`);
    results.push(created);
  }

  return results;
}
