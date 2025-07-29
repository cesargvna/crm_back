
// 📁 src/services/inventory/syncStatus.service.ts

import prisma from "../utils/prisma";

/**
 * Sincroniza el estado del producto y su categoría basado en el inventario disponible.
 * @param productId string - ID del producto a validar
 */
export const syncProductAndCategoryStatus = async (productId: string) => {
  const inventories = await prisma.inventory.findMany({
    where: { productId },
    select: { quantity_available: true },
  });

  const totalInventory = inventories.reduce(
    (acc, item) => acc + item.quantity_available,
    0
  );

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      status: true,
      productCategoryId: true,
    },
  });

  if (!product) return;

  // 🔼 Inventario > 0 → activar producto si estaba inactivo
  if (totalInventory > 0 && !product.status) {
    await prisma.product.update({
      where: { id: product.id },
      data: { status: true },
    });
  }

  // 🔽 Inventario = 0 → desactivar producto si estaba activo
  if (totalInventory === 0 && product.status) {
    await prisma.product.update({
      where: { id: product.id },
      data: { status: false },
    });
  }

  // 🚫 Si no tiene categoría, termina aquí
  if (!product.productCategoryId) return;

  const category = await prisma.productCategory.findUnique({
    where: { id: product.productCategoryId },
    select: { status: true },
  });

  if (!category) return;

  // 🔼 Si la categoría está inactiva pero ahora hay productos activos → activarla
  if (!category.status) {
    const activeProducts = await prisma.product.count({
      where: {
        productCategoryId: product.productCategoryId,
        status: true,
      },
    });

    if (activeProducts > 0) {
      await prisma.productCategory.update({
        where: { id: product.productCategoryId },
        data: { status: true },
      });
    }
  }

  // ❌ Ya no se controla: desactivar categoría si todos los productos están en 0 o inactivos
};