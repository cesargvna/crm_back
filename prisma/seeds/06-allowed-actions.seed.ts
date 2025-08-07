import prisma from "../../src/utils/prisma";
import { PermissionAction, Section } from "../../generated/prisma";

// Mapa detallado basado en tu tabla
const allowedActionsMap: Record<string, string[]> = {
  // Dashboard
  "Dashboard:Dashboard": ["ver", "exportar"],

  // Ventas
  "Ventas:Caja": ["ver", "crear", "editar", "estado"],
  "Ventas:Ventas": ["ver", "crear", "editar", "estado", "exportar"],
  "Ventas:Cotizaciones": ["ver", "crear", "editar", "eliminar", "exportar"],
  "Ventas:Devoluciones": ["ver", "crear", "editar", "eliminar"],

  // Clientes
  "Clientes:Clientes": ["ver", "crear", "editar", "estado"],
  "Clientes:Categoria de Clientes": ["ver", "crear", "editar", "estado"],

  // Compras
  "Compras:Compras": ["ver", "crear", "editar", "estado"],
  "Compras:Proveedores": ["ver", "crear", "editar", "estado"],
  "Compras:Categoria de Proveedores": ["ver", "crear", "editar", "estado"],

  // Almacen
  "Almacen:Productos": ["ver", "crear", "editar", "estado", "importar"],
  "Almacen:Categoria de Productos": ["ver", "crear", "editar", "estado"],
  "Almacen:Tipo de Moneda": ["ver", "crear", "editar", "estado"],
  "Almacen:Tipos de precio": ["ver", "crear", "editar", "estado"],
  "Almacen:Unidad de medida": ["ver", "crear", "editar", "estado"],
  "Almacen:Tipo de cambio": ["ver", "crear", "editar", "estado"],
  "Almacen:Inventario": ["ver", "crear", "editar", "estado", "exportar"],

  // Empresa
  "Empresa:Datos de la empresa": ["ver"],
  "Empresa:Sucursales": ["ver", "crear", "editar", "estado"],

  // Usuarios y Roles
  "Usuarios y Roles:Usuarios": ["ver", "crear", "editar", "estado"],
  "Usuarios y Roles:Roles": ["ver", "crear", "editar", "estado"],

  // Finanzas
  "Finanzas:Gastos": ["ver", "crear", "editar"],
  "Finanzas:Categorias de gastos": ["ver", "crear", "editar", "estado"],
  "Finanzas:Ingresos extraordinarios": ["ver", "crear", "editar"],
  "Finanzas:Categoria de Ingresos": ["ver", "crear", "editar", "estado"],

  // Reportes → submodules
  "Reportes:Cierres de Caja": ["ver", "exportar"],
  "Reportes:Actividad de Ventas": ["ver", "exportar"],
  "Reportes:Inactividad de productos": ["ver", "exportar"],
  "Reportes:Ventas por producto": ["ver", "exportar"],
  "Reportes:Actividad de Clientes": ["ver", "exportar"],
  "Reportes:Compras por proveedor": ["ver", "exportar"],
  "Reportes:Compras por producto": ["ver", "exportar"],
  "Reportes:Actividad por sucursal": ["ver", "exportar"],
  "Reportes:Actividad por usuario": ["ver", "exportar"],
  "Reportes:Reporte de gastos": ["ver", "exportar"],
  "Reportes:Reporte de ingresos": ["ver", "exportar"],

  // Administracion
  "Administracion:Tenant": ["ver", "crear", "editar", "eliminar", "estado"],
  "Administracion:Configuracion": ["ver", "editar"],
};

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
  console.log("\n🚀 Starting AllowedActions seed (MAP BASED)...");

  const allowedActionsData: any[] = [];

  for (const section of sections) {
    for (const module of section.modules) {
      if (module.submodules.length > 0) {
        // Tiene submódulos: se busca cada sub módulo con clave: Section:Submodule
        for (const sub of module.submodules) {
          const key = `${section.name}:${sub.name}`;
          const allowed = allowedActionsMap[key] || [];

          for (const action of actions) {
            if (allowed.includes(action.name)) {
              allowedActionsData.push({
                submoduleId: sub.id,
                actionId: action.id,
                compositeKey: `${sub.id}_${action.id}`,
              });
              console.log(`✅ AllowedAction: ${key} -> ${action.name}`);
            }
          }
        }
      } else {
        // No tiene submódulos: clave Section:Module
        const key = `${section.name}:${module.name}`;
        const allowed = allowedActionsMap[key] || [];

        for (const action of actions) {
          if (allowed.includes(action.name)) {
            allowedActionsData.push({
              moduleId: module.id,
              actionId: action.id,
              compositeKey: `${module.id}_${action.id}`,
            });
            console.log(`✅ AllowedAction: ${key} -> ${action.name}`);
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
