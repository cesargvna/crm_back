import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "../../generated/prisma";
const prisma = new PrismaClient();

export const seedSectionsModules = async () => {
  const data = [
    {
      sectionName: "Dashboard",
      order: 0,
      modules: [
        {
          name: "Dashboard",
          route: "/dashboard",
          submodules: [],
        },
      ],
    },
    {
      sectionName: "Ventas",
      order: 1,
      modules: [
        { name: "Caja", route: "/cash", submodules: [] },
        { name: "Ventas", route: "/sales", submodules: [] },
        { name: "Cotizaciones", route: "/quotation", submodules: [] },
        { name: "Devoluciones", route: "/return", submodules: [] },
      ],
    },
    {
      sectionName: "Clientes",
      order: 2,
      modules: [
        { name: "Clientes", route: "/clients", submodules: [] },
        {
          name: "Categoría de Clientes",
          route: "/client-categories",
          submodules: [],
        },
      ],
    },
    {
      sectionName: "Compras",
      order: 3,
      modules: [
        { name: "Compras", route: "/purchase", submodules: [] },
        { name: "Proveedores", route: "/supplier", submodules: [] },
        {
          name: "Categoría de Proveedores",
          route: "/supplier-categories",
          submodules: [],
        },
      ],
    },
    {
      sectionName: "Almacen",
      order: 4,
      modules: [
        { name: "Productos", route: "/product", submodules: [] },
        {
          name: "Categoría de Productos",
          route: "/product-categories",
          submodules: [],
        },
        { name: "Tipo de Moneda", route: "/currency", submodules: [] },
        { name: "Tipos de precio", route: "/price-types", submodules: [] },
        {
          name: "Unidad de medida",
          route: "/unit-measurement",
          submodules: [],
        },
        { name: "Tipo de cambio", route: "/exchange-rate", submodules: [] },
        { name: "Inventario", route: "/inventory", submodules: [] },
      ],
    },
    {
      sectionName: "Empresa",
      order: 5,
      modules: [
        { name: "Datos de la empresa", route: "/company", submodules: [] },
        { name: "Sucursales", route: "/subsidiary", submodules: [] },
      ],
    },
    {
      sectionName: "Usuarios y Roles",
      order: 6,
      modules: [
        { name: "Usuarios", route: "/user", submodules: [] },
        { name: "Roles", route: "/role", submodules: [] },
      ],
    },
    {
      sectionName: "Finanzas",
      order: 7,
      modules: [
        { name: "Gastos", route: "/expense", submodules: [] },
        {
          name: "Categorías de gastos",
          route: "/expense-categories",
          submodules: [],
        },
        { name: "Ingresos extraordinarios", route: "/income", submodules: [] },
        {
          name: "Categoría de Ingresos",
          route: "/income-categories",
          submodules: [],
        },
      ],
    },
    {
      sectionName: "Reportes",
      order: 8,
      modules: [
        {
          name: "Ventas",
          route: "/report/sales",
          submodules: [
            { name: "Cierres de Caja", route: "/report/sales/cash-closures" },
            { name: "Actividad de Ventas", route: "/report/sales/activity" },
            {
              name: "Inactividad de productos",
              route: "/report/sales/inactive-products",
            },
            { name: "Ventas por producto", route: "/report/sales/by-product" },
          ],
        },
        {
          name: "Clientes",
          route: "/report/clients",
          submodules: [
            {
              name: "Actividad de Clientes",
              route: "/report/clients/activity",
            },
          ],
        },
        {
          name: "Compras",
          route: "/report/purchase",
          submodules: [
            {
              name: "Compras por proveedor",
              route: "/report/purchase/by-supplier",
            },
            {
              name: "Compras por producto",
              route: "/report/purchase/by-product",
            },
          ],
        },
        {
          name: "Sucursales",
          route: "/report/subsidiaries",
          submodules: [
            {
              name: "Actividad por sucursal",
              route: "/report/subsidiaries/activity",
            },
          ],
        },
        {
          name: "Usuarios",
          route: "/report/users",
          submodules: [
            { name: "Actividad por usuario", route: "/report/users/activity" },
          ],
        },
        {
          name: "Finanzas",
          route: "/report/finance",
          submodules: [
            { name: "Reporte de gastos", route: "/report/finance/expenses" },
            { name: "Reporte de ingresos", route: "/report/finance/income" },
          ],
        },
      ],
    },
  ];

  for (const section of data) {
    const existing = await prisma.permissionSection.findFirst({
      where: { name: section.sectionName },
    });

    if (existing) {
      console.log(`⏩ Sección ya existe: ${section.sectionName}`);
      continue;
    }

    const sectionId = uuidv4();

    await prisma.permissionSection.create({
      data: {
        id: sectionId,
        name: section.sectionName,
        order: section.order,
        modules: {
          create: section.modules.map((mod) => {
            const moduleId = uuidv4();
            return {
              id: moduleId,
              name: mod.name,
              route: mod.route,
              iconName: "default-icon",
              submodules: {
                create: mod.submodules.map((sub) => ({
                  id: uuidv4(),
                  name: sub.name,
                  route: sub.route,
                })),
              },
            };
          }),
        },
      },
    });

    console.log(`✅ Sección creada: ${section.sectionName}`);
  }
};
