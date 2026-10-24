import { Resend } from "resend";
import { BRAND } from "./brand-colors";

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = new Resend(resendApiKey || "re_placeholder_key_for_build");

// The Resend sandbox sender (onboarding@resend.dev) can ONLY deliver to the
// Resend account owner's own address. Any other recipient is rejected with a
// 403 validation_error, which silently breaks signup verification and
// password resets. Always send from a verified domain in production.
const DEFAULT_FROM = process.env.EMAIL_FROM?.trim() || "Tameer-e-Sehat <noreply@tameeresehat.com>";

// Optional reply-to. Leave unset when the domain has no inbound mailbox yet,
// otherwise patient replies bounce.
const REPLY_TO = process.env.EMAIL_REPLY_TO?.trim();

if (process.env.NODE_ENV === "production" && DEFAULT_FROM.includes("resend.dev")) {
  console.warn(
    "[email] EMAIL_FROM is still using the Resend sandbox sender (resend.dev). " +
      "Emails will only reach the Resend account owner. Set EMAIL_FROM to an address " +
      "on a verified domain, e.g. 'Tameer-e-Sehat <noreply@tameeresehat.com>'."
  );
}

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000").replace(/\/+$/, "");

/**
 * Adds the optional reply-to address to a Resend payload.
 */
function withReplyTo<T extends object>(payload: T) {
  return REPLY_TO ? { ...payload, replyTo: REPLY_TO } : payload;
}

interface SendEmailParams {
  to: string;
  name?: string;
  url: string;
  token?: string;
}

/**
 * Sends a branded Email Verification link to the user
 */
export async function sendVerificationEmail({ to, name, url }: SendEmailParams) {
  try {
    const recipientName = name || "Valued Patient";
    const verificationUrl = url.startsWith("http")
      ? url
      : `${APP_URL}${url.startsWith("/") ? "" : "/"}${url}`;

    if (process.env.NODE_ENV !== "production") {
      console.log(`\n📧 [EMAIL DISPATCH - VERIFY EMAIL] To: ${to}\n🔗 Verification Link: ${verificationUrl}\n`);
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - Tameer-e-Sehat</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.surface}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: ${BRAND.ink}; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${BRAND.surface}; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: ${BRAND.surfaceRaised}; border-radius: 16px; border: 1px solid ${BRAND.line}; overflow: hidden; box-shadow: 0 4px 12px ${BRAND.primaryA05};">

          <!-- Header Banner -->
          <tr>
            <td style="background-color: ${BRAND.primary}; padding: 32px 28px; text-align: center;">
              <h1 style="margin: 0; color: ${BRAND.surfaceRaised}; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">
                Tameer-e-Sehat
              </h1>
              <p style="margin: 6px 0 0 0; color: ${BRAND.secondaryOnDark}; font-size: 13px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">
                Classical Unani Herbal Clinic · Est. 1990
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 16px 0; color: ${BRAND.primary}; font-size: 20px; font-weight: 600;">
                Assalam-o-Alaikum, ${recipientName}!
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: ${BRAND.inkBody};">
                Thank you for joining <strong>Tameer-e-Sehat</strong>. To activate your patient account and secure your consultations and remedy orders, please verify your email address.
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: ${BRAND.primary}; color: ${BRAND.surfaceRaised}; text-decoration: none; font-size: 14px; font-weight: bold; border-radius: 10px; letter-spacing: 0.5px; box-shadow: 0 2px 6px ${BRAND.primaryA2};">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 1.5; color: ${BRAND.inkSubtle};">
                If the button above does not work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px 0; font-size: 12px; line-height: 1.4; word-break: break-all; color: ${BRAND.secondaryText}; background-color: ${BRAND.surface}; padding: 10px; border-radius: 6px; border: 1px dashed ${BRAND.line};">
                ${verificationUrl}
              </p>

              <hr style="border: 0; border-top: 1px solid ${BRAND.surfaceSunken}; margin: 24px 0;" />

              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: ${BRAND.inkSubtle};">
                This link will expire in <strong>24 hours</strong>. If you did not create an account with Tameer-e-Sehat, please disregard this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: ${BRAND.surface}; padding: 20px 32px; border-top: 1px solid ${BRAND.surfaceSunken}; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: ${BRAND.inkSubtle}; font-weight: 500;">
                Matab Tameer-e-Sehat · Korangi Crossing, Karachi, Pakistan
              </p>
              <p style="margin: 0; font-size: 11px; color: ${BRAND.inkSubtle};">
                Zero Steroids · 100% Herbal · Classical Tibb-e-Unani
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send(withReplyTo({
      from: DEFAULT_FROM,
      to: [to],
      subject: "Verify Your Email - Tameer-e-Sehat Herbal Clinic",
      html: htmlContent,
    }));

    if (error) {
      console.error("[Email Verification Dispatch Error]:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[sendVerificationEmail Exception]:", err);
    return { success: false, error: errorMsg };
  }
}

/**
 * Sends a branded Password Reset link to the user
 */
export async function sendPasswordResetEmail({ to, name, url }: SendEmailParams) {
  try {
    const recipientName = name || "Valued Patient";
    const resetUrl = url.startsWith("http")
      ? url
      : `${APP_URL}${url.startsWith("/") ? "" : "/"}${url}`;

    if (process.env.NODE_ENV !== "production") {
      console.log(`\n📧 [EMAIL DISPATCH - PASSWORD RESET] To: ${to}\n🔗 Reset Link: ${resetUrl}\n`);
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - Tameer-e-Sehat</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.surface}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: ${BRAND.ink}; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${BRAND.surface}; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: ${BRAND.surfaceRaised}; border-radius: 16px; border: 1px solid ${BRAND.line}; overflow: hidden; box-shadow: 0 4px 12px ${BRAND.primaryA05};">

          <!-- Header Banner -->
          <tr>
            <td style="background-color: ${BRAND.primary}; padding: 32px 28px; text-align: center;">
              <h1 style="margin: 0; color: ${BRAND.surfaceRaised}; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">
                Tameer-e-Sehat
              </h1>
              <p style="margin: 6px 0 0 0; color: ${BRAND.secondaryOnDark}; font-size: 13px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">
                Account Security & Password Recovery
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 16px 0; color: ${BRAND.primary}; font-size: 20px; font-weight: 600;">
                Password Reset Request
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: ${BRAND.inkBody};">
                Hello <strong>${recipientName}</strong>, we received a request to reset the password for your account associated with <strong>${to}</strong>.
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: ${BRAND.primary}; color: ${BRAND.surfaceRaised}; text-decoration: none; font-size: 14px; font-weight: bold; border-radius: 10px; letter-spacing: 0.5px; box-shadow: 0 2px 6px ${BRAND.primaryA2};">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 1.5; color: ${BRAND.inkSubtle};">
                If you are having trouble clicking the button, copy and paste the link below:
              </p>
              <p style="margin: 0 0 24px 0; font-size: 12px; line-height: 1.4; word-break: break-all; color: ${BRAND.secondaryText}; background-color: ${BRAND.surface}; padding: 10px; border-radius: 6px; border: 1px dashed ${BRAND.line};">
                ${resetUrl}
              </p>

              <hr style="border: 0; border-top: 1px solid ${BRAND.surfaceSunken}; margin: 24px 0;" />

              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: ${BRAND.inkSubtle};">
                <strong>Security Notice:</strong> This password reset link is valid for <strong>1 hour</strong>. If you did not make this request, please safely ignore this email; your password will remain unchanged.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: ${BRAND.surface}; padding: 20px 32px; border-top: 1px solid ${BRAND.surfaceSunken}; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: ${BRAND.inkSubtle}; font-weight: 500;">
                Matab Tameer-e-Sehat · Korangi Crossing, Karachi, Pakistan
              </p>
              <p style="margin: 0; font-size: 11px; color: ${BRAND.inkSubtle};">
                Need help? Contact our clinical helpline on WhatsApp.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send(withReplyTo({
      from: DEFAULT_FROM,
      to: [to],
      subject: "Reset Your Password - Tameer-e-Sehat Herbal Clinic",
      html: htmlContent,
    }));

    if (error) {
      console.error("[Password Reset Email Dispatch Error]:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[sendPasswordResetEmail Exception]:", err);
    return { success: false, error: errorMsg };
  }
}

export interface OrderItemEmailData {
  productName: string;
  sizeWeight: string;
  price: number;
  quantity: number;
  total: number;
}

export interface OrderConfirmationEmailParams {
  to: string;
  customerName: string;
  orderNumber: string;
  phone: string;
  city: string;
  address: string;
  deliveryNotes?: string | null;
  paymentMethod?: string;
  items: OrderItemEmailData[];
  subtotal: number;
  shippingFee: number;
  discountAmount?: number;
  total: number;
  createdAt?: Date | string;
}

/**
 * Sends a high-polish, customer-centric Order Confirmation email with complete summary,
 * itemized remedies table, delivery address, and 1-click tracking link.
 */
export async function sendOrderConfirmationEmail(params: OrderConfirmationEmailParams) {
  try {
    const {
      to,
      customerName,
      orderNumber,
      phone,
      city,
      address,
      deliveryNotes,
      paymentMethod = "Cash on Delivery (COD)",
      items,
      subtotal,
      shippingFee,
      discountAmount = 0,
      total,
      createdAt = new Date(),
    } = params;

    const trackingUrl = `${APP_URL}/track-order?ref=${encodeURIComponent(orderNumber)}`;
    const formattedDate = new Date(createdAt).toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const itemsHtml = items
      .map(
        (item) => `
        <tr style="border-bottom: 1px solid ${BRAND.surfaceSunken};">
          <td style="padding: 12px 10px; font-size: 13px; color: ${BRAND.ink};">
            <strong>${item.productName}</strong>
            <br />
            <span style="font-size: 11px; color: ${BRAND.inkSubtle};">Packaging: ${item.sizeWeight}</span>
          </td>
          <td align="center" style="padding: 12px 10px; font-size: 13px; color: ${BRAND.inkBody};">
            ${item.quantity}
          </td>
          <td align="right" style="padding: 12px 10px; font-size: 13px; color: ${BRAND.inkBody};">
            ₨ ${item.price.toLocaleString()}
          </td>
          <td align="right" style="padding: 12px 10px; font-size: 13px; font-weight: 700; color: ${BRAND.primary};">
            ₨ ${item.total.toLocaleString()}
          </td>
        </tr>
      `
      )
      .join("");

    const discountRow =
      discountAmount > 0
        ? `
        <tr>
          <td colspan="3" align="right" style="padding: 6px 10px; font-size: 13px; color: ${BRAND.success}; font-weight: 600;">
            Promotional Discount:
          </td>
          <td align="right" style="padding: 6px 10px; font-size: 13px; color: ${BRAND.success}; font-weight: 700;">
            - ₨ ${discountAmount.toLocaleString()}
          </td>
        </tr>
      `
        : "";

    const shippingDisplay =
      shippingFee === 0
        ? `<span style="color: ${BRAND.success}; font-weight: 700; text-transform: uppercase;">Free</span>`
        : `₨ ${shippingFee}`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - ${orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.surface}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: ${BRAND.ink}; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${BRAND.surface}; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: ${BRAND.surfaceRaised}; border-radius: 16px; border: 1px solid ${BRAND.line}; overflow: hidden; box-shadow: 0 4px 16px ${BRAND.primaryA06};">

          <!-- Header Banner -->
          <tr>
            <td style="background-color: ${BRAND.primary}; padding: 32px 28px; text-align: center;">
              <h1 style="margin: 0; color: ${BRAND.surfaceRaised}; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; font-family: Georgia, serif;">
                Tameer-e-Sehat
              </h1>
              <p style="margin: 6px 0 0 0; color: ${BRAND.secondaryOnDark}; font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;">
                Classical Unani Apothecary &amp; Clinic · Est. 1990
              </p>
            </td>
          </tr>

          <!-- Confirmation Title -->
          <tr>
            <td style="padding: 32px 28px 16px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="display: inline-block; background-color: ${BRAND.successSoft}; color: ${BRAND.success}; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; border: 1px solid ${BRAND.successLine}; margin-bottom: 8px;">
                      ✓ Order Confirmed
                    </span>
                    <h2 style="margin: 4px 0 8px 0; color: ${BRAND.primary}; font-size: 20px; font-weight: 700; font-family: Georgia, serif;">
                      Assalam-o-Alaikum, ${customerName}!
                    </h2>
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: ${BRAND.inkBody};">
                      JazakAllah Khair for your order. Our dispensary team is preparing your pure herbal remedies with utmost care and classical precision.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order Summary Card -->
          <tr>
            <td style="padding: 0 28px 24px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${BRAND.surface}; border: 1px solid ${BRAND.line}; border-radius: 12px; padding: 16px;">
                <tr>
                  <td style="font-size: 12px; color: ${BRAND.inkSubtle};">
                    Order Reference:
                    <br />
                    <strong style="font-size: 15px; color: ${BRAND.primary}; font-family: monospace;">${orderNumber}</strong>
                  </td>
                  <td align="right" style="font-size: 12px; color: ${BRAND.inkSubtle};">
                    Date &amp; Payment:
                    <br />
                    <strong style="font-size: 13px; color: ${BRAND.primary};">${formattedDate} · ${paymentMethod}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding: 0 28px 24px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                <thead>
                  <tr style="background-color: ${BRAND.surface}; border-bottom: 2px solid ${BRAND.line};">
                    <th align="left" style="padding: 10px; font-size: 11px; font-weight: 700; color: ${BRAND.inkBody}; text-transform: uppercase; letter-spacing: 0.5px;">Remedy</th>
                    <th align="center" style="padding: 10px; font-size: 11px; font-weight: 700; color: ${BRAND.inkBody}; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
                    <th align="right" style="padding: 10px; font-size: 11px; font-weight: 700; color: ${BRAND.inkBody}; text-transform: uppercase; letter-spacing: 0.5px;">Price</th>
                    <th align="right" style="padding: 10px; font-size: 11px; font-weight: 700; color: ${BRAND.inkBody}; text-transform: uppercase; letter-spacing: 0.5px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" align="right" style="padding: 12px 10px 4px 10px; font-size: 13px; color: ${BRAND.inkSubtle};">
                      Subtotal:
                    </td>
                    <td align="right" style="padding: 12px 10px 4px 10px; font-size: 13px; font-weight: 600; color: ${BRAND.ink};">
                      ₨ ${subtotal.toLocaleString()}
                    </td>
                  </tr>
                  ${discountRow}
                  <tr>
                    <td colspan="3" align="right" style="padding: 4px 10px; font-size: 13px; color: ${BRAND.inkSubtle};">
                      Courier Delivery (Pakistan):
                    </td>
                    <td align="right" style="padding: 4px 10px; font-size: 13px; font-weight: 600; color: ${BRAND.ink};">
                      ${shippingDisplay}
                    </td>
                  </tr>
                  <tr style="border-top: 2px solid ${BRAND.primary};">
                    <td colspan="3" align="right" style="padding: 12px 10px; font-size: 15px; font-weight: 700; color: ${BRAND.primary};">
                      Total Payable (COD):
                    </td>
                    <td align="right" style="padding: 12px 10px; font-size: 16px; font-weight: 800; color: ${BRAND.primary};">
                      ₨ ${total.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </td>
          </tr>

          <!-- Delivery Address Section -->
          <tr>
            <td style="padding: 0 28px 28px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${BRAND.surface}; border: 1px solid ${BRAND.line}; border-radius: 12px; padding: 16px;">
                <tr>
                  <td>
                    <h4 style="margin: 0 0 8px 0; color: ${BRAND.primary}; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                      📦 Delivery &amp; Contact Details
                    </h4>
                    <p style="margin: 0 0 4px 0; font-size: 13px; color: ${BRAND.ink}; font-weight: 600;">
                      ${customerName}
                    </p>
                    <p style="margin: 0 0 4px 0; font-size: 12px; color: ${BRAND.inkBody};">
                      <strong>Phone:</strong> ${phone}
                    </p>
                    <p style="margin: 0 0 4px 0; font-size: 12px; color: ${BRAND.inkBody};">
                      <strong>Address:</strong> ${address}, ${city}, Pakistan
                    </p>
                    ${
                      deliveryNotes
                        ? `<p style="margin: 6px 0 0 0; font-size: 11px; color: ${BRAND.inkSubtle}; font-style: italic;"><strong>Note:</strong> ${deliveryNotes}</p>`
                        : ""
                    }
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Live Tracking CTA -->
          <tr>
            <td align="center" style="padding: 0 28px 32px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${trackingUrl}" target="_blank" style="display: inline-block; width: 85%; padding: 14px 24px; background-color: ${BRAND.primary}; color: ${BRAND.surfaceRaised}; text-decoration: none; font-size: 14px; font-weight: 700; border-radius: 10px; letter-spacing: 0.5px; text-align: center; box-shadow: 0 3px 8px ${BRAND.primaryA2};">
                      Track Order Live Status →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 14px 0 0 0; font-size: 12px; color: ${BRAND.inkSubtle};">
                Questions? Reply directly to this email or chat with our Hakim on WhatsApp (+92 312 2589073).
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: ${BRAND.surface}; padding: 20px 28px; border-top: 1px solid ${BRAND.line}; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: ${BRAND.inkBody}; font-weight: 600;">
                Matab Tameer-e-Sehat · Korangi Crossing, Karachi, Pakistan
              </p>
              <p style="margin: 0; font-size: 11px; color: ${BRAND.inkSubtle};">
                100% Botanical Unani Formulations · Zero Steroids · Registered Tabib
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send(withReplyTo({
      from: DEFAULT_FROM,
      to: [to],
      subject: `Order Confirmed: ${orderNumber} - Tameer-e-Sehat Herbal Apothecary`,
      html: htmlContent,
    }));

    if (error) {
      console.error("[Order Confirmation Email Dispatch Error]:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("[sendOrderConfirmationEmail Exception]:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Sends a notification email to the Clinic Admin / Dispensary staff when a new order is received.
 */
export async function sendAdminOrderNotificationEmail(params: OrderConfirmationEmailParams) {
  try {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_FROM || "admin@tameeresehat.com";
    const cleanAdminTo = adminEmail.includes("<")
      ? adminEmail.match(/<([^>]+)>/)?.[1] || adminEmail
      : adminEmail;

    const {
      customerName,
      orderNumber,
      phone,
      city,
      address,
      deliveryNotes,
      paymentMethod = "COD",
      items,
      total,
    } = params;

    const adminOrdersUrl = `${APP_URL}/admin/orders`;

    const itemsSummary = items
      .map((i) => `<li><strong>${i.productName}</strong> (${i.sizeWeight}) × ${i.quantity} = ₨ ${i.total.toLocaleString()}</li>`)
      .join("");

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Order Alert: ${orderNumber}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${BRAND.surface}; padding: 24px; color: ${BRAND.ink};">
  <div style="max-width: 560px; margin: 0 auto; background: ${BRAND.surfaceRaised}; border-radius: 12px; border: 1px solid ${BRAND.line}; padding: 28px; box-shadow: 0 4px 12px ${BRAND.blackA05};">
    <div style="background-color: ${BRAND.primary}; color: ${BRAND.surfaceRaised}; padding: 14px 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="margin: 0; font-size: 18px;">🌿 New COD Order Received</h2>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: ${BRAND.secondaryOnDark};">Order Ref: ${orderNumber} · Total: ₨ ${total.toLocaleString()}</p>
    </div>

    <h3 style="font-size: 14px; color: ${BRAND.primary}; margin: 0 0 10px 0;">Customer Details</h3>
    <ul style="font-size: 13px; color: ${BRAND.inkBody}; line-height: 1.6; padding-left: 20px; margin: 0 0 16px 0;">
      <li><strong>Name:</strong> ${customerName}</li>
      <li><strong>Phone / WhatsApp:</strong> ${phone}</li>
      <li><strong>City & Address:</strong> ${address}, ${city}</li>
      <li><strong>Payment Mode:</strong> ${paymentMethod}</li>
      ${deliveryNotes ? `<li><strong>Instructions:</strong> ${deliveryNotes}</li>` : ""}
    </ul>

    <h3 style="font-size: 14px; color: ${BRAND.primary}; margin: 0 0 10px 0;">Remedies Ordered</h3>
    <ul style="font-size: 13px; color: ${BRAND.inkBody}; line-height: 1.6; padding-left: 20px; margin: 0 0 24px 0;">
      ${itemsSummary}
    </ul>

    <div style="text-align: center;">
      <a href="${adminOrdersUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: ${BRAND.primary}; color: ${BRAND.surfaceRaised}; text-decoration: none; font-size: 13px; font-weight: 700; border-radius: 8px;">
        Open Admin Order Dispatch →
      </a>
    </div>
  </div>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send(withReplyTo({
      from: DEFAULT_FROM,
      to: [cleanAdminTo],
      subject: `[New Order Alert] ${orderNumber} - ₨ ${total.toLocaleString()} (${customerName})`,
      html: htmlContent,
    }));

    if (error) {
      console.error("[Admin Order Notification Email Error]:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("[sendAdminOrderNotificationEmail Exception]:", err);
    return { success: false, error: err.message };
  }
}

// -------------------------------------------------------------
// Clinical Appointment & Consultation Email Dispatchers
// -------------------------------------------------------------

export interface AppointmentEmailParams {
  to: string;
  fullName: string;
  ticketNumber: string;
  consultationType: "ONLINE" | "IN_PERSON" | string;
  appointmentDate?: string | null;
  appointmentSlot?: string | null;
  phone: string;
  email?: string | null;
  city: string;
  primarySymptoms: string;
  channel?: "EMAIL" | "WHATSAPP" | string;
  duration?: string;
  previousTreatments?: string | null;
  currentMedications?: string | null;
  digestiveState?: string | null;
  sleepEnergyState?: string | null;
}

/**
 * Sends a patient-facing appointment confirmation email with ticket number,
 * appointment date & time slot, and Unani clinical preparation advice.
 */
export async function sendAppointmentConfirmationEmail(params: AppointmentEmailParams) {
  try {
    const {
      to,
      fullName,
      ticketNumber,
      consultationType,
      appointmentDate,
      appointmentSlot,
      phone,
      city,
      primarySymptoms,
    } = params;

    const isOnline = consultationType === "ONLINE";
    const modeBadge = isOnline ? "Online Telehealth Consultation" : "In-Person Clinic Visit (Karachi Matab)";
    const clinicAddress = "Plot 12-C, Korangi Crossing, Main Herbal Market, Karachi, Pakistan";

    const dateDisplay = appointmentDate || "To be coordinated";
    const slotDisplay = appointmentSlot || "Flexible Clinical Hours (10 AM - 9 PM)";
    const trackUrl = `${APP_URL}/track-order?ref=${encodeURIComponent(ticketNumber)}`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Consultation Confirmed - ${ticketNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.surface}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: ${BRAND.ink}; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${BRAND.surface}; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: ${BRAND.surfaceRaised}; border-radius: 16px; border: 1px solid ${BRAND.line}; overflow: hidden; box-shadow: 0 4px 16px ${BRAND.primaryA06};">

          <!-- Header Banner -->
          <tr>
            <td style="background-color: ${BRAND.primary}; padding: 32px 28px; text-align: center;">
              <h1 style="margin: 0; color: ${BRAND.surfaceRaised}; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; font-family: Georgia, serif;">
                Tameer-e-Sehat
              </h1>
              <p style="margin: 6px 0 0 0; color: ${BRAND.secondaryOnDark}; font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;">
                Classical Unani Herbal Clinic · Est. 1990
              </p>
            </td>
          </tr>

          <!-- Confirmation Title -->
          <tr>
            <td style="padding: 32px 28px 16px 28px;">
              <span style="display: inline-block; background-color: ${BRAND.successSoft}; color: ${BRAND.success}; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; border: 1px solid ${BRAND.successLine}; margin-bottom: 8px;">
                ✓ Consultation Booking Received
              </span>
              <h2 style="margin: 4px 0 8px 0; color: ${BRAND.primary}; font-size: 20px; font-weight: 700; font-family: Georgia, serif;">
                Assalam-o-Alaikum, ${fullName}!
              </h2>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: ${BRAND.inkBody};">
                Your clinical consultation request with <strong>Hakim Muhammad Tariq</strong> has been received. Our clinic team will review it and confirm your appointment on WhatsApp or phone. You can check its status anytime using the tracking link below.
              </p>
            </td>
          </tr>

          <!-- Appointment Summary Card -->
          <tr>
            <td style="padding: 0 28px 20px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${BRAND.surface}; border: 1px solid ${BRAND.line}; border-radius: 12px; padding: 18px;">
                <tr>
                  <td style="padding-bottom: 12px; border-bottom: 1px dashed ${BRAND.line};" colspan="2">
                    <span style="font-size: 11px; color: ${BRAND.inkSubtle}; text-transform: uppercase; letter-spacing: 0.5px;">Ticket Reference:</span>
                    <br />
                    <strong style="font-size: 16px; color: ${BRAND.primary}; font-family: monospace;">${ticketNumber}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px; font-size: 13px; color: ${BRAND.inkBody}; width: 50%;">
                    <strong>Consultation Mode:</strong>
                    <br />
                    <span style="color: ${BRAND.success}; font-weight: 600;">${modeBadge}</span>
                  </td>
                  <td style="padding-top: 12px; font-size: 13px; color: ${BRAND.inkBody}; width: 50%;">
                    <strong>Requested Slot:</strong>
                    <br />
                    <span style="color: ${BRAND.primary}; font-weight: 600;">${dateDisplay}</span>
                    <br />
                    <span style="font-size: 12px; color: ${BRAND.inkSubtle};">${slotDisplay} (PKT)</span>
                    <br />
                    <span style="font-size: 11px; color: ${BRAND.warning}; font-weight: 600;">Status: Awaiting confirmation</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Health Dossier Preview -->
          <tr>
            <td style="padding: 0 28px 24px 28px;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: ${BRAND.primary}; font-family: Georgia, serif;">
                Primary Health Concern Registered:
              </h3>
              <div style="background-color: ${BRAND.surfaceRaised}; border: 1px solid ${BRAND.line}; border-left: 4px solid ${BRAND.primary}; border-radius: 8px; padding: 14px 16px; font-size: 13px; color: ${BRAND.inkBody}; line-height: 1.5;">
                ${primarySymptoms}
              </div>
            </td>
          </tr>

          <!-- Preparation Guidelines -->
          <tr>
            <td style="padding: 0 28px 28px 28px;">
              <div style="background-color: ${BRAND.warningSoft}; border: 1px solid ${BRAND.warningLine}; border-radius: 12px; padding: 16px;">
                <h4 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: ${BRAND.warning};">
                  💡 What to Expect Next:
                </h4>
                <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: ${BRAND.warning}; line-height: 1.6;">
                  ${
                    isOnline
                      ? `<li>Hakim Sahib or clinic assistants will contact you via Phone/Email or WhatsApp at <strong>${phone}</strong> during your designated slot.</li>
                         <li>You may reply to this email or send recent blood tests/ultrasounds in advance.</li>
                         <li>Initial pulse assessment, lifestyle evaluation, and dietary guidance are 100% complimentary (Bila-Muawza).</li>`
                      : `<li>Please arrive at our dispensary: <strong>${clinicAddress}</strong> on <strong>${dateDisplay}</strong> around <strong>${slotDisplay}</strong>.</li>
                         <li>Walk-ins for pulse diagnosis (Nabz) are prioritized at your scheduled time.</li>`
                  }
                </ul>
              </div>
            </td>
          </tr>

          <!-- Contact Support Footer -->
          <tr>
            <td style="background-color: ${BRAND.surface}; padding: 20px 28px; border-top: 1px solid ${BRAND.line}; text-align: center;">
              <p style="margin: 0 0 12px 0;">
                <a href="${trackUrl}" target="_blank" style="display: inline-block; padding: 10px 22px; background-color: ${BRAND.primary}; color: ${BRAND.surfaceRaised}; text-decoration: none; font-size: 12px; font-weight: 700; border-radius: 8px;">
                  Track Your Booking →
                </a>
              </p>
              <p style="margin: 0 0 6px 0; font-size: 12px; color: ${BRAND.inkSubtle};">
                Need to reschedule? WhatsApp us at <strong style="color: ${BRAND.primary};">+92 300 8921892</strong> quoting ticket <strong style="font-family: monospace;">${ticketNumber}</strong>
              </p>
              <p style="margin: 0; font-size: 11px; color: ${BRAND.inkSubtle};">
                Matab Tameer-e-Sehat · Authentic Classical Unani Tibb
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send(withReplyTo({
      from: DEFAULT_FROM,
      to: [to],
      subject: `Booking Received: ${ticketNumber} - Tameer-e-Sehat`,
      html: htmlContent,
    }));

    if (error) {
      console.error("[Appointment Confirmation Email Error]:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("[sendAppointmentConfirmationEmail Exception]:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Sends an urgent alert email to the clinic admin / Hakim when a new appointment is booked.
 */
export async function sendAdminAppointmentNotificationEmail(params: AppointmentEmailParams) {
  try {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_FROM || "admin@tameeresehat.com";
    const cleanAdminTo = adminEmail.includes("<")
      ? adminEmail.match(/<([^>]+)>/)?.[1] || adminEmail
      : adminEmail;

    const {
      fullName,
      ticketNumber,
      consultationType,
      appointmentDate,
      appointmentSlot,
      phone,
      email,
      city,
      primarySymptoms,
      duration,
    } = params;

    const adminConsultationsUrl = `${APP_URL}/admin?tab=consultations`;
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const whatsappUrl = `https://wa.me/${cleanPhone.startsWith("0") ? "92" + cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(`Assalam-o-Alaikum ${fullName}, regarding your appointment ticket ${ticketNumber} at Tameer-e-Sehat:`)}`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Appointment Alert: ${ticketNumber}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${BRAND.surface}; padding: 24px; color: ${BRAND.ink};">
  <div style="max-width: 580px; margin: 0 auto; background: ${BRAND.surfaceRaised}; border-radius: 12px; border: 1px solid ${BRAND.line}; padding: 28px; box-shadow: 0 4px 12px ${BRAND.blackA05};">
    <div style="background-color: ${BRAND.primary}; color: ${BRAND.surfaceRaised}; padding: 14px 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="margin: 0; font-size: 18px;">🩺 New Consultation Booking Request</h2>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: ${BRAND.secondaryOnDark};">Ticket: ${ticketNumber} · ${consultationType === "ONLINE" ? "Online Telehealth" : "Physical Karachi Clinic"}</p>
    </div>

    <h3 style="font-size: 14px; color: ${BRAND.primary}; margin: 0 0 10px 0;">Patient &amp; Slot Details</h3>
    <ul style="font-size: 13px; color: ${BRAND.inkBody}; line-height: 1.6; padding-left: 20px; margin: 0 0 16px 0;">
      <li><strong>Patient Name:</strong> ${fullName}</li>
      <li><strong>Contact Phone:</strong> ${phone}</li>
      <li><strong>Email:</strong> ${email || "Not provided"}</li>
      <li><strong>City:</strong> ${city}</li>
      <li><strong>Requested Date:</strong> ${appointmentDate || "Immediate / Open"}</li>
      <li><strong>Requested Time Slot:</strong> ${appointmentSlot || "Flexible"}</li>
      ${duration ? `<li><strong>Condition Duration:</strong> ${duration}</li>` : ""}
    </ul>

    <h3 style="font-size: 14px; color: ${BRAND.primary}; margin: 0 0 10px 0;">Health Concern / Symptoms</h3>
    <div style="background-color: ${BRAND.surface}; border: 1px solid ${BRAND.line}; border-radius: 8px; padding: 12px 14px; font-size: 13px; color: ${BRAND.inkBody}; margin-bottom: 20px;">
      ${primarySymptoms}
    </div>

    <div style="display: flex; gap: 10px; margin-top: 20px;">
      <a href="${whatsappUrl}" target="_blank" style="display: inline-block; padding: 10px 18px; background-color: ${BRAND.whatsapp}; color: ${BRAND.onWhatsapp}; text-decoration: none; font-size: 12px; font-weight: 700; border-radius: 6px; margin-right: 8px;">
        💬 Chat on WhatsApp
      </a>
      <a href="${adminConsultationsUrl}" target="_blank" style="display: inline-block; padding: 10px 18px; background-color: ${BRAND.primary}; color: ${BRAND.surfaceRaised}; text-decoration: none; font-size: 12px; font-weight: 700; border-radius: 6px;">
        Open Admin Portal →
      </a>
    </div>
  </div>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send(withReplyTo({
      from: DEFAULT_FROM,
      to: [cleanAdminTo],
      subject: `[Booking Alert] ${ticketNumber} - ${fullName} (${appointmentDate || "Today"} ${appointmentSlot || ""})`,
      html: htmlContent,
    }));

    if (error) {
      console.error("[Admin Appointment Notification Email Error]:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("[sendAdminAppointmentNotificationEmail Exception]:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Sends status update email to patient (e.g., CONFIRMED, RESCHEDULED, or CANCELLED).
 */
export async function sendAppointmentStatusEmail(params: {
  to: string;
  fullName: string;
  ticketNumber: string;
  status: string;
  appointmentDate?: string | null;
  appointmentSlot?: string | null;
  hakimNotes?: string | null;
}) {
  try {
    const { to, fullName, ticketNumber, status, appointmentDate, appointmentSlot, hakimNotes } = params;

    let statusTitle = "Appointment Update";
    let statusColor: string = BRAND.primary;
    let statusBadge = status;

    if (status === "CONFIRMED") {
      statusTitle = "Appointment Confirmed by Hakim Sahib";
      statusColor = BRAND.success;
      statusBadge = "✓ CONFIRMED";
    } else if (status === "RESCHEDULED") {
      statusTitle = "Appointment Rescheduled";
      statusColor = BRAND.warning;
      statusBadge = "↻ RESCHEDULED";
    } else if (status === "CANCELLED") {
      statusTitle = "Appointment Cancelled";
      statusColor = BRAND.danger;
      statusBadge = "✕ CANCELLED";
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${statusTitle} - ${ticketNumber}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${BRAND.surface}; padding: 24px; color: ${BRAND.ink};">
  <div style="max-width: 580px; margin: 0 auto; background: ${BRAND.surfaceRaised}; border-radius: 12px; border: 1px solid ${BRAND.line}; padding: 28px;">
    <div style="background-color: ${statusColor}; color: ${BRAND.surfaceRaised}; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
      <h2 style="margin: 0; font-size: 20px; font-family: Georgia, serif;">${statusTitle}</h2>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: ${BRAND.surfaceSunken};">Ticket Reference: ${ticketNumber}</p>
    </div>

    <p style="font-size: 14px; color: ${BRAND.inkBody}; line-height: 1.6;">
      Assalam-o-Alaikum <strong>${fullName}</strong>,
      <br /><br />
      This is to inform you that your consultation appointment (Ticket: <strong>${ticketNumber}</strong>) status is now updated to <strong>${statusBadge}</strong>.
    </p>

    ${
      appointmentDate
        ? `<div style="background-color: ${BRAND.surface}; border: 1px solid ${BRAND.line}; border-radius: 8px; padding: 14px 16px; margin: 16px 0; font-size: 13px; color: ${BRAND.inkBody};">
            <strong>Updated Appointment Schedule:</strong><br />
            Date: <strong>${appointmentDate}</strong><br />
            Time Slot: <strong>${appointmentSlot || "Designated slot"}</strong> (PKT)
          </div>`
        : ""
    }

    ${
      hakimNotes
        ? `<div style="background-color: ${BRAND.warningSoft}; border: 1px solid ${BRAND.warningLine}; border-radius: 8px; padding: 14px 16px; margin: 16px 0; font-size: 13px; color: ${BRAND.warning};">
            <strong>Hakim Sahib / Clinic Advice:</strong><br />
            ${hakimNotes}
          </div>`
        : ""
    }

    <p style="font-size: 13px; margin-top: 20px;">
      <a href="${APP_URL}/track-order?ref=${encodeURIComponent(ticketNumber)}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: ${BRAND.primary}; color: ${BRAND.surfaceRaised}; text-decoration: none; font-size: 12px; font-weight: 700; border-radius: 8px;">
        Check Booking Status →
      </a>
    </p>

    <p style="font-size: 12px; color: ${BRAND.inkSubtle}; margin-top: 24px;">
      For any inquiries, please WhatsApp our clinical dispensary at +92 300 8921892.
    </p>
  </div>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send(withReplyTo({
      from: DEFAULT_FROM,
      to: [to],
      subject: `${statusTitle}: ${ticketNumber} - Tameer-e-Sehat`,
      html: htmlContent,
    }));

    if (error) {
      console.error("[Appointment Status Email Error]:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("[sendAppointmentStatusEmail Exception]:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Sends Hakim Prescription and Recommended Herbal Treatment Protocol to Patient.
 */
export async function sendHakimPrescriptionEmail(params: {
  to: string;
  fullName: string;
  ticketNumber: string;
  prescribedTreatment: string;
  hakimNotes?: string | null;
}) {
  try {
    const { to, fullName, ticketNumber, prescribedTreatment, hakimNotes } = params;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Hakim Prescription &amp; Guidance - ${ticketNumber}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${BRAND.surface}; padding: 24px; color: ${BRAND.ink};">
  <div style="max-width: 600px; margin: 0 auto; background: ${BRAND.surfaceRaised}; border-radius: 12px; border: 1px solid ${BRAND.line}; overflow: hidden; box-shadow: 0 4px 16px ${BRAND.blackA06};">
    <div style="background-color: ${BRAND.primary}; padding: 28px 24px; text-align: center; color: ${BRAND.surfaceRaised};">
      <h1 style="margin: 0; font-size: 22px; font-family: Georgia, serif;">Tameer-e-Sehat</h1>
      <p style="margin: 4px 0 0 0; color: ${BRAND.secondaryOnDark}; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Hakim Prescription &amp; Dietary Protocol</p>
    </div>

    <div style="padding: 28px 24px;">
      <h2 style="margin: 0 0 12px 0; font-size: 18px; color: ${BRAND.primary}; font-family: Georgia, serif;">
        Assalam-o-Alaikum, ${fullName}!
      </h2>
      <p style="margin: 0 0 20px 0; font-size: 14px; color: ${BRAND.inkBody}; line-height: 1.6;">
        Hakim Muhammad Tariq has reviewed your consultation dossier (Ticket: <strong style="font-family: monospace;">${ticketNumber}</strong>) and prepared your personalized Unani herbal protocol.
      </p>

      <div style="background-color: ${BRAND.successSoft}; border: 1px solid ${BRAND.successLine}; border-left: 4px solid ${BRAND.success}; border-radius: 8px; padding: 18px 20px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: ${BRAND.success}; text-transform: uppercase; letter-spacing: 0.5px;">
          🌿 Prescribed Herbal Remedies &amp; Dosage:
        </h3>
        <div style="font-size: 14px; color: ${BRAND.success}; line-height: 1.7; white-space: pre-line;">
          ${prescribedTreatment}
        </div>
      </div>

      ${
        hakimNotes
          ? `<div style="background-color: ${BRAND.warningSoft}; border: 1px solid ${BRAND.warningLine}; border-radius: 8px; padding: 16px 18px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: ${BRAND.warning};">
                🥗 Dietary &amp; Lifestyle Guidance (Parhez):
              </h3>
              <div style="font-size: 13px; color: ${BRAND.warning}; line-height: 1.6; white-space: pre-line;">
                ${hakimNotes}
              </div>
            </div>`
          : ""
      }

      <div style="text-align: center; margin-top: 28px;">
        <a href="${APP_URL}/products" target="_blank" style="display: inline-block; padding: 12px 28px; background-color: ${BRAND.primary}; color: ${BRAND.surfaceRaised}; text-decoration: none; font-size: 13px; font-weight: 700; border-radius: 8px;">
          Order Authentic Remedies Online →
        </a>
        <p style="margin: 14px 0 0 0;">
          <a href="${APP_URL}/track-order?ref=${encodeURIComponent(ticketNumber)}" target="_blank" style="font-size: 12px; color: ${BRAND.primary}; text-decoration: underline;">
            Track your booking status →
          </a>
        </p>
      </div>
    </div>

    <div style="background-color: ${BRAND.surface}; padding: 16px 24px; border-top: 1px solid ${BRAND.line}; text-align: center; font-size: 11px; color: ${BRAND.inkSubtle};">
      Matab Tameer-e-Sehat · Est. 1990 · Korangi Crossing, Karachi
    </div>
  </div>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send(withReplyTo({
      from: DEFAULT_FROM,
      to: [to],
      subject: `Hakim Prescription & Protocol: ${ticketNumber} - Tameer-e-Sehat`,
      html: htmlContent,
    }));

    if (error) {
      console.error("[Hakim Prescription Email Error]:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("[sendHakimPrescriptionEmail Exception]:", err);
    return { success: false, error: err.message };
  }
}

