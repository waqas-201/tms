import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = new Resend(resendApiKey || "");

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
