// prisma/seeders/06-product.seed.ts
import prisma from "../../src/utils/prisma";
import normalize from "normalize-text";
import { Product, ProductCategory, UnitMeasurement } from "../../generated/prisma";

type SubsidiaryLite = { id: string; tenantId: string };

const FIXED_UUID = "00000000-0000-0000-0000-000000000000";

// Helpers
const toUpperNormalized = (s?: string | null) =>
  s ? normalize(s).replace(/\s+/g, " ").trim().toUpperCase() : null;

const validSubsidiaries = (subs: SubsidiaryLite[]) =>
  subs.filter((s) => s.id !== FIXED_UUID && s.tenantId !== FIXED_UUID);

// Productos base (agrega/edita aquí)
const BASE_PRODUCTS: Array<{
  code: string;
  barcode?: string | null;
  name: string;
  brand: string; // ← requerido por el schema
  description?: string | null;
}> = [
  { code: "LAP-BIC-BLU", barcode: "7701234567890", name: "Bolígrafo BIC Azul",  brand: "BIC",     description: "Bolígrafo punta fina color azul" },
  { code: "LAP-BIC-BLA", barcode: "7701234567891", name: "Bolígrafo BIC Negro", brand: "BIC",     description: "Bolígrafo punta fina color negro" },
  { code: "LAP-BIC-ROJ", barcode: "7701234567892", name: "Bolígrafo BIC Rojo",  brand: "BIC",     description: "Bolígrafo punta fina color rojo" },
  { code: "LAP-BIC-VER", barcode: "7701234567893", name: "Bolígrafo BIC Verde", brand: "BIC",     description: "Bolígrafo punta fina color verde" },

  { code: "RES-STA-BLU", barcode: "7701234567894", name: "Resaltador STA Azul",     brand: "STA",     description: "Resaltador color azul punta biselada" },
  { code: "RES-STA-AMA", barcode: "7701234567895", name: "Resaltador STA Amarillo", brand: "STA",     description: "Resaltador color amarillo punta biselada" },
  { code: "RES-STA-ROS", barcode: "7701234567896", name: "Resaltador STA Rosado",   brand: "STA",     description: "Resaltador color rosado punta biselada" },
  { code: "RES-STA-VER", barcode: "7701234567897", name: "Resaltador STA Verde",    brand: "STA",     description: "Resaltador color verde punta biselada" },

  { code: "MAR-PER-BLA", barcode: "7701234567898", name: "Marcador Permanente Negro", brand: "SHARPIE", description: "Marcador permanente punta fina color negro" },
  { code: "MAR-PER-ROJ", barcode: "7701234567899", name: "Marcador Permanente Rojo",  brand: "SHARPIE", description: "Marcador permanente punta fina color rojo" },
];

export async function seedProducts(
  subsidiaries: SubsidiaryLite[],
  _categories: ProductCategory[],   // no dependemos del array; reconsultamos por robustez
  _units: UnitMeasurement[]         // idem
): Promise<Product[]> {
  console.log("📦 Seeding Products...");

  const subs = validSubsidiaries(subsidiaries);
  const createdOrEnsured: Product[] = [];

  for (const s of subs) {
    // Buscar categoría 'Escritura' y unidad 'Unidad' (case-insensitive) para esta subsidiaria
    const escritura = await prisma.productCategory.findFirst({
      where: {
        subsidiaryId: s.id,
        name: { equals: "Escritura", mode: "insensitive" },
      },
    });
    if (!escritura) {
      console.warn(`⚠️ Category 'Escritura' not found for subsidiary ${s.id}. Skipping products.`);
      continue;
    }

    const unidad = await prisma.unitMeasurement.findFirst({
      where: {
        subsidiaryId: s.id,
        name: { equals: "Unidad", mode: "insensitive" },
        quantity: 1,
      },
    });
    if (!unidad) {
      console.warn(`⚠️ Unit 'Unidad' (qty=1) not found for subsidiary ${s.id}. Skipping products.`);
      continue;
    }

    // Crear/actualizar productos base
    for (const p of BASE_PRODUCTS) {
      const brandUC = toUpperNormalized(p.brand)!;

      // ¿Existe por (code, subsidiaryId) case-insensitive?
      const existing = await prisma.product.findFirst({
        where: {
          subsidiaryId: s.id,
          code: { equals: p.code, mode: "insensitive" },
        },
      });

      if (existing) {
        // Actualiza para normalizar datos y asegurar FK correctas
        const updated = await prisma.product.update({
          where: { id: existing.id },
          data: {
            name: p.name,
            brand: brandUC,
            barcode: p.barcode ?? null,
            description: p.description ?? null,
            productCategoryId: escritura.id,
            unitMeasurementId: unidad.id,
            // status: true // si quieres activarlos, descomenta
          },
        });
        createdOrEnsured.push(updated);
        console.log(`♻️ Updated product '${p.code}' in subsidiary ${s.id}`);
        continue;
      }

      // Crear nuevo
      const created = await prisma.product.create({
        data: {
          code: p.code,
          barcode: p.barcode ?? null,
          brand: brandUC,
          name: p.name,
          description: p.description ?? null,
          productCategoryId: escritura.id,
          unitMeasurementId: unidad.id,
          tenantId: s.tenantId,
          subsidiaryId: s.id,
          status: true, // dejarlos activos desde el seed
          visibleInNopCommerce: false,
        },
      });

      createdOrEnsured.push(created);
      console.log(`✅ Product '${p.name}' created for subsidiary ${s.id}`);
    }
  }

  const total = await prisma.product.count();
  console.log(`✅ Total products in DB: ${total}`);
  return createdOrEnsured;
}
