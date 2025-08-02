import prisma from "../utils/prisma";

export async function generateNextPurchaseCode(
  purchaseDate: string,
  tenantId: string,
  subsidiaryId: string
): Promise<string> {
  const dateStr = new Date(purchaseDate).toISOString().slice(0, 10); // YYYY-MM-DD

  const latestPurchase = await prisma.purchase.findFirst({
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

  if (latestPurchase?.code) {
    const match = latestPurchase.code.match(/(\d{5})$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  const padded = String(nextNumber).padStart(5, "0");
  return `${dateStr}-${padded}`;
}
