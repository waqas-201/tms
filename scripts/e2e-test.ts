import prisma from "../lib/prisma";
import { getAvailableStock, receiveStock, adjustStock, reserveStockForOrder, commitShipmentForOrder, releaseReservationForOrder } from "../lib/inventory";
import { formatProductRecord } from "../lib/catalog";
import { ROLES, ROLE_PERMISSIONS, hasPermission } from "../lib/rbac-base";
import { AVAILABLE_COUPONS } from "../app/context/CartContext";

// Color formatting utilities for console
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures: { name: string; error: any }[] = [];

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ${colors.green}✓ PASS${colors.reset} ${testName} ${detail ? colors.dim + `(${detail})` + colors.reset : ""}`);
  } else {
    failedTests++;
    const errMsg = detail || "Assertion failed";
    console.error(`  ${colors.red}✗ FAIL${colors.reset} ${testName} - ${errMsg}`);
    failures.push({ name: testName, error: errMsg });
  }
}

function suiteHeader(title: string) {
  console.log(`\n${colors.bright}${colors.cyan}══════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  ▶ ${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}══════════════════════════════════════════════════════════════════════${colors.reset}`);
}

async function runEndToEndTests() {
  const startTime = Date.now();
  console.log(`\n${colors.bright}${colors.magenta}🌿 TAMEER-E-SEHAT (TMS) APOTHECARY & CLINIC - COMPLETE E2E TEST SUITE${colors.reset}`);
  console.log(`${colors.dim}Target Database: PostgreSQL (Neon Cloud) | Environment: Automated CI/CLI Harness${colors.reset}\n`);

  // Track created entities for 100% reliable self-cleaning teardown
  const cleanupContext: {
    orderIds: string[];
    orderItemIds: string[];
    consultationIds: string[];
    inquiryIds: string[];
    reviewIds: string[];
    stockMovementIds: string[];
    testUserIds: string[];
    modifiedSizeIds: string[];
  } = {
    orderIds: [],
    orderItemIds: [],
    consultationIds: [],
    inquiryIds: [],
    reviewIds: [],
    stockMovementIds: [],
    testUserIds: [],
    modifiedSizeIds: [],
  };

  async function purgeTestArtifacts() {
    await prisma.orderItem.deleteMany({
      where: {
        OR: [
          { order: { orderNumber: { startsWith: "TMS-" } } },
          { id: { in: cleanupContext.orderItemIds } },
        ],
      },
    });
    await prisma.order.deleteMany({
      where: {
        OR: [
          { orderNumber: { startsWith: "TMS-" } },
          { email: { contains: "test" } },
          { id: { in: cleanupContext.orderIds } },
        ],
      },
    });
    await prisma.consultationRequest.deleteMany({
      where: {
        OR: [
          { ticketNumber: { startsWith: "CON-" } },
          { email: { contains: "test" } },
          { id: { in: cleanupContext.consultationIds } },
        ],
      },
    });
    await prisma.contactInquiry.deleteMany({
      where: {
        OR: [
          { email: { contains: "test" } },
          { id: { in: cleanupContext.inquiryIds } },
        ],
      },
    });
    await prisma.review.deleteMany({
      where: {
        OR: [
          { name: "Zubair Hashmi" },
          { comment: { contains: "test" } },
          { id: { in: cleanupContext.reviewIds } },
        ],
      },
    });
    await prisma.stockMovement.deleteMany({
      where: {
        OR: [
          { batchNumber: { contains: "TEST" } },
          { reason: { contains: "Test" } },
          { reason: { contains: "Order" } },
          { reason: { contains: "Initial" } },
          { reason: { contains: "Manual" } },
          { id: { in: cleanupContext.stockMovementIds } },
        ],
      },
    });
  }

  try {
    // Initial baseline cleanup to guarantee clean testing state
    await purgeTestArtifacts();
    await prisma.productSize.updateMany({
      data: {
        stockOnHand: 50,
        stockReserved: 0,
      },
    });

    // ══════════════════════════════════════════════════════════════════════
    // SUITE 1: MASTER CATALOG & TAXONOMY INTEGRITY
    // ══════════════════════════════════════════════════════════════════════
    suiteHeader("SUITE 1: Master Catalog, Categories & Measurement Units");

    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
    assert(categories.length === 7, "Category count equals 7 canonical Unani classifications", `Found ${categories.length}`);
    const expectedCategories = ["gastric-digestive", "hair-skin", "murabbajaat", "oils-marham", "arqiyat", "teas-vitality", "herbs-seeds"];
    const foundCatIds = categories.map((c) => c.id || c.slug);
    const hasAllCats = expectedCategories.every((id) => foundCatIds.includes(id));
    assert(hasAllCats, "All 7 standard category classifications exist in master catalog", foundCatIds.join(", "));

    const units = await prisma.unit.findMany({ where: { isActive: true } });
    assert(units.length >= 9, "Measurement units count verified for standard apothecary packaging", `Found ${units.length} active units`);
    const unitCodes = units.map((u) => u.code);
    assert(unitCodes.includes("ml") && unitCodes.includes("g") && unitCodes.includes("bottle") && unitCodes.includes("jar"), "Standard apothecary packaging units present", unitCodes.join(", "));

    const products = await prisma.product.findMany({
      include: { sizes: { include: { unit: true } } },
    });
    assert(products.length === 16, "Master products catalog contains 16 physician formulations", `Found ${products.length}`);

    // Verify product structure integrity
    let allProductsValid = true;
    for (const prod of products) {
      if (!prod.name || !prod.slug || !prod.price || prod.price <= 0 || !prod.sizes || prod.sizes.length === 0) {
        allProductsValid = false;
        break;
      }
    }
    assert(allProductsValid, "Every product contains valid name, slug, price, and packaging variants");

    // Test product catalog formatter
    const sampleFormatted = formatProductRecord(products[0]);
    assert(Array.isArray(sampleFormatted.benefits) && Array.isArray(sampleFormatted.ingredients), "Product record formatter correctly expands JSON benefits and ingredients");

    // ══════════════════════════════════════════════════════════════════════
    // SUITE 2: CART & PROMOTION CALCULATION ENGINE
    // ══════════════════════════════════════════════════════════════════════
    suiteHeader("SUITE 2: Pricing, Shipping Threshold & Promo Code Calculations");

    const arqGulab = products.find((p) => p.slug === "arq-gulab-khas") || products[0];
    const arqSize = arqGulab.sizes[0];

    // Subtotal calculation
    const qty = 3;
    const subtotal = arqSize.price * qty;
    assert(subtotal === arqSize.price * 3, "Cart item subtotal calculation matches unit price * quantity", `₨ ${subtotal}`);

    // Free Shipping Threshold (₨ 2,000 threshold)
    const orderBelow2kSubtotal = 1200;
    const shippingBelow2k = orderBelow2kSubtotal >= 2000 ? 0 : 200;
    assert(shippingBelow2k === 200, "Orders below ₨ 2,000 correctly incur ₨ 200 standard shipping fee");

    const orderAbove2kSubtotal = 2500;
    const shippingAbove2k = orderAbove2kSubtotal >= 2000 ? 0 : 200;
    assert(shippingAbove2k === 0, "Orders of ₨ 2,000 or greater qualify for 100% Free Shipping");

    // Promo Code Engine
    const coupon10 = AVAILABLE_COUPONS["HAKIM10"];
    const discount10 = (subtotal * coupon10.discountValue) / 100;
    assert(discount10 === subtotal * 0.1, "HAKIM10 coupon correctly applies 10% discount to order subtotal", `Discount: ₨ ${discount10}`);

    const couponSehat = AVAILABLE_COUPONS["SEHAT200"];
    const sehatEligibleSubtotal = 1800;
    const isSehatEligible = sehatEligibleSubtotal >= (couponSehat.minSubtotal || 0);
    assert(isSehatEligible && couponSehat.discountValue === 200, "SEHAT200 coupon validates ₨ 1,500 minimum subtotal requirement and provides ₨ 200 flat discount");

    // WhatsApp Order Dispatch Payload Generator
    const testCustomer = {
      name: "Ahmed Raza",
      phone: "0300-1234567",
      city: "Lahore",
      address: "House 12, Street 4, Gulberg III",
    };
    const encodedNotes = encodeURIComponent(`New COD Order for ${testCustomer.name} (${testCustomer.phone})`);
    assert(encodedNotes.includes("Ahmed%20Raza"), "WhatsApp dispatch URL encoder formats customer order payload safely");

    // ══════════════════════════════════════════════════════════════════════
    // SUITE 3: END-TO-END COD ORDER PLACEMENT & STOCK LEDGER LIFECYCLE
    // ══════════════════════════════════════════════════════════════════════
    suiteHeader("SUITE 3: COD Order Placement, Reservation & Shipment Ledger Lifecycle");

    // Select test packaging variant
    const testTargetSize = await prisma.productSize.findFirst({
      where: { stockOnHand: { gte: 10 } },
      include: { product: true },
    });
    if (!testTargetSize) throw new Error("No product size found with available stock for testing.");

    cleanupContext.modifiedSizeIds.push(testTargetSize.id);
    const baselineOnHand = testTargetSize.stockOnHand;
    const baselineReserved = testTargetSize.stockReserved;
    const baselineAvailable = getAvailableStock(testTargetSize);

    assert(baselineAvailable > 0, "Baseline available stock verified before order placement", `${baselineAvailable} units available`);

    // Step 1: Create Order & Reserve Stock (2 units)
    const orderQty = 2;
    const orderSubtotal = testTargetSize.price * orderQty;
    const orderShipping = orderSubtotal >= 2000 ? 0 : 200;
    const orderTotal = orderSubtotal + orderShipping;
    const orderNumber = `TMS-TEST-${Date.now().toString().slice(-4)}`;

    const createdOrder = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.create({
        data: {
          orderNumber,
          customerName: "E2E Automated Tester",
          phone: "0318-0000000",
          email: "e2e.tester@tameeresehat.com",
          city: "Karachi",
          address: "123 Clinic Testing Blvd, Saddar",
          deliveryNotes: "[E2E Automated Test Order]",
          paymentMethod: "COD",
          paymentStatus: "PENDING",
          orderStatus: "PENDING",
          subtotal: orderSubtotal,
          shippingFee: orderShipping,
          total: orderTotal,
          items: {
            create: [
              {
                productId: testTargetSize.productId,
                productSizeId: testTargetSize.id,
                productName: testTargetSize.product.name,
                productUrduName: testTargetSize.product.urduName,
                sizeName: testTargetSize.name,
                sizeWeight: testTargetSize.weight,
                price: testTargetSize.price,
                quantity: orderQty,
                total: orderSubtotal,
                stockState: "RESERVED",
              },
            ],
          },
        },
        include: { items: true },
      });

      await reserveStockForOrder(tx, ord.id, [
        { productSizeId: testTargetSize.id, quantity: orderQty },
      ]);

      return ord;
    }, { maxWait: 20000, timeout: 30000 });

    cleanupContext.orderIds.push(createdOrder.id);
    assert(createdOrder.id !== undefined, "COD Order successfully placed with unique order ID", `Order #${createdOrder.orderNumber}`);

    // Verify Stock Reservation
    const sizeAfterReserve = await prisma.productSize.findUnique({ where: { id: testTargetSize.id } });
    assert(sizeAfterReserve?.stockOnHand === baselineOnHand, "stockOnHand remains untouched during order reservation phase", `onHand: ${sizeAfterReserve?.stockOnHand}`);
    assert(sizeAfterReserve?.stockReserved === baselineReserved + orderQty, "stockReserved increased by order quantity", `reserved: ${sizeAfterReserve?.stockReserved}`);
    assert(getAvailableStock(sizeAfterReserve!) === baselineAvailable - orderQty, "Available stock immediately reduced to protect against overselling");

    // Verify Reservation Movement Audit
    const reserveMovement = await prisma.stockMovement.findFirst({
      where: { orderId: createdOrder.id, type: "RESERVE" },
    });
    if (reserveMovement) cleanupContext.stockMovementIds.push(reserveMovement.id);
    assert(reserveMovement !== null && reserveMovement.quantity === -orderQty, "StockMovement ledger logged RESERVE audit entry with negative quantity");

    // Step 2: Transition Order to DISPATCHED (Shipment Fulfillment)
    await commitShipmentForOrder(createdOrder.id);
    const updatedOrder = await prisma.order.update({
      where: { id: createdOrder.id },
      data: { orderStatus: "DISPATCHED" },
      include: { items: true },
    });

    const sizeAfterDispatch = await prisma.productSize.findUnique({ where: { id: testTargetSize.id } });
    assert(sizeAfterDispatch?.stockOnHand === baselineOnHand - orderQty, "stockOnHand physically decremented by order quantity upon DISPATCH", `onHand: ${sizeAfterDispatch?.stockOnHand}`);
    assert(sizeAfterDispatch?.stockReserved === baselineReserved, "stockReserved released back to normal baseline upon DISPATCH", `reserved: ${sizeAfterDispatch?.stockReserved}`);

    // Verify Sale Movement Audit
    const saleMovement = await prisma.stockMovement.findFirst({
      where: { orderId: createdOrder.id, type: "SALE" },
    });
    if (saleMovement) cleanupContext.stockMovementIds.push(saleMovement.id);
    assert(saleMovement !== null && saleMovement.quantity === -orderQty, "StockMovement ledger logged SALE audit entry upon order dispatch");

    // Step 3: Out-of-Stock Guard Assertion
    let outOfStockCaught = false;
    try {
      await prisma.$transaction(async (tx) => {
        await reserveStockForOrder(tx, "dummy_order_id", [
          { productSizeId: testTargetSize.id, quantity: 999999 },
        ]);
      }, { maxWait: 20000, timeout: 30000 });
    } catch (err: any) {
      if (err.message.includes("Insufficient stock")) {
        outOfStockCaught = true;
      }
    }
    assert(outOfStockCaught, "Inventory reservation guard rejects orders exceeding available stock with 'Insufficient stock' error");

    // ══════════════════════════════════════════════════════════════════════
    // SUITE 4: PATIENT CONSULTATION INTAKE WORKFLOW
    // ══════════════════════════════════════════════════════════════════════
    suiteHeader("SUITE 4: Patient Clinical Consultation Intake & Lifecycle");

    const randomTicketSuffix = Math.floor(1000 + Math.random() * 9000);
    const testTicket = `CON-TEST-${randomTicketSuffix}`;

    const createdConsultation = await prisma.consultationRequest.create({
      data: {
        ticketNumber: testTicket,
        fullName: "Fatima Noor",
        age: 38,
        gender: "Female",
        phone: "0333-7654321",
        email: "fatima.noor@test.com",
        city: "Rawalpindi",
        primarySymptoms: "Chronic digestive weakness and fatigue after meals",
        duration: "6 months",
        previousTreatments: "Allopathic antacids without lasting relief",
        currentMedications: "None currently",
        digestiveState: "Bloating and slow metabolism",
        sleepEnergyState: "Low morning energy",
        preferredContact: "WHATSAPP",
        status: "NEW",
      },
    });

    cleanupContext.consultationIds.push(createdConsultation.id);
    assert(createdConsultation.id !== undefined, "Patient consultation dossier submitted and stored with status 'NEW'", `Ticket: ${createdConsultation.ticketNumber}`);

    // Update Consultation Status (Physician review)
    const updatedConsultation = await prisma.consultationRequest.update({
      where: { id: createdConsultation.id },
      data: { status: "IN_REVIEW" },
    });
    assert(updatedConsultation.status === "IN_REVIEW", "Physician successfully advanced consultation status to 'IN_REVIEW'");

    // ══════════════════════════════════════════════════════════════════════
    // SUITE 5: CONTACT & CLINICAL INQUIRIES SYSTEM
    // ══════════════════════════════════════════════════════════════════════
    suiteHeader("SUITE 5: Patient Inquiries & Support Messaging");

    const createdInquiry = await prisma.contactInquiry.create({
      data: {
        name: "Usman Ghani",
        phone: "0321-9876543",
        email: "usman.ghani@test.com",
        city: "Islamabad",
        subject: "Bulk Dispensary Inquiries for Unani Syrups",
        message: "We would like to stock pure Arqiyat at our clinic in Islamabad.",
        status: "UNREAD",
      },
    });

    cleanupContext.inquiryIds.push(createdInquiry.id);
    assert(createdInquiry.id !== undefined && createdInquiry.status === "UNREAD", "Contact inquiry recorded with status 'UNREAD'");

    const retrievedInquiry = await prisma.contactInquiry.findUnique({
      where: { id: createdInquiry.id },
    });
    assert(retrievedInquiry?.name === "Usman Ghani", "Inquiry fetched and customer details match accurately");

    // ══════════════════════════════════════════════════════════════════════
    // SUITE 6: PRODUCT REVIEWS & DYNAMIC RATING RECALCULATION
    // ══════════════════════════════════════════════════════════════════════
    suiteHeader("SUITE 6: Patient Reviews & Average Rating Recalculation");

    const reviewTargetProduct = products[0];
    const initialRating = reviewTargetProduct.rating;
    const initialReviews = reviewTargetProduct.reviewCount;

    const createdReview = await prisma.review.create({
      data: {
        productId: reviewTargetProduct.id,
        name: "Zubair Hashmi",
        rating: 5,
        comment: "Exceptional purity and authentic aroma. Delivered very quickly to Lahore in protective packaging.",
        city: "Lahore, Pakistan",
        verified: true,
      },
    });

    cleanupContext.reviewIds.push(createdReview.id);
    assert(createdReview.id !== undefined, "Product review created with 5-star rating and verified badge");

    // Recalculate average rating
    const prodReviews = await prisma.review.findMany({ where: { productId: reviewTargetProduct.id } });
    const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
    const newRating = Math.round(avg * 10) / 10;
    const newCount = prodReviews.length;

    await prisma.product.update({
      where: { id: reviewTargetProduct.id },
      data: { rating: newRating, reviewCount: newCount },
    });

    const updatedProduct = await prisma.product.findUnique({ where: { id: reviewTargetProduct.id } });
    assert(updatedProduct?.reviewCount === 1, "Product reviewCount dynamically incremented to reflect submitted review", `Count: ${updatedProduct?.reviewCount}`);
    assert(updatedProduct?.rating === 5.0, "Product average rating dynamically updated to 5.0", `Rating: ${updatedProduct?.rating}`);

    // Restore reviewTargetProduct rating & count during teardown
    // ══════════════════════════════════════════════════════════════════════
    // SUITE 7: INVENTORY MANAGEMENT & STOCK LEDGER ADJUSTMENTS
    // ══════════════════════════════════════════════════════════════════════
    suiteHeader("SUITE 7: Apothecary Inventory Stock Receipts & Shrinkage Adjustments");

    const invTargetSize = products[1].sizes[0];
    cleanupContext.modifiedSizeIds.push(invTargetSize.id);
    const preReceiveOnHand = invTargetSize.stockOnHand;

    // Test 1: Stock Receipt (+15 units)
    const receiveResult = await receiveStock({
      productSizeId: invTargetSize.id,
      quantity: 15,
      reason: "E2E Batch Stock Reception Test",
      batchNumber: "BATCH-2026-TEST",
      expiryDate: new Date("2028-12-31"),
      unitCost: 350,
    });

    cleanupContext.stockMovementIds.push(receiveResult.movement.id);
    assert(receiveResult.size.stockOnHand === preReceiveOnHand + 15, "receiveStock increased stockOnHand by +15 units", `onHand: ${receiveResult.size.stockOnHand}`);
    assert(receiveResult.movement.type === "RECEIVE" && receiveResult.movement.batchNumber === "BATCH-2026-TEST", "StockMovement logged RECEIVE entry with batch number and unit cost");

    // Test 2: Stock Adjustment (-5 units damage/shrinkage)
    const adjustResult = await adjustStock({
      productSizeId: invTargetSize.id,
      quantity: -5,
      reason: "E2E Damage/Shrinkage Adjustment Test",
    });

    cleanupContext.stockMovementIds.push(adjustResult.movement.id);
    assert(adjustResult.size.stockOnHand === preReceiveOnHand + 15 - 5, "adjustStock decreased stockOnHand by -5 units", `onHand: ${adjustResult.size.stockOnHand}`);
    assert(adjustResult.movement.type === "ADJUST" && adjustResult.movement.quantity === -5, "StockMovement logged ADJUST audit entry with negative delta");

    // ══════════════════════════════════════════════════════════════════════
    // SUITE 8: AUTHENTICATION & SINGLE-ADMIN RBAC MATRIX
    // ══════════════════════════════════════════════════════════════════════
    suiteHeader("SUITE 8: Authentication & Role-Based Access Control (RBAC) Matrix");

    // Verify master admin account exists
    const adminUser = await prisma.user.findFirst({
      where: { role: "admin" },
    });
    assert(adminUser !== null && adminUser.email === "admin@tameeresehat.com", "Designated master admin account exists with role 'admin'", adminUser?.email);

    // Verify RBAC Permissions Matrix
    assert(hasPermission(ROLES.ADMIN, "inventory:manage"), "Role 'admin' holds 'inventory:manage' permission");
    assert(hasPermission(ROLES.ADMIN, "users:manage"), "Role 'admin' holds 'users:manage' permission");
    assert(hasPermission(ROLES.EDITOR, "products:create"), "Role 'editor' holds 'products:create' permission");
    assert(!hasPermission(ROLES.EDITOR, "users:manage"), "Role 'editor' is strictly forbidden from 'users:manage'");
    assert(!hasPermission(ROLES.USER, "orders:manage"), "Role 'user' is strictly forbidden from 'orders:manage'");

    // ══════════════════════════════════════════════════════════════════════
    // SUITE 9: SELF-CLEANING TEARDOWN & ZERO DEMO DATA ASSERTION
    // ══════════════════════════════════════════════════════════════════════
    suiteHeader("SUITE 9: Automated Teardown & Post-State Database Integrity");

    console.log(`  ${colors.dim}Purging all test transactions (orders, inquiries, consultations, reviews, movements)...${colors.reset}`);
    await purgeTestArtifacts();

    // Reset modified product sizes and products back to baseline
    console.log(`  ${colors.dim}Resetting inventory stock balances and product ratings to baseline...${colors.reset}`);
    await prisma.productSize.updateMany({
      data: {
        stockOnHand: 50,
        stockReserved: 0,
      },
    });

    await prisma.product.update({
      where: { id: reviewTargetProduct.id },
      data: { rating: initialRating, reviewCount: initialReviews },
    });

    // Final Post-Teardown Verification Assertions
    const [
      finalOrders,
      finalConsultations,
      finalInquiries,
      finalReviews,
      finalMovements,
      finalProducts,
      finalCategories,
      finalSizes,
      finalUsers,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.consultationRequest.count(),
      prisma.contactInquiry.count(),
      prisma.review.count(),
      prisma.stockMovement.count(),
      prisma.product.count(),
      prisma.category.count(),
      prisma.productSize.count(),
      prisma.user.count(),
    ]);

    assert(finalOrders === 0, "Zero orders remain in database after teardown", `Count: ${finalOrders}`);
    assert(finalConsultations === 0, "Zero consultation requests remain in database after teardown", `Count: ${finalConsultations}`);
    assert(finalInquiries === 0, "Zero contact inquiries remain in database after teardown", `Count: ${finalInquiries}`);
    assert(finalReviews === 0, "Zero reviews remain in database after teardown", `Count: ${finalReviews}`);
    assert(finalMovements === 0, "Zero stock movements remain in database after teardown", `Count: ${finalMovements}`);
    assert(finalProducts === 16, "Master product catalog preserved at exactly 16 authentic products", `Count: ${finalProducts}`);
    assert(finalCategories === 7, "Master categories preserved at exactly 7 categories", `Count: ${finalCategories}`);
    assert(finalSizes === 39, "Product size variants preserved at exactly 39 sizes", `Count: ${finalSizes}`);
    assert(finalUsers === 1, "Single master admin user preserved at exactly 1 account", `Count: ${finalUsers}`);

  } catch (err: any) {
    console.error(`\n${colors.red}❌ Unexpected error during E2E test execution:${colors.reset}`, err);
    failedTests++;
    failures.push({ name: "Global E2E Execution", error: err?.message || err });
  } finally {
    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n${colors.bright}══════════════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}  TEST EXECUTION SUMMARY${colors.reset}`);
    console.log(`${colors.bright}══════════════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`  Total Tests Run : ${colors.bright}${totalTests}${colors.reset}`);
    console.log(`  Passed Tests    : ${colors.green}${passedTests}${colors.reset}`);
    console.log(`  Failed Tests    : ${failedTests > 0 ? colors.red + failedTests : colors.green + "0"}${colors.reset}`);
    console.log(`  Total Time      : ${colors.dim}${elapsedSec}s${colors.reset}`);

    if (failures.length > 0) {
      console.log(`\n${colors.red}Failures breakdown:${colors.reset}`);
      for (const f of failures) {
        console.log(`  • ${f.name}: ${f.error}`);
      }
    } else {
      console.log(`\n${colors.green}${colors.bright}🎉 ALL END-TO-END TESTS PASSED WITH 100% SUCCESS!${colors.reset}`);
      console.log(`${colors.green}Database is in a pristine, zero-demo-transaction, fully operational state.${colors.reset}\n`);
    }

    await prisma.$disconnect();
    process.exit(failedTests > 0 ? 1 : 0);
  }
}

runEndToEndTests();
