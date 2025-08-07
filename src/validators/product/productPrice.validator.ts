import { z } from "zod";

// 🧩 Helpers
const uuidField = (fieldName: string) =>
  z.string({ required_error: `${fieldName} es requerido.` }).uuid(`${fieldName} debe ser un UUID válido.`);

const decimalField = z
  .union([
    z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0.01, {
      message: "El precio debe ser un número válido mayor o igual a 0.01",
    }),
    z.number().min(0.01, "El precio debe ser mayor o igual a 0.01"),
  ])
  .transform((val) => typeof val === "string" ? parseFloat(val) : val);

// ✅ Crear precio
export const createProductPriceSchema = z.object({
  priceTypeId: uuidField("Tipo de precio"),
  price: decimalField,
  tenantId: uuidField("Tenant"),
  subsidiaryId: uuidField("Sucursal"),
});

// ✅ Actualizar precio
export const updateProductPriceSchema = z.object({
  price: decimalField,
});

// ✅ Obtener por ID
export const getProductPriceByIdSchema = z.object({
  id: uuidField("ID de precio"),
});

// ✅ Obtener precios por producto
export const getPricesByProductParamsSchema = z.object({
  productId: uuidField("ID de producto"),
});

// ✅ Validar query de búsqueda de precios
export const getPricesByProductQuerySchema = z.object({
  priceTypeId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});