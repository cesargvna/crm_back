// prisma/seeders/05-unit-measurement.seed.ts
import prisma from "../../src/utils/prisma";
import normalize from "normalize-text";
import { UnitMeasurement } from "../../generated/prisma";

type SubsidiaryLite = { id: string; tenantId: string };

const FIXED_UUID = "00000000-0000-0000-0000-000000000000";

const toUpperNormalized = (s?: string | null) =>
  s ? normalize(s).replace(/\s+/g, " ").trim().toUpperCase() : null;

// Ajusta aquí tus unidades base
const BASE_UNITS: Array<{ name: string; quantity: number }> = [
  { name: "Unidad", quantity: 1 },
  { name: "Pack",   quantity: 5 },
  { name: "Caja",   quantity: 12 },
];

export async function seedUnitMeasurements(
  subsidiaries: SubsidiaryLite[]
): Promise<UnitMeasurement[]> {
  console.log("📏 Seeding Unit Measurements...");

  const validSubs = subsidiaries.filter(
    (s) => s.id !== FIXED_UUID && s.tenantId !== FIXED_UUID
  );

  const ensured: UnitMeasurement[] = [];

  for (const s of validSubs) {
    for (const u of BASE_UNITS) {
      const nameUC = toUpperNormalized(u.name)!;
      const qty = Math.max(1, Math.floor(u.quantity));

      // ¿Existe (case-insensitive) en esta subsidiaria con esa cantidad?
      const existing = await prisma.unitMeasurement.findFirst({
        where: {
          subsidiaryId: s.id,
          quantity: qty,
          name: { equals: nameUC, mode: "insensitive" },
        },
      });

      if (existing) {
        // Normaliza casing si hace falta
        if (existing.name !== nameUC) {
          const updated = await prisma.unitMeasurement.update({
            where: { id: existing.id },
            data: { name: nameUC },
          });
          ensured.push(updated);
          console.log(`♻️  Normalized unit "${nameUC}" (qty=${qty}) in subsidiary ${s.id}`);
        } else {
          ensured.push(existing);
          console.log(`⚠️  Unit "${nameUC}" (qty=${qty}) already exists in subsidiary ${s.id}`);
        }
        continue;
      }

      // Crear nuevo
      const created = await prisma.unitMeasurement.create({
        data: {
          name: nameUC,
          quantity: qty,
          tenantId: s.tenantId,
          subsidiaryId: s.id,
          // status usa el default(true)
        },
      });

      ensured.push(created);
      console.log(`✅ Created unit "${nameUC}" (qty=${qty}) for subsidiary ${s.id}`);
    }
  }

  console.log(`✅ Unit measurements ensured for ${validSubs.length} subsidiaries.`);
  return ensured;
}
