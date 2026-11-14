import { generateInvoiceToken, verifyInvoiceToken } from "../lib/invoice-token";
import crypto from "crypto";

async function runInvoiceTokenTests() {
  console.log("================================================================================");
  console.log(" 🔐 TAMEER-E-SEHAT INVOICE TOKEN CRYPTOGRAPHIC TEST HARNESS");
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

  // Preserve original env variables
  const originalBetterAuthSecret = process.env.BETTER_AUTH_SECRET;
  const originalInvoiceSigningSecret = process.env.INVOICE_SIGNING_SECRET;

  try {
    // -------------------------------------------------------------------------
    // TEST SUITE 1: Fail-Fast & Fail-Closed Secret Enforcement
    // -------------------------------------------------------------------------
    console.log("--- TEST SUITE 1: Fail-Fast & Fail-Closed Secret Enforcement ---");

    delete process.env.BETTER_AUTH_SECRET;
    delete process.env.INVOICE_SIGNING_SECRET;

    // 1. generateInvoiceToken MUST fail-fast (throw) when secrets are missing
    let threwOnGenerate = false;
    let generateErrorMessage = "";
    try {
      generateInvoiceToken("order-123", "TMS-2026-0001");
    } catch (err: any) {
      threwOnGenerate = true;
      generateErrorMessage = err.message;
    }

    assert(
      threwOnGenerate,
      "generateInvoiceToken throws fatal error when secrets are unconfigured",
      `Expected error but none thrown. Result message: ${generateErrorMessage}`
    );
    assert(
      generateErrorMessage.includes("FATAL: INVOICE_SIGNING_SECRET or BETTER_AUTH_SECRET environment variable must be set"),
      "generateInvoiceToken error contains descriptive missing-secret guidance",
      `Received: "${generateErrorMessage}"`
    );

    // 2. verifyInvoiceToken MUST fail-closed (return false, never crash/throw) when secrets are unconfigured
    let threwOnVerify = false;
    let verifyResult: boolean | null = null;
    try {
      verifyResult = verifyInvoiceToken("order-123", "TMS-2026-0001", "0123456789abcdef0123456789abcdef");
    } catch (err) {
      threwOnVerify = true;
    }

    assert(
      !threwOnVerify,
      "verifyInvoiceToken does NOT throw unhandled exceptions when secrets are missing",
      "verifyInvoiceToken threw an error instead of failing closed"
    );
    assert(
      verifyResult === false,
      "verifyInvoiceToken fails closed (returns false) when secrets are unconfigured"
    );

    // -------------------------------------------------------------------------
    // TEST SUITE 2: Deterministic HMAC Token Generation
    // -------------------------------------------------------------------------
    console.log("\n--- TEST SUITE 2: Deterministic HMAC Generation & Secret Priority ---");

    const testSecretAuth = "test_better_auth_secret_xyz_9876543210";
    const testSecretInvoice = "test_invoice_signing_secret_custom_54321";

    // Set BETTER_AUTH_SECRET only
    process.env.BETTER_AUTH_SECRET = testSecretAuth;
    delete process.env.INVOICE_SIGNING_SECRET;

    const tokenAuth1 = generateInvoiceToken("ord_abc_1", "TMS-1001");
    const tokenAuth2 = generateInvoiceToken("ord_abc_1", "TMS-1001");

    assert(typeof tokenAuth1 === "string" && tokenAuth1.length === 32, "Generated token has length 32");
    assert(/^[0-9a-f]{32}$/i.test(tokenAuth1), "Generated token is valid 32-character hexadecimal");
    assert(tokenAuth1 === tokenAuth2, "generateInvoiceToken produces deterministic tokens for identical input");

    // Manually calculate expected HMAC SHA256 slice
    const manualHmacAuth = crypto
      .createHmac("sha256", testSecretAuth)
      .update("invoice:ord_abc_1:TMS-1001")
      .digest("hex")
      .slice(0, 32);

    assert(tokenAuth1 === manualHmacAuth, "Token matches manual HMAC-SHA256 slice(0, 32) using BETTER_AUTH_SECRET");

    // Test with INVOICE_SIGNING_SECRET prioritized over BETTER_AUTH_SECRET
    process.env.INVOICE_SIGNING_SECRET = testSecretInvoice;
    const tokenCustom = generateInvoiceToken("ord_abc_1", "TMS-1001");

    const manualHmacCustom = crypto
      .createHmac("sha256", testSecretInvoice)
      .update("invoice:ord_abc_1:TMS-1001")
      .digest("hex")
      .slice(0, 32);

    assert(
      tokenCustom === manualHmacCustom,
      "INVOICE_SIGNING_SECRET takes precedence when provided",
      `Received ${tokenCustom}, expected ${manualHmacCustom}`
    );
    assert(tokenCustom !== tokenAuth1, "Tokens differ between different secret keys");

    // -------------------------------------------------------------------------
    // TEST SUITE 3: Verification Logic & Robustness Against Tampering
    // -------------------------------------------------------------------------
    console.log("\n--- TEST SUITE 3: Verification Logic & Robustness Against Tampering ---");

    const orderId = "order_live_99";
    const orderNumber = "TMS-2026-8888";
    const validToken = generateInvoiceToken(orderId, orderNumber);

    // 1. Valid token verification
    assert(
      verifyInvoiceToken(orderId, orderNumber, validToken) === true,
      "verifyInvoiceToken returns true for a valid generated token"
    );

    // 2. Tampered token (modified single hex digit)
    const lastChar = validToken[validToken.length - 1];
    const tamperedLastChar = lastChar === "a" ? "b" : "a";
    const tamperedToken = validToken.slice(0, -1) + tamperedLastChar;
    assert(
      verifyInvoiceToken(orderId, orderNumber, tamperedToken) === false,
      "verifyInvoiceToken rejects single-character tampered token"
    );

    // 3. Invalid characters (non-hex chars like 'g', 'z')
    const nonHexToken = "g" + validToken.slice(1);
    assert(
      verifyInvoiceToken(orderId, orderNumber, nonHexToken) === false,
      "verifyInvoiceToken rejects token containing non-hexadecimal character"
    );

    // 4. Multibyte UTF-8 input (must not throw RangeError or crash)
    const multibyteToken = "🔥".repeat(16);
    let threwOnMultibyte = false;
    let multibyteResult = true;
    try {
      multibyteResult = verifyInvoiceToken(orderId, orderNumber, multibyteToken);
    } catch {
      threwOnMultibyte = true;
    }
    assert(
      !threwOnMultibyte && multibyteResult === false,
      "verifyInvoiceToken safely rejects multibyte UTF-8 strings without RangeError"
    );

    // 5. Truncated token (< 32 hex chars)
    assert(
      verifyInvoiceToken(orderId, orderNumber, validToken.slice(0, 16)) === false,
      "verifyInvoiceToken rejects short/truncated token"
    );

    // 6. Overly long token (> 32 hex chars)
    assert(
      verifyInvoiceToken(orderId, orderNumber, validToken + "abcd") === false,
      "verifyInvoiceToken rejects extended token"
    );

    // 7. Null, undefined, empty, non-string inputs
    assert(
      verifyInvoiceToken(orderId, orderNumber, "") === false,
      "verifyInvoiceToken rejects empty token string"
    );
    assert(
      verifyInvoiceToken(orderId, orderNumber, null) === false,
      "verifyInvoiceToken rejects null token"
    );
    assert(
      verifyInvoiceToken(orderId, orderNumber, undefined) === false,
      "verifyInvoiceToken rejects undefined token"
    );
    assert(
      verifyInvoiceToken(orderId, orderNumber, 12345 as any) === false,
      "verifyInvoiceToken rejects non-string token types"
    );

    // 8. Cross-order enumeration attack resistance
    const differentOrderId = "order_live_100";
    assert(
      verifyInvoiceToken(differentOrderId, orderNumber, validToken) === false,
      "verifyInvoiceToken rejects valid token applied to different orderId"
    );

    const differentOrderNumber = "TMS-2026-8889";
    assert(
      verifyInvoiceToken(orderId, differentOrderNumber, validToken) === false,
      "verifyInvoiceToken rejects valid token applied to different orderNumber"
    );

  } finally {
    // Restore original env
    if (originalBetterAuthSecret !== undefined) {
      process.env.BETTER_AUTH_SECRET = originalBetterAuthSecret;
    } else {
      delete process.env.BETTER_AUTH_SECRET;
    }
    if (originalInvoiceSigningSecret !== undefined) {
      process.env.INVOICE_SIGNING_SECRET = originalInvoiceSigningSecret;
    } else {
      delete process.env.INVOICE_SIGNING_SECRET;
    }
  }

  console.log("\n================================================================================");
  console.log(` 📊 SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("================================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runInvoiceTokenTests().catch((err) => {
  console.error("Unhandled test harness exception:", err);
  process.exit(1);
});
