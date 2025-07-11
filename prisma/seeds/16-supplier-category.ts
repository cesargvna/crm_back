// prisma/seeds/16-supplier-category.seed.ts

import prisma from "../../src/utils/prisma";
import { SupplierCategory, Subsidiary } from "../../generated/prisma"; // Ajusta tu import si no usas tipos generados

export async function seedSupplierCategories(subsidiaries: Subsidiary[]) {
  console.log("⏳ Seeding supplier categories...");

  const categories = [
    { name: "Papelería", description: "Proveedores de útiles escolares, artículos de oficina, cuadernos, etc." },
    { name: "Tecnología", description: "Proveedores de laptops, tablets, impresoras, cables, accesorios, etc." },
    { name: "Mobiliario", description: "Escritorios, sillas, estanterías, vitrinas, etc." },
    { name: "Servicios Generales", description: "Proveedores de servicios como limpieza, seguridad, mantenimiento, etc." },
    { name: "Imprenta / Publicidad", description: "Proveedores de impresión, gigantografías, folletos, señalética, etc." },
    { name: "Logística y Transporte", description: "Empresas de transporte, distribución o fletes." },
    { name: "Material Educativo", description: "Editoriales, proveedores de libros, recursos educativos." },
    { name: "Servicios Tecnológicos", description: "Soporte técnico, software, licencias, consultoría TI, etc." },
    { name: "Proveedores de Cafetería", description: "Alimentos, bebidas, catering o snack para la oficina o eventos." },
    { name: "Construcción / Obra Civil", description: "Reformas, arreglos, instalaciones, adecuación de espacios." },
    { name: "Seguridad / CCTV", description: "Cámaras, alarmas, sistemas de seguridad física o electrónica." },
    { name: "Servicios Financieros", description: "Proveedores de seguros, asesorías contables, o servicios bancarios." },
    { name: "Proveedores Variados", description: "Proveedores que no encajan en otra categoría o de servicios puntuales." },
  ];

  const createdSupplierCategories: SupplierCategory[] = [];

  for (const subsidiary of subsidiaries) {
    if (
      subsidiary.id === "00000000-0000-0000-0000-000000000000" ||
      subsidiary.tenantId === "00000000-0000-0000-0000-000000000000"
    ) {
      console.log(`⏭️ Skipping subsidiary ${subsidiary.id} with tenant ${subsidiary.tenantId}`);
      continue;
    }

    for (const category of categories) {
      const supplierCategory = await prisma.supplierCategory.upsert({
        where: {
          name_tenantId_subsidiaryId: {
            name: category.name.toLowerCase(),
            tenantId: subsidiary.tenantId,
            subsidiaryId: subsidiary.id,
          },
        },
        update: {},
        create: {
          name: category.name.toLowerCase(),
          description: category.description,
          tenantId: subsidiary.tenantId,
          subsidiaryId: subsidiary.id,
          status: true,
        },
      });

      createdSupplierCategories.push(supplierCategory);
    }
  }

  console.log(`✅ Supplier categories seeded: ${createdSupplierCategories.length}`);
  return createdSupplierCategories;
}
