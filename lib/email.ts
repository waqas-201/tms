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

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Consultation Confirmed - ${ticketNumber}</title>
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
                Classical Unani Herbal Clinic · Est. 1990
              </p>
            </td>
          </tr>

          <!-- Confirmation Title -->
          <tr>
            <td style="padding: 32px 28px 16px 28px;">
              <span style="display: inline-block; background-color: #ECFDF5; color: #047857; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; border: 1px solid #A7F3D0; margin-bottom: 8px;">
                ✓ Consultation Appointment Booked
              </span>
              <h2 style="margin: 4px 0 8px 0; color: #14281D; font-size: 20px; font-weight: 700; font-family: Georgia, serif;">
                Assalam-o-Alaikum, ${fullName}!
              </h2>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #57534E;">
                Your clinical consultation request with <strong>Hakim Muhammad Tariq</strong> has been received and scheduled in our appointment ledger.
              </p>
            </td>
          </tr>

          <!-- Appointment Summary Card -->
          <tr>
            <td style="padding: 0 28px 20px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF9F6; border: 1px solid #E7E5E4; border-radius: 12px; padding: 18px;">
                <tr>
                  <td style="padding-bottom: 12px; border-bottom: 1px dashed #E7E5E4;" colspan="2">
                    <span style="font-size: 11px; color: #78716C; text-transform: uppercase; letter-spacing: 0.5px;">Ticket Reference:</span>
                    <br />
                    <strong style="font-size: 16px; color: #14281D; font-family: monospace;">${ticketNumber}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px; font-size: 13px; color: #44403C; width: 50%;">
                    <strong>Consultation Mode:</strong>
                    <br />
                    <span style="color: #166534; font-weight: 600;">${modeBadge}</span>
                  </td>
                  <td style="padding-top: 12px; font-size: 13px; color: #44403C; width: 50%;">
                    <strong>Scheduled Slot:</strong>
                    <br />
                    <span style="color: #14281D; font-weight: 600;">${dateDisplay}</span>
                    <br />
                    <span style="font-size: 12px; color: #78716C;">${slotDisplay} (PKT)</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Health Dossier Preview -->
          <tr>
            <td style="padding: 0 28px 24px 28px;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #14281D; font-family: Georgia, serif;">
                Primary Health Concern Registered:
              </h3>
              <div style="background-color: #ffffff; border: 1px solid #E7E5E4; border-left: 4px solid #14281D; border-radius: 8px; padding: 14px 16px; font-size: 13px; color: #44403C; line-height: 1.5;">
                ${primarySymptoms}
              </div>
            </td>
          </tr>

          <!-- Preparation Guidelines -->
          <tr>
            <td style="padding: 0 28px 28px 28px;">
              <div style="background-color: #FEF3C7; border: 1px solid #FDE68A; border-radius: 12px; padding: 16px;">
                <h4 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #92400E;">
                  💡 What to Expect Next:
                </h4>
                <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #78350F; line-height: 1.6;">
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
            <td style="background-color: #FCFBF9; padding: 20px 28px; border-top: 1px solid #E7E5E4; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #78716C;">
                Need to reschedule? WhatsApp us at <strong style="color: #14281D;">+92 300 8921892</strong> quoting ticket <strong style="font-family: monospace;">${ticketNumber}</strong>
              </p>
              <p style="margin: 0; font-size: 11px; color: #A8A29E;">
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

    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [to],
      subject: `Consultation Appointment Confirmed: ${ticketNumber} - Tameer-e-Sehat`,
      html: htmlContent,
    });

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
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAF9F6; padding: 24px; color: #1a1816;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #E7E5E4; padding: 28px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="background-color: #14281D; color: #ffffff; padding: 14px 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="margin: 0; font-size: 18px;">🩺 New Patient Appointment Booked</h2>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #9E7D3B;">Ticket: ${ticketNumber} · ${consultationType === "ONLINE" ? "Online Telehealth" : "Physical Karachi Clinic"}</p>
    </div>

    <h3 style="font-size: 14px; color: #14281D; margin: 0 0 10px 0;">Patient &amp; Slot Details</h3>
    <ul style="font-size: 13px; color: #44403C; line-height: 1.6; padding-left: 20px; margin: 0 0 16px 0;">
      <li><strong>Patient Name:</strong> ${fullName}</li>
      <li><strong>Contact Phone:</strong> ${phone}</li>
      <li><strong>Email:</strong> ${email || "Not provided"}</li>
      <li><strong>City:</strong> ${city}</li>
      <li><strong>Requested Date:</strong> ${appointmentDate || "Immediate / Open"}</li>
      <li><strong>Requested Time Slot:</strong> ${appointmentSlot || "Flexible"}</li>
      ${duration ? `<li><strong>Condition Duration:</strong> ${duration}</li>` : ""}
    </ul>

    <h3 style="font-size: 14px; color: #14281D; margin: 0 0 10px 0;">Health Concern / Symptoms</h3>
    <div style="background-color: #FAF9F6; border: 1px solid #E7E5E4; border-radius: 8px; padding: 12px 14px; font-size: 13px; color: #44403C; margin-bottom: 20px;">
      ${primarySymptoms}
    </div>

    <div style="display: flex; gap: 10px; margin-top: 20px;">
      <a href="${whatsappUrl}" target="_blank" style="display: inline-block; padding: 10px 18px; background-color: #25D366; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; border-radius: 6px; margin-right: 8px;">
        💬 Chat on WhatsApp
      </a>
      <a href="${adminConsultationsUrl}" target="_blank" style="display: inline-block; padding: 10px 18px; background-color: #14281D; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; border-radius: 6px;">
        Open Admin Portal →
      </a>
    </div>
  </div>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [cleanAdminTo],
      subject: `[Appointment Alert] ${ticketNumber} - ${fullName} (${appointmentDate || "Today"} ${appointmentSlot || ""})`,
      html: htmlContent,
    });

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
    let statusColor = "#14281D";
    let statusBadge = status;

    if (status === "CONFIRMED") {
      statusTitle = "Appointment Confirmed by Hakim Sahib";
      statusColor = "#166534";
      statusBadge = "✓ CONFIRMED";
    } else if (status === "RESCHEDULED") {
      statusTitle = "Appointment Rescheduled";
      statusColor = "#854d0e";
      statusBadge = "↻ RESCHEDULED";
    } else if (status === "CANCELLED") {
      statusTitle = "Appointment Cancelled";
      statusColor = "#991b1b";
      statusBadge = "✕ CANCELLED";
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${statusTitle} - ${ticketNumber}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAF9F6; padding: 24px; color: #1a1816;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #E7E5E4; padding: 28px;">
    <div style="background-color: ${statusColor}; color: #ffffff; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
      <h2 style="margin: 0; font-size: 20px; font-family: Georgia, serif;">${statusTitle}</h2>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #f4eee5;">Ticket Reference: ${ticketNumber}</p>
    </div>

    <p style="font-size: 14px; color: #44403C; line-height: 1.6;">
      Assalam-o-Alaikum <strong>${fullName}</strong>,
      <br /><br />
      This is to inform you that your consultation appointment (Ticket: <strong>${ticketNumber}</strong>) status is now updated to <strong>${statusBadge}</strong>.
    </p>

    ${
      appointmentDate
        ? `<div style="background-color: #FAF9F6; border: 1px solid #E7E5E4; border-radius: 8px; padding: 14px 16px; margin: 16px 0; font-size: 13px; color: #44403C;">
            <strong>Updated Appointment Schedule:</strong><br />
            Date: <strong>${appointmentDate}</strong><br />
            Time Slot: <strong>${appointmentSlot || "Designated slot"}</strong> (PKT)
          </div>`
        : ""
    }

    ${
      hakimNotes
        ? `<div style="background-color: #FEF3C7; border: 1px solid #FDE68A; border-radius: 8px; padding: 14px 16px; margin: 16px 0; font-size: 13px; color: #78350F;">
            <strong>Hakim Sahib / Clinic Advice:</strong><br />
            ${hakimNotes}
          </div>`
        : ""
    }

    <p style="font-size: 12px; color: #78716C; margin-top: 24px;">
      For any inquiries, please WhatsApp our clinical dispensary at +92 300 8921892.
    </p>
  </div>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [to],
      subject: `${statusTitle}: ${ticketNumber} - Tameer-e-Sehat`,
      html: htmlContent,
    });

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
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAF9F6; padding: 24px; color: #1a1816;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #E7E5E4; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
    <div style="background-color: #14281D; padding: 28px 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 22px; font-family: Georgia, serif;">Tameer-e-Sehat</h1>
      <p style="margin: 4px 0 0 0; color: #9E7D3B; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Hakim Prescription &amp; Dietary Protocol</p>
    </div>

    <div style="padding: 28px 24px;">
      <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #14281D; font-family: Georgia, serif;">
        Assalam-o-Alaikum, ${fullName}!
      </h2>
      <p style="margin: 0 0 20px 0; font-size: 14px; color: #57534E; line-height: 1.6;">
        Hakim Muhammad Tariq has reviewed your consultation dossier (Ticket: <strong style="font-family: monospace;">${ticketNumber}</strong>) and prepared your personalized Unani herbal protocol.
      </p>

      <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-left: 4px solid #166534; border-radius: 8px; padding: 18px 20px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #14532D; text-transform: uppercase; letter-spacing: 0.5px;">
          🌿 Prescribed Herbal Remedies &amp; Dosage:
        </h3>
        <div style="font-size: 14px; color: #166534; line-height: 1.7; white-space: pre-line;">
          ${prescribedTreatment}
        </div>
      </div>

      ${
        hakimNotes
          ? `<div style="background-color: #FEF3C7; border: 1px solid #FDE68A; border-radius: 8px; padding: 16px 18px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #92400E;">
                🥗 Dietary &amp; Lifestyle Guidance (Parhez):
              </h3>
              <div style="font-size: 13px; color: #78350F; line-height: 1.6; white-space: pre-line;">
                ${hakimNotes}
              </div>
            </div>`
          : ""
      }

      <div style="text-align: center; margin-top: 28px;">
        <a href="${APP_URL}/products" target="_blank" style="display: inline-block; padding: 12px 28px; background-color: #14281D; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; border-radius: 8px;">
          Order Authentic Remedies Online →
        </a>
      </div>
    </div>

    <div style="background-color: #FCFBF9; padding: 16px 24px; border-top: 1px solid #E7E5E4; text-align: center; font-size: 11px; color: #78716C;">
      Matab Tameer-e-Sehat · Est. 1990 · Korangi Crossing, Karachi
    </div>
  </div>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [to],
      subject: `Hakim Prescription & Protocol: ${ticketNumber} - Tameer-e-Sehat`,
      html: htmlContent,
    });

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

