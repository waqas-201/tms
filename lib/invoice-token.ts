import crypto from "crypto";

/**
 * Retrieves the cryptographic secret key used for invoice token generation.
 * Enforces strict fail-fast behavior: if neither secret is configured, throws immediately.
 */
function getInvoiceSecret(): string {
  const secret = process.env.INVOICE_SIGNING_SECRET || process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "FATAL: INVOICE_SIGNING_SECRET or BETTER_AUTH_SECRET environment variable must be set to sign or verify invoice tokens."
    );
  }
  return secret;
}

/**
 * Generates a tamper-proof cryptographic token for an order invoice link.
 * Prevents enumeration attacks across sequential order numbers.
 */
export function generateInvoiceToken(orderId: string, orderNumber: string): string {
  const secret = getInvoiceSecret();
  return crypto
    .createHmac("sha256", secret)
    .update(`invoice:${orderId}:${orderNumber}`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * Verifies that a given invoice token is valid for the specified order.
 * Uses timing-safe buffer comparison to protect against timing attacks.
 * Fails closed (returns false) if secrets are unconfigured, avoiding unhandled
 * exceptions that crash public page renders.
 */
export function verifyInvoiceToken(
  orderId: string,
  orderNumber: string,
  token?: string | null
): boolean {
  if (!token || typeof token !== "string") {
    return false;
  }

  // Tokens must be exactly 32 hexadecimal characters
  if (!/^[0-9a-f]{32}$/i.test(token)) {
    return false;
  }

  let expectedToken: string;
  try {
    expectedToken = generateInvoiceToken(orderId, orderNumber);
  } catch (err) {
    // Fail closed if secrets are missing without crashing calling page renders
    console.error(
      "[verifyInvoiceToken] Unable to verify invoice token due to unconfigured secrets:",
      err instanceof Error ? err.message : err
    );
    return false;
  }

  try {
    const tokenBuffer = Buffer.from(token, "hex");
    const expectedBuffer = Buffer.from(expectedToken, "hex");

    if (tokenBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(tokenBuffer, expectedBuffer);
  } catch {
    return false;
  }
}
