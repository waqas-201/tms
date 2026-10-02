import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = new Resend(resendApiKey || "re_placeholder_key_for_build");

const DEFAULT_FROM = process.env.EMAIL_FROM || "Tameer-e-Sehat <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000";

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
    const verificationUrl = url.startsWith("http") ? url : `${APP_URL}${url}`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - Tameer-e-Sehat</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf8f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1816; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #faf8f5; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e6dfd5; overflow: hidden; box-shadow: 0 4px 12px rgba(34, 98, 58, 0.05);">

          <!-- Header Banner -->
          <tr>
            <td style="background-color: #22623a; padding: 32px 28px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">
                Tameer-e-Sehat
              </h1>
              <p style="margin: 6px 0 0 0; color: #c59b27; font-size: 13px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">
                Classical Unani Herbal Clinic · Est. 1990
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 16px 0; color: #22623a; font-size: 20px; font-weight: 600;">
                Assalam-o-Alaikum, ${recipientName}!
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #59534b;">
                Thank you for joining <strong>Tameer-e-Sehat</strong>. To activate your patient account and secure your consultations and remedy orders, please verify your email address.
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: #22623a; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; border-radius: 10px; letter-spacing: 0.5px; box-shadow: 0 2px 6px rgba(34, 98, 58, 0.2);">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 1.5; color: #8c8a84;">
                If the button above does not work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px 0; font-size: 12px; line-height: 1.4; word-break: break-all; color: #8c6a15; background-color: #faf8f5; padding: 10px; border-radius: 6px; border: 1px dashed #e6dfd5;">
                ${verificationUrl}
              </p>

              <hr style="border: 0; border-top: 1px solid #f4eee5; margin: 24px 0;" />

              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #8c8a84;">
                This link will expire in <strong>24 hours</strong>. If you did not create an account with Tameer-e-Sehat, please disregard this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fcfbf9; padding: 20px 32px; border-top: 1px solid #f4eee5; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #7a7268; font-weight: 500;">
                Matab Tameer-e-Sehat · Korangi Crossing, Karachi, Pakistan
              </p>
              <p style="margin: 0; font-size: 11px; color: #a39e97;">
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

    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [to],
      subject: "Verify Your Email - Tameer-e-Sehat Herbal Clinic",
      html: htmlContent,
    });

    if (error) {
      console.error("[Email Verification Dispatch Error]:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("[sendVerificationEmail Exception]:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Sends a branded Password Reset link to the user
 */
export async function sendPasswordResetEmail({ to, name, url }: SendEmailParams) {
  try {
    const recipientName = name || "Valued Patient";
    const resetUrl = url.startsWith("http") ? url : `${APP_URL}${url}`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - Tameer-e-Sehat</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf8f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1816; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #faf8f5; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e6dfd5; overflow: hidden; box-shadow: 0 4px 12px rgba(34, 98, 58, 0.05);">

          <!-- Header Banner -->
          <tr>
            <td style="background-color: #22623a; padding: 32px 28px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">
                Tameer-e-Sehat
              </h1>
              <p style="margin: 6px 0 0 0; color: #c59b27; font-size: 13px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">
                Account Security & Password Recovery
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 16px 0; color: #22623a; font-size: 20px; font-weight: 600;">
                Password Reset Request
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #59534b;">
                Hello <strong>${recipientName}</strong>, we received a request to reset the password for your account associated with <strong>${to}</strong>.
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: #22623a; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; border-radius: 10px; letter-spacing: 0.5px; box-shadow: 0 2px 6px rgba(34, 98, 58, 0.2);">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 1.5; color: #8c8a84;">
                If you are having trouble clicking the button, copy and paste the link below:
              </p>
              <p style="margin: 0 0 24px 0; font-size: 12px; line-height: 1.4; word-break: break-all; color: #8c6a15; background-color: #faf8f5; padding: 10px; border-radius: 6px; border: 1px dashed #e6dfd5;">
                ${resetUrl}
              </p>

              <hr style="border: 0; border-top: 1px solid #f4eee5; margin: 24px 0;" />

              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #8c8a84;">
                <strong>Security Notice:</strong> This password reset link is valid for <strong>1 hour</strong>. If you did not make this request, please safely ignore this email; your password will remain unchanged.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fcfbf9; padding: 20px 32px; border-top: 1px solid #f4eee5; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #7a7268; font-weight: 500;">
                Matab Tameer-e-Sehat · Korangi Crossing, Karachi, Pakistan
              </p>
              <p style="margin: 0; font-size: 11px; color: #a39e97;">
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

    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [to],
      subject: "Reset Your Password - Tameer-e-Sehat Herbal Clinic",
      html: htmlContent,
    });

    if (error) {
      console.error("[Password Reset Email Dispatch Error]:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("[sendPasswordResetEmail Exception]:", err);
    return { success: false, error: err.message };
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
        <tr style="border-bottom: 1px solid #f0ebe1;">
          <td style="padding: 12px 10px; font-size: 13px; color: #1a1816;">
            <strong>${item.productName}</strong>
            <br />
            <span style="font-size: 11px; color: #8c8275;">Packaging: ${item.sizeWeight}</span>
          </td>
          <td align="center" style="padding: 12px 10px; font-size: 13px; color: #59534b;">
            ${item.quantity}
          </td>
          <td align="right" style="padding: 12px 10px; font-size: 13px; color: #59534b;">
            ₨ ${item.price.toLocaleString()}
          </td>
          <td align="right" style="padding: 12px 10px; font-size: 13px; font-weight: 700; color: #14281D;">
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
          <td colspan="3" align="right" style="padding: 6px 10px; font-size: 13px; color: #166534; font-weight: 600;">
            Promotional Discount:
          </td>
          <td align="right" style="padding: 6px 10px; font-size: 13px; color: #166534; font-weight: 700;">
            - ₨ ${discountAmount.toLocaleString()}
          </td>
        </tr>
      `
        : "";

    const shippingDisplay =
      shippingFee === 0
        ? `<span style="color: #166534; font-weight: 700; text-transform: uppercase;">Free</span>`
        : `₨ ${shippingFee}`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - ${orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF9F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1816; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF9F6; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #E7E5E4; overflow: hidden; box-shadow: 0 4px 16px rgba(20, 40, 29, 0.06);">

          <!-- Header Banner -->
          <tr>
            <td style="background-color: #14281D; padding: 32px 28px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; font-family: Georgia, serif;">
                Tameer-e-Sehat
              </h1>
              <p style="margin: 6px 0 0 0; color: #9E7D3B; font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;">
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
                    <span style="display: inline-block; background-color: #ECFDF5; color: #047857; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; border: 1px solid #A7F3D0; margin-bottom: 8px;">
                      ✓ Order Confirmed
                    </span>
                    <h2 style="margin: 4px 0 8px 0; color: #14281D; font-size: 20px; font-weight: 700; font-family: Georgia, serif;">
                      Assalam-o-Alaikum, ${customerName}!
                    </h2>
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #57534E;">
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
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF9F6; border: 1px solid #E7E5E4; border-radius: 12px; padding: 16px;">
                <tr>
                  <td style="font-size: 12px; color: #78716C;">
                    Order Reference:
                    <br />
                    <strong style="font-size: 15px; color: #14281D; font-family: monospace;">${orderNumber}</strong>
                  </td>
                  <td align="right" style="font-size: 12px; color: #78716C;">
                    Date &amp; Payment:
                    <br />
                    <strong style="font-size: 13px; color: #14281D;">${formattedDate} · ${paymentMethod}</strong>
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
                  <tr style="background-color: #F5F5F4; border-bottom: 2px solid #E7E5E4;">
                    <th align="left" style="padding: 10px; font-size: 11px; font-weight: 700; color: #44403C; text-transform: uppercase; letter-spacing: 0.5px;">Remedy</th>
                    <th align="center" style="padding: 10px; font-size: 11px; font-weight: 700; color: #44403C; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
                    <th align="right" style="padding: 10px; font-size: 11px; font-weight: 700; color: #44403C; text-transform: uppercase; letter-spacing: 0.5px;">Price</th>
                    <th align="right" style="padding: 10px; font-size: 11px; font-weight: 700; color: #44403C; text-transform: uppercase; letter-spacing: 0.5px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" align="right" style="padding: 12px 10px 4px 10px; font-size: 13px; color: #78716C;">
                      Subtotal:
                    </td>
                    <td align="right" style="padding: 12px 10px 4px 10px; font-size: 13px; font-weight: 600; color: #1a1816;">
                      ₨ ${subtotal.toLocaleString()}
                    </td>
                  </tr>
                  ${discountRow}
                  <tr>
                    <td colspan="3" align="right" style="padding: 4px 10px; font-size: 13px; color: #78716C;">
                      Courier Delivery (Pakistan):
                    </td>
                    <td align="right" style="padding: 4px 10px; font-size: 13px; font-weight: 600; color: #1a1816;">
                      ${shippingDisplay}
                    </td>
                  </tr>
                  <tr style="border-top: 2px solid #14281D;">
                    <td colspan="3" align="right" style="padding: 12px 10px; font-size: 15px; font-weight: 700; color: #14281D;">
                      Total Payable (COD):
                    </td>
                    <td align="right" style="padding: 12px 10px; font-size: 16px; font-weight: 800; color: #14281D;">
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
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF9F6; border: 1px solid #E7E5E4; border-radius: 12px; padding: 16px;">
                <tr>
                  <td>
                    <h4 style="margin: 0 0 8px 0; color: #14281D; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                      📦 Delivery &amp; Contact Details
                    </h4>
                    <p style="margin: 0 0 4px 0; font-size: 13px; color: #1a1816; font-weight: 600;">
                      ${customerName}
                    </p>
                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #57534E;">
                      <strong>Phone:</strong> ${phone}
                    </p>
                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #57534E;">
                      <strong>Address:</strong> ${address}, ${city}, Pakistan
                    </p>
                    ${
                      deliveryNotes
                        ? `<p style="margin: 6px 0 0 0; font-size: 11px; color: #78716C; font-style: italic;"><strong>Note:</strong> ${deliveryNotes}</p>`
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
                    <a href="${trackingUrl}" target="_blank" style="display: inline-block; width: 85%; padding: 14px 24px; background-color: #14281D; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; border-radius: 10px; letter-spacing: 0.5px; text-align: center; box-shadow: 0 3px 8px rgba(20, 40, 29, 0.2);">
                      Track Order Live Status →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 14px 0 0 0; font-size: 12px; color: #78716C;">
                Questions? Reply directly to this email or chat with our Hakim on WhatsApp (+92 312 2589073).
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F5F5F4; padding: 20px 28px; border-top: 1px solid #E7E5E4; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #57534E; font-weight: 600;">
                Matab Tameer-e-Sehat · Korangi Crossing, Karachi, Pakistan
              </p>
              <p style="margin: 0; font-size: 11px; color: #A8A29E;">
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

    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [to],
      subject: `Order Confirmed: ${orderNumber} - Tameer-e-Sehat Herbal Apothecary`,
      html: htmlContent,
    });

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
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAF9F6; padding: 24px; color: #1a1816;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #E7E5E4; padding: 28px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="background-color: #14281D; color: #ffffff; padding: 14px 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="margin: 0; font-size: 18px;">🌿 New COD Order Received</h2>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #9E7D3B;">Order Ref: ${orderNumber} · Total: ₨ ${total.toLocaleString()}</p>
    </div>

    <h3 style="font-size: 14px; color: #14281D; margin: 0 0 10px 0;">Customer Details</h3>
    <ul style="font-size: 13px; color: #44403C; line-height: 1.6; padding-left: 20px; margin: 0 0 16px 0;">
      <li><strong>Name:</strong> ${customerName}</li>
      <li><strong>Phone / WhatsApp:</strong> ${phone}</li>
      <li><strong>City & Address:</strong> ${address}, ${city}</li>
      <li><strong>Payment Mode:</strong> ${paymentMethod}</li>
      ${deliveryNotes ? `<li><strong>Instructions:</strong> ${deliveryNotes}</li>` : ""}
    </ul>

    <h3 style="font-size: 14px; color: #14281D; margin: 0 0 10px 0;">Remedies Ordered</h3>
    <ul style="font-size: 13px; color: #44403C; line-height: 1.6; padding-left: 20px; margin: 0 0 24px 0;">
      ${itemsSummary}
    </ul>

    <div style="text-align: center;">
      <a href="${adminOrdersUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #14281D; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; border-radius: 8px;">
        Open Admin Order Dispatch →
      </a>
    </div>
  </div>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [cleanAdminTo],
      subject: `[New Order Alert] ${orderNumber} - ₨ ${total.toLocaleString()} (${customerName})`,
      html: htmlContent,
    });

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

