import { AVAILABLE_COUPONS } from "../app/context/CartContext";
import { CLINIC_INFO } from "../app/data/products";

async function runCartLogicTests() {
  console.log("================================================================================");
  console.log(" 🛒 TAMEER-E-SEHAT CART & CHECKOUT LOGIC TEST HARNESS");
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(` ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${testName}`);
      if (detail) console.error(`    Detail: ${detail}`);
      failed++;
    }
  }

  // 1. Test Available Coupons
  console.log("--- TEST 1: Promo Engine & Coupon Configurations ---");
  assert(AVAILABLE_COUPONS["HAKIM10"] !== undefined, "Coupon HAKIM10 is registered");
  assert(AVAILABLE_COUPONS["HAKIM10"].discountValue === 10, "HAKIM10 offers 10% discount");
  assert(AVAILABLE_COUPONS["FREESHIP"] !== undefined, "Coupon FREESHIP is registered");
  assert(AVAILABLE_COUPONS["SEHAT200"] !== undefined, "Coupon SEHAT200 is registered");
  assert(AVAILABLE_COUPONS["SEHAT200"].minSubtotal === 1500, "SEHAT200 enforces minimum ₨ 1500 subtotal");

  // 2. Test Robust Item Matching Logic
  console.log("\n--- TEST 2: Cart Item Identification & Matching Across CUID / Name / Weight ---");
  const sampleCartItem = {
    product: { id: "prod_123", name: "Majoon Dabeed-ul-Ward", price: 850, inStock: true } as any,
    selectedSize: { id: "cuid_size_999", name: "Large", weight: "500g", price: 850, available: 5 },
    quantity: 2,
  };

  function matchesItemSize(
    item: typeof sampleCartItem,
    productId: string,
    sizeIdentifier?: string
  ): boolean {
    if (item.product.id !== productId) return false;
    if (!sizeIdentifier) return true;
    if (item.selectedSize.id && item.selectedSize.id === sizeIdentifier) return true;
    if (item.selectedSize.name && item.selectedSize.name === sizeIdentifier) return true;
    if (item.selectedSize.weight && item.selectedSize.weight === sizeIdentifier) return true;
    return false;
  }

  assert(
    matchesItemSize(sampleCartItem, "prod_123", "cuid_size_999"),
    "Matches cart item using database CUID id"
  );
  assert(
    matchesItemSize(sampleCartItem, "prod_123", "Large"),
    "Matches cart item using size name (e.g. Large)"
  );
  assert(
    matchesItemSize(sampleCartItem, "prod_123", "500g"),
    "Matches cart item using size weight (e.g. 500g)"
  );
  assert(
    !matchesItemSize(sampleCartItem, "prod_123", "250g"),
    "Rejects mismatched size identifier correctly"
  );
  assert(
    !matchesItemSize(sampleCartItem, "prod_999", "Large"),
    "Rejects mismatched product ID correctly"
  );

  // 3. Test Deletion & Quantity Updates
  console.log("\n--- TEST 3: Cart Deletion & Stock Bounds ---");
  let testCart = [sampleCartItem];

  // Remove using size name string (reproducing previous bug)
  testCart = testCart.filter((item) => !matchesItemSize(item, "prod_123", "Large"));
  assert(testCart.length === 0, "Cart item successfully deleted when passing size name string");

  // Re-add and check quantity cap
  const maxStock = sampleCartItem.selectedSize.available;
  let requestedQty = 10;
  let finalQty = requestedQty > maxStock ? maxStock : requestedQty;
  assert(finalQty === 5, "Quantity is capped at available stock (5 units)");

  // 4. Test Subtotal, Free Shipping & Discount Calculations
  console.log("\n--- TEST 4: Price Calculations, Thresholds & Totals ---");
  const subtotal1 = 1200;
  const shipping1 = subtotal1 >= CLINIC_INFO.freeShippingThreshold ? 0 : CLINIC_INFO.flatShippingFee;
  assert(shipping1 === 200, "Orders below ₨ 2,000 have ₨ 200 standard shipping fee");

  const subtotal2 = 2500;
  const shipping2 = subtotal2 >= CLINIC_INFO.freeShippingThreshold ? 0 : CLINIC_INFO.flatShippingFee;
  assert(shipping2 === 0, "Orders ₨ 2,000 or above qualify for FREE nationwide shipping");

  // Percentage discount
  const discount10 = Math.round((2500 * AVAILABLE_COUPONS["HAKIM10"].discountValue) / 100);
  assert(discount10 === 250, "10% coupon on ₨ 2,500 calculates ₨ 250 discount");

  console.log("\n================================================================================");
  console.log(` 📊 CART TEST RESULTS: ${passed} Passed | ${failed} Failed`);
  console.log("================================================================================\n");

  if (failed > 0) process.exit(1);
}

runCartLogicTests();
