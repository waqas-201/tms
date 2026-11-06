import crypto from "crypto";

const INVOICE_SECRET =
  process.env.BETTER_AUTH_SECRET ||
  process.env.INVOICE_SIGNING_SECRET ||
  "tms_secure_invoice_token_salt_default_key";

/**
 * Generates a tamper-proof cryptographic token for an order invoice link.
 * Prevents enumeration attacks across sequential order numbers.
 */
export function generateInvoiceToken(orderId: string, orderNumber: string): string {
  return crypto
    .createHmac("sha256", INVOICE_SECRET)
    .update(`invoice:${orderId}:${orderNumber}`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * Verifies that a given invoice token is valid for the specified order.
 * Uses timing-safe string comparison to protect against timing attacks.
 */
export function verifyInvoiceToken(
  orderId: string,
  orderNumber: string,
  token?: string | null
): boolean {
  if (!token || typeof token !== "string") {
    return false;
  }

  const expectedToken = generateInvoiceToken(orderId, orderNumber);

  if (token.length !== expectedToken.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(token, "utf8"),
      Buffer.from(expectedToken, "utf8")
    );
  } catch {
    return false;
  }
}
