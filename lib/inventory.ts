import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type StockMovementType = "RECEIVE" | "ADJUST" | "RESERVE" | "RELEASE" | "SALE";

export function getAvailableStock(size: {
  stockOnHand: number;
  stockReserved: number;
}): number {
  return Math.max(0, (size.stockOnHand || 0) - (size.stockReserved || 0));
}

/**
 * Receive new stock batch for a specific product size variant.
 * Immediately makes units live on the website.
 */
export async function receiveStock({
  productSizeId,
  quantity,
  reason,
  userId,
  batchNumber,
  expiryDate,
  unitCost,
}: {
  productSizeId: string;
  quantity: number;
  reason?: string;
  userId?: string;
  batchNumber?: string;
  expiryDate?: Date | string | null;
  unitCost?: number;
}) {
  if (!productSizeId) throw new Error("productSizeId is required.");
  if (!quantity || quantity <= 0) {
    throw new Error("Quantity received must be a positive number.");
  }

  return await prisma.$transaction(
    async (tx) => {
      const size = await tx.productSize.findUnique({
        where: { id: productSizeId },
        include: { product: true },
      });

      if (!size) {
        throw new Error("Product packaging size not found.");
      }

      const newOnHand = size.stockOnHand + quantity;
      const reserved = size.stockReserved;
      const parsedExpiry = expiryDate ? new Date(expiryDate) : null;

      const updatedSize = await tx.productSize.update({
        where: { id: size.id },
        data: {
          stockOnHand: newOnHand,
          isActive: true,
          ...(batchNumber && { batchNumber }),
          ...(parsedExpiry && { expiryDate: parsedExpiry }),
          ...(unitCost !== undefined && unitCost > 0 && { costPrice: unitCost }),
        },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productSizeId: size.id,
          type: "RECEIVE",
          quantity: quantity,
          onHandAfter: newOnHand,
          reservedAfter: reserved,
          reason: reason || "Manual stock reception",
          batchNumber: batchNumber || null,
          expiryDate: parsedExpiry,
          unitCost: unitCost || null,
          createdById: userId || null,
        },
      });

      // Also ensure product inStock is true
      await tx.product.update({
        where: { id: size.productId },
        data: { inStock: true },
      });

      return { size: updatedSize, movement };
    },
    { maxWait: 20000, timeout: 30000 }
  );
}

/**
 * Adjust stock on hand (e.g. for inventory shrinkage, recount, damage, or correction).
 */
export async function adjustStock({
  productSizeId,
  quantity,
  reason,
  userId,
}: {
  productSizeId: string;
  quantity: number; // can be negative (shrinkage) or positive (found inventory)
  reason?: string;
  userId?: string;
}) {
  if (!productSizeId) throw new Error("productSizeId is required.");
  if (quantity === 0) throw new Error("Adjustment quantity cannot be zero.");

  return await prisma.$transaction(
    async (tx) => {
      const size = await tx.productSize.findUnique({
        where: { id: productSizeId },
        include: { product: true },
      });

      if (!size) {
        throw new Error("Product packaging size not found.");
      }

      const newOnHand = size.stockOnHand + quantity;
      if (newOnHand < 0) {
        throw new Error(`Cannot adjust below 0. Current on hand: ${size.stockOnHand}`);
      }

      if (newOnHand < size.stockReserved) {
        throw new Error(
          `Cannot reduce stock below reserved orders (${size.stockReserved} units reserved).`
        );
      }

      const updatedSize = await tx.productSize.update({
        where: { id: size.id },
        data: {
          stockOnHand: newOnHand,
        },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productSizeId: size.id,
          type: "ADJUST",
          quantity: quantity,
          onHandAfter: newOnHand,
          reservedAfter: size.stockReserved,
          reason: reason || (quantity > 0 ? "Inventory adjustment (+)" : "Inventory adjustment (-)"),
          createdById: userId || null,
        },
      });

      return { size: updatedSize, movement };
    },
    { maxWait: 20000, timeout: 30000 }
  );
}

/**
 * Reserve stock when a customer places an order.
 * Ensures two customers cannot buy the same last item.
 */
export async function reserveStockForOrder(
  tx: Prisma.TransactionClient,
  orderId: string,
  items: {
    orderItemId?: string;
    productSizeId: string;
    quantity: number;
  }[]
) {
  // Lexicographically sort items by productSizeId to enforce a strict, canonical
  // lock acquisition order across transactions, preventing ABBA deadlocks during concurrent checkouts.
  const sortedItems = [...items].sort((a, b) =>
    a.productSizeId.localeCompare(b.productSizeId)
  );

  for (const item of sortedItems) {
    if (!item.productSizeId || item.quantity <= 0) continue;

    const size = await tx.productSize.findUnique({
      where: { id: item.productSizeId },
      include: { product: true },
    });

    if (!size) {
      throw new Error(`Packaging size ${item.productSizeId} not found.`);
    }

    const available = getAvailableStock(size);
    if (available < item.quantity) {
      throw new Error(
        `Insufficient stock for "${size.product.name} (${size.weight})". Only ${available} available.`
      );
    }

    const updatedSize = await tx.productSize.update({
      where: { id: size.id },
      data: {
        stockReserved: { increment: item.quantity },
      },
    });

    await tx.stockMovement.create({
      data: {
        productSizeId: size.id,
        type: "RESERVE",
        quantity: -item.quantity,
        onHandAfter: updatedSize.stockOnHand,
        reservedAfter: updatedSize.stockReserved,
        reason: `Reserved for Order #${orderId}`,
        orderId,
      },
    });
  }
}

/**
 * Commit stock deduction when order is marked DISPATCHED (shipped).
 * Moves units from reserved -> physically reduced (onHand).
 * Idempotent: only operates on items in RESERVED or NONE state.
 * Supports transactional composition via optional `tx` parameter.
 */
export async function commitShipmentForOrder(
  orderId: string,
  userId?: string | null,
  tx?: Prisma.TransactionClient
) {
  const execute = async (client: Prisma.TransactionClient) => {
    const order = await client.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            productSize: true,
          },
        },
      },
    });

    if (!order) throw new Error("Order not found.");

    for (const item of order.items) {
      if (!item.productSizeId || !item.productSize) continue;

      // Skip already committed items
      if (item.stockState === "COMMITTED") continue;

      const size = await client.productSize.findUnique({
        where: { id: item.productSizeId },
      });
      if (!size) continue;

      const wasReserved = item.stockState === "RESERVED";

      const updatedSize = await client.productSize.update({
        where: { id: size.id },
        data: {
          stockOnHand: { decrement: item.quantity },
          ...(wasReserved ? { stockReserved: { decrement: item.quantity } } : {}),
        },
      });

      await client.orderItem.update({
        where: { id: item.id },
        data: {
          stockState: "COMMITTED",
        },
      });

      await client.stockMovement.create({
        data: {
          productSizeId: size.id,
          type: "SALE",
          quantity: -item.quantity,
          onHandAfter: updatedSize.stockOnHand,
          reservedAfter: updatedSize.stockReserved,
          reason: `Dispatched in Order ${order.orderNumber}`,
          orderId: order.id,
          createdById: userId || null,
        },
      });
    }

    return { success: true };
  };

  if (tx) {
    return await execute(tx);
  }

  return await prisma.$transaction(execute, { maxWait: 20000, timeout: 30000 });
}

/**
 * Release reserved stock if order is CANCELLED before dispatch,
 * or return stock to shelf if a dispatched order is returned.
 * Supports transactional composition via optional `tx` parameter.
 */
export async function releaseReservationForOrder(
  orderId: string,
  userId?: string | null,
  tx?: Prisma.TransactionClient
) {
  const execute = async (client: Prisma.TransactionClient) => {
    const order = await client.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            productSize: true,
          },
        },
      },
    });

    if (!order) throw new Error("Order not found.");

    for (const item of order.items) {
      if (!item.productSizeId || !item.productSize) continue;

      if (item.stockState === "RELEASED") continue;

      const size = await client.productSize.findUnique({
        where: { id: item.productSizeId },
      });
      if (!size) continue;

      if (item.stockState === "RESERVED") {
        // Release reservation atomically
        const updatedSize = await client.productSize.update({
          where: { id: size.id },
          data: {
            stockReserved: { decrement: item.quantity },
          },
        });

        await client.stockMovement.create({
          data: {
            productSizeId: size.id,
            type: "RELEASE",
            quantity: item.quantity,
            onHandAfter: updatedSize.stockOnHand,
            reservedAfter: updatedSize.stockReserved,
            reason: `Order ${order.orderNumber} cancelled - reservation released`,
            orderId: order.id,
            createdById: userId || null,
          },
        });
      } else if (item.stockState === "COMMITTED") {
        // Return previously shipped stock to on-hand atomically
        const updatedSize = await client.productSize.update({
          where: { id: size.id },
          data: {
            stockOnHand: { increment: item.quantity },
          },
        });

        await client.stockMovement.create({
          data: {
            productSizeId: size.id,
            type: "RECEIVE",
            quantity: item.quantity,
            onHandAfter: updatedSize.stockOnHand,
            reservedAfter: updatedSize.stockReserved,
            reason: `Order ${order.orderNumber} cancelled/returned - stock restocked`,
            orderId: order.id,
            createdById: userId || null,
          },
        });
      }

      await client.orderItem.update({
        where: { id: item.id },
        data: {
          stockState: "RELEASED",
        },
      });
    }

    return { success: true };
  };

  if (tx) {
    return await execute(tx);
  }

  return await prisma.$transaction(execute, { maxWait: 20000, timeout: 30000 });
}

