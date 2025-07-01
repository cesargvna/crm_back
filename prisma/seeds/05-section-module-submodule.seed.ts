import prisma from "../../src/utils/prisma";

export async function seedSections() {
  console.log('🚀 Starting Sections, Modules, and Submodules seed...');

  // 👉 Seed each section with its modules and submodules
  // NOTE: We're using create() per section, then fetching everything at the end for consistent IDs

  // SECTION: Dashboard
  await prisma.section.create({
    data: {
      name: 'Dashboard',
      order: 1,
      visibility: true,
      modules: {
        create: [
          {
            name: 'Dashboard',
            route: '/dashboard',
            iconName: 'DashboardCustomizeIcon',
          },
        ],
      },
    },
  });
  console.log('✅ Section created: Dashboard');

  // SECTION: Ventas
  await prisma.section.create({
    data: {
      name: 'Ventas',
      order: 2,
      visibility: true,
      modules: {
        create: [
          { name: 'Caja', route: '/cash', iconName: 'AccountBalanceWalletIcon' },
          { name: 'Ventas', route: '/sales', iconName: 'PointOfSaleIcon' },
          { name: 'Cotizaciones', route: '/quotation', iconName: 'RequestQuoteIcon' },
          { name: 'Devoluciones', route: '/return', iconName: 'ReplayCircleFilledIcon' },
        ],
      },
    },
  });
  console.log('✅ Section created: Ventas');

  // SECTION: Clientes
  await prisma.section.create({
    data: {
      name: 'Clientes',
      order: 3,
      visibility: true,
      modules: {
        create: [
          { name: 'Clientes', route: '/client', iconName: 'PeopleAltIcon' },
          { name: 'Categoria de Clientes', route: '/client-categories', iconName: 'GroupWorkIcon' },
        ],
      },
    },
  });
  console.log('✅ Section created: Clientes');

  // SECTION: Compras
  await prisma.section.create({
    data: {
      name: 'Compras',
      order: 4,
      visibility: true,
      modules: {
        create: [
          { name: 'Compras', route: '/purchase', iconName: 'ShoppingBagIcon' },
          { name: 'Proveedores', route: '/supplier', iconName: 'LocalMallIcon' },
          { name: 'Categoria de Proveedores', route: '/supplier-categories', iconName: 'Diversity3Icon' },
        ],
      },
    },
  });
  console.log('✅ Section created: Compras');

  // SECTION: Almacen
  await prisma.section.create({
    data: {
      name: 'Almacen',
      order: 5,
      visibility: true,
      modules: {
        create: [
          { name: 'Productos', route: '/product', iconName: 'Inventory2Icon' },
          { name: 'Categoria de Productos', route: '/product-categories', iconName: 'CategoryIcon' },
          { name: 'Tipo de Moneda', route: '/currency', iconName: 'AttachMoneyIcon' },
          { name: 'Tipos de precio', route: '/price-types', iconName: 'PriceChangeIcon' },
          { name: 'Unidad de medida', route: '/unit-measurement', iconName: 'StraightenIcon' },
          { name: 'Tipo de cambio', route: '/exchange-rate', iconName: 'CurrencyExchangeIcon' },
          { name: 'Inventario', route: '/inventory', iconName: 'Inventory2Icon' },
        ],
      },
    },
  });
  console.log('✅ Section created: Almacen');

  // SECTION: Empresa
  await prisma.section.create({
    data: {
      name: 'Empresa',
      order: 6,
      visibility: true,
      modules: {
        create: [
          { name: 'Datos de la empresa', route: '/company', iconName: 'BusinessCenterIcon' },
          { name: 'Sucursales', route: '/subsidiary', iconName: 'StoreIcon' },
        ],
      },
    },
  });
  console.log('✅ Section created: Empresa');

  // SECTION: Usuarios y Roles
  await prisma.section.create({
    data: {
      name: 'Usuarios y Roles',
      order: 7,
      visibility: true,
      modules: {
        create: [
          { name: 'Usuarios', route: '/user', iconName: 'PersonOutlineIcon' },
          { name: 'Roles', route: '/role', iconName: 'AdminPanelSettingsIcon' },
        ],
      },
    },
  });
  console.log('✅ Section created: Usuarios y Roles');

  // SECTION: Finanzas
  await prisma.section.create({
    data: {
      name: 'Finanzas',
      order: 8,
      visibility: true,
      modules: {
        create: [
          { name: 'Gastos', route: '/expense', iconName: 'PaymentsOutlinedIcon' },
          { name: 'Categorias de gastos', route: '/expense-categories', iconName: 'CategoryIcon' },
          { name: 'Ingresos extraordinarios', route: '/income', iconName: 'PaidIcon' },
          { name: 'Categoria de Ingresos', route: '/income-categories', iconName: 'Diversity3Icon' },
        ],
      },
    },
  });
  console.log('✅ Section created: Finanzas');

  // SECTION: Reportes
  await prisma.section.create({
    data: {
      name: 'Reportes',
      order: 9,
      visibility: true,
      modules: {
        create: [
          {
            name: 'Ventas',
            iconName: 'BarChartIcon',
            submodules: {
              create: [
                { name: 'Cierres de Caja', route: '/report/cash-closures' },
                { name: 'Actividad de Ventas', route: '/report/sales-activity' },
                { name: 'Inactividad de productos', route: '/report/inactive-products' },
                { name: 'Ventas por producto', route: '/report/sales-by-product' },
              ],
            },
          },
          {
            name: 'Clientes',
            iconName: 'SummarizeIcon',
            submodules: {
              create: [
                { name: 'Actividad de Clientes', route: '/report/client-activity' },
              ],
            },
          },
          {
            name: 'Compras',
            iconName: 'InsightsOutlinedIcon',
            submodules: {
              create: [
                { name: 'Compras por proveedor', route: '/report/purchases-by-supplier' },
                { name: 'Compras por producto', route: '/report/purchases-by-product' },
              ],
            },
          },
          {
            name: 'Sucursales',
            iconName: 'SummarizeIcon',
            submodules: {
              create: [
                { name: 'Actividad por sucursal', route: '/report/subsidiary-activity' },
              ],
            },
          },
          {
            name: 'Usuarios',
            iconName: 'PersonOutlineIcon',
            submodules: {
              create: [
                { name: 'Actividad por usuario', route: '/report/user-activity' },
              ],
            },
          },
          {
            name: 'Finanzas',
            iconName: 'PaidIcon',
            submodules: {
              create: [
                { name: 'Reporte de gastos', route: '/report/expense' },
                { name: 'Reporte de ingresos', route: '/report/income' },
              ],
            },
          },
        ],
      },
    },
  });
  console.log('✅ Section created: Reportes with Submodules');

  // SECTION: Administracion (hidden)
  await prisma.section.create({
    data: {
      name: 'Administracion',
      order: 99,
      visibility: false,
      modules: {
        create: [
          { name: 'Tenant', route: '/admin/tenant', iconName: 'GroupWorkIcon' },
          { name: 'Sucursales', route: '/admin/subsidiary', iconName: 'StoreIcon' },
          { name: 'Roles y Permisos', route: '/admin/roles-permissions', iconName: 'AdminPanelSettingsIcon' },
          { name: 'Configuracion', route: '/admin/settings', iconName: 'SettingsIcon' },
        ],
      },
    },
  });
  console.log('✅ Section created: Administracion (hidden)');

  // ✅ Finally: Return all sections with nested modules and submodules
  const sections = await prisma.section.findMany({
    include: {
      modules: {
        include: { submodules: true },
      },
    },
  });

  console.log('🎉 All Sections, Modules, and Submodules were seeded and loaded!');
  return sections;
}
