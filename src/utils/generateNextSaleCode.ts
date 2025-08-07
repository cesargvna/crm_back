import prisma from "../utils/prisma";

/**
 * Genera un código único para una venta, con el formato YYYY-MM-DD-00001,
 * incremental por fecha, tenant y sucursal.
 */
export async function generateNextSaleCode(
  saleDate: string,
  tenantId: string,
  subsidiaryId: string
): Promise<string> {
  const dateStr = new Date(saleDate).toISOString().slice(0, 10); // YYYY-MM-DD

  const latestSale = await prisma.sale.findFirst({
    where: {
      tenantId,
      subsidiaryId,
      code: {
        startsWith: `${dateStr}-`,
      },
    },
    orderBy: {
      code: "desc",
    },
    select: { code: true },
  });

  let nextNumber = 1;

  if (latestSale?.code) {
    const match = latestSale.code.match(/(\d{5})$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  const padded = String(nextNumber).padStart(5, "0");
  return `${dateStr}-${padded}`;
}
