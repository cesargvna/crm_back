import prisma from "../utils/prisma";

function toYMD(input: string | Date): string {
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}/.test(input)) {
    return input.slice(0, 10); // usa tal cual YYYY-MM-DD
  }
  const d = new Date(input);
  // formateo estable YYYY-MM-DD sin UTC:
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function generateNextPurchaseCode(
  purchaseDate: string | Date,
  tenantId: string,
  subsidiaryId: string
): Promise<string> {
  const dateStr = toYMD(purchaseDate); // YYYY-MM-DD local

  const latestPurchase = await prisma.purchase.findFirst({
    where: {
      tenantId,
      subsidiaryId,
      code: { startsWith: `${dateStr}-` },
    },
    orderBy: { code: "desc" }, // seguro porque está padded a 5 dígitos
    select: { code: true },
  });

  let nextNumber = 1;
  if (latestPurchase?.code) {
    const match = latestPurchase.code.match(/(\d{5})$/);
    if (match) nextNumber = parseInt(match[1], 10) + 1;
  }

  const padded = String(nextNumber).padStart(5, "0");
  return `${dateStr}-${padded}`;
}