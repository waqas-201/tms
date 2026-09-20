import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, ROLES } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await requireRole(request, [ROLES.ADMIN, ROLES.EDITOR]);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendorId");
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const search = searchParams.get("search")?.trim();

    const where: any = {};

    if (vendorId && vendorId !== "all") {
      where.vendorId = vendorId;
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (paymentStatus && paymentStatus !== "all") {
      where.paymentStatus = paymentStatus;
    }

    if (search) {
      where.OR = [
        { poNumber: { contains: search, mode: "insensitive" } },
        { vendorInvoiceNo: { contains: search, mode: "insensitive" } },
        { vendor: { name: { contains: search, mode: "insensitive" } } },
        { vendor: { company: { contains: search, mode: "insensitive" } } },
      ];
    }

    const purchases = await prisma.purchaseOrder.findMany({
      where,
      orderBy: { orderDate: "desc" },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            company: true,
            phone: true,
            paymentTerms: true,
          },
        },
        items: {
          include: {
            productSize: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    urduName: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    const summary = {
      totalPurchases: purchases.length,
      totalAmount: purchases.reduce((acc, p) => acc + (p.totalAmount || 0), 0),
      totalPaid: purchases.reduce((acc, p) => acc + (p.paidAmount || 0), 0),
      totalDue: purchases.reduce((acc, p) => acc + (p.dueAmount || 0), 0),
    };

    return NextResponse.json({
      success: true,
      data: purchases,
      summary,
    });
  } catch (error: any) {
    console.error("Error fetching purchase orders:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load purchase orders." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, errorResponse } = await requireRole(request, [ROLES.ADMIN]);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const {
      vendorId,
      vendorInvoiceNo,
      orderDate,
      dueDate,
      status = "ORDERED",
      taxAmount = 0,
      shippingCost = 0,
      notes,
      items,
      receiveStockImmediately = false,
    } = body;

    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: "Vendor is required." },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one item is required in the purchase bill." },
        { status: 400 }
      );
    }

    // Calculate totals
    let subtotal = 0;
    const sanitizedItems = items.map((item: any) => {
      const quantity = Math.max(1, parseInt(item.quantity) || 1);
      const unitCost = Math.max(0, parseFloat(item.unitCost) || 0);
      const totalCost = quantity * unitCost;
      subtotal += totalCost;

      return {
        productSizeId: item.productSizeId || null,
        itemName: item.itemName?.trim() || "Item",
        quantity,
        unitCost,
        totalCost,
        batchNumber: item.batchNumber?.trim() || null,
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
      };
    });

    const numTax = Math.max(0, Number(taxAmount) || 0);
    const numShipping = Math.max(0, Number(shippingCost) || 0);
    const totalAmount = subtotal + numTax + numShipping;
    const dueAmount = totalAmount;

    const result = await prisma.$transaction(async (tx) => {
      const vendor = await tx.vendor.findUnique({
        where: { id: vendorId },
      });

      if (!vendor) {
        throw new Error("Vendor not found.");
      }

      // Generate poNumber: PO-YYYY-XXXX
      const year = new Date().getFullYear();
      const count = await tx.purchaseOrder.count();
      const poNumber = `PO-${year}-${String(count + 1).padStart(4, "0")}`;

      const shouldReceiveStock = receiveStockImmediately || status === "RECEIVED";

      // 1. Create Purchase Order with Items
      const createdPO = await tx.purchaseOrder.create({
        data: {
          poNumber,
          vendorId,
          vendorInvoiceNo: vendorInvoiceNo?.trim() || null,
          orderDate: orderDate ? new Date(orderDate) : new Date(),
          dueDate: dueDate ? new Date(dueDate) : null,
          status: shouldReceiveStock ? "RECEIVED" : status,
          paymentStatus: "UNPAID",
          subtotal,
          taxAmount: numTax,
          shippingCost: numShipping,
          totalAmount,
          paidAmount: 0,
          dueAmount,
          stockReceived: shouldReceiveStock,
          notes: notes?.trim() || null,
          items: {
            create: sanitizedItems,
          },
        },
        include: {
          items: true,
        },
      });

      // 2. Update Vendor Balance (Credit increases payable)
      const newVendorBalance = (vendor.currentBalance || 0) + totalAmount;
      const newTotalPurchased = (vendor.totalPurchased || 0) + totalAmount;

      await tx.vendor.update({
        where: { id: vendor.id },
        data: {
          currentBalance: newVendorBalance,
          totalPurchased: newTotalPurchased,
        },
      });

      // 3. Create Vendor Ledger Entry
      await tx.vendorLedgerEntry.create({
        data: {
          vendorId: vendor.id,
          date: orderDate ? new Date(orderDate) : new Date(),
          type: "PURCHASE_BILL",
          reference: poNumber,
          description: `Purchase Bill ${poNumber}${vendorInvoiceNo ? ` (Invoice #${vendorInvoiceNo})` : ""}`,
          debit: 0,
          credit: totalAmount,
          runningBalance: newVendorBalance,
        },
      });

      // 4. If receiving stock immediately, update physical inventory
      if (shouldReceiveStock) {
        for (const item of createdPO.items) {
          if (!item.productSizeId) continue;

          const size = await tx.productSize.findUnique({
            where: { id: item.productSizeId },
            include: { product: true },
          });

          if (!size) continue;

          const newOnHand = size.stockOnHand + item.quantity;

          await tx.productSize.update({
            where: { id: size.id },
            data: {
              stockOnHand: newOnHand,
              isActive: true,
              ...(item.unitCost > 0 && { costPrice: item.unitCost }),
              ...(item.batchNumber && { batchNumber: item.batchNumber }),
              ...(item.expiryDate && { expiryDate: item.expiryDate }),
            },
          });

          await tx.stockMovement.create({
            data: {
              productSizeId: size.id,
              type: "RECEIVE",
              quantity: item.quantity,
              onHandAfter: newOnHand,
              reservedAfter: size.stockReserved,
              reason: `PO #${createdPO.poNumber} from ${vendor.name}`,
              batchNumber: item.batchNumber || null,
              expiryDate: item.expiryDate || null,
              unitCost: item.unitCost || null,
              createdById: session?.user?.id || null,
            },
          });

          await tx.product.update({
            where: { id: size.productId },
            data: { inStock: true },
          });
        }
      }

      return createdPO;
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: `Purchase Order ${result.poNumber} created successfully.`,
    });
  } catch (error: any) {
    console.error("Error creating purchase order:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create purchase order." },
      { status: 500 }
    );
  }
}
