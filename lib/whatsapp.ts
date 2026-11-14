import { normalizePhoneNumber } from "@/lib/phone";

/**
 * Standard Clinic Information Constants
 */
export const CLINIC_CONTACT = {
  name: "Matab Tameer-e-Sehat (مطب تعمیرِ صحت)",
  phone: "0300-111-SEHAT",
  address: "Tameer-e-Sehat Holistic Clinic & Hijama Center, Lahore, Pakistan",
  websiteUrl: "https://tameeresehat.com",
};

export interface OrderWhatsAppParams {
  orderNumber: string;
  customerName: string;
  phone: string;
  total: number;
  dueAmount: number;
  courierName?: string | null;
  trackingNumber?: string | null;
}

export interface HijamaWhatsAppParams {
  ticketNumber: string;
  fullName: string;
  phone: string;
  appointmentDate: string | Date;
  slotTime: string;
}

export interface MemberWelcomeWhatsAppParams {
  name: string;
  phone: string;
  membershipId: string;
  referralCode: string;
  welcomeCouponCode: string;
  discountAmount?: number;
  minSubtotal?: number;
  expiryDate?: string | Date;
}

/**
 * Constructs a secure, sanitized, click-to-chat WhatsApp URL (https://wa.me/...).
 * Strips non-standard characters from phone numbers and URI-encodes the message body.
 */
export function buildWhatsAppUrl(rawPhone: string, messageText: string): string {
  const cleanPhone = normalizePhoneNumber(rawPhone) || rawPhone.replace(/\D/g, "");
  const encodedText = encodeURIComponent(messageText.trim());
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

/**
 * Generates an Order Confirmation & Courier Dispatch WhatsApp notification.
 * Strictly transactional: contains order number, items total, COD due, and tracking.
 * Zero medical diagnosis or clinical record data.
 */
export function generateOrderWhatsAppLink(params: OrderWhatsAppParams): string {
  const courierInfo =
    params.courierName && params.trackingNumber
      ? `\n🚚 Courier: ${params.courierName} (Tracking #: ${params.trackingNumber})`
      : "";

  const urduCourierInfo =
    params.courierName && params.trackingNumber
      ? `\nکورئیر سروس: ${params.courierName} (ٹریکنگ نمبر: ${params.trackingNumber})`
      : "";

  const dueNotice =
    params.dueAmount > 0
      ? `\n💵 Cash on Delivery Due: ₨ ${params.dueAmount.toLocaleString()}`
      : "\n✅ Status: Fully Paid (مکمل ادا شدہ)";

  const urduDueNotice =
    params.dueAmount > 0
      ? `\nرقم بوقت وصولی (COD): ₨ ${params.dueAmount.toLocaleString()}`
      : "";

  const text = `السلام علیکم ${params.customerName}!
تعمیرِ صحت قدرتی دواخانہ سے آپ کا آرڈر #${params.orderNumber} موصول ہو چکا ہے۔${urduCourierInfo}${urduDueNotice}
شکریہ!

---
Assalamu Alaikum ${params.customerName}!
Your order #${params.orderNumber} from Tameer-e-Sehat Apothecary is confirmed and processing.${courierInfo}
📦 Total Bill: ₨ ${params.total.toLocaleString()}${dueNotice}

Track your order anytime at: ${CLINIC_CONTACT.websiteUrl}/track-order
Helpline: ${CLINIC_CONTACT.phone}`;

  return buildWhatsAppUrl(params.phone, text);
}

/**
 * Generates a Hijama Cupping Appointment Confirmation & Fasting Instructions message.
 * Gives time slot, clinic location, and Sunnah fasting preparation guidelines.
 */
export function generateHijamaBookingWhatsAppLink(params: HijamaWhatsAppParams): string {
  const dateStr =
    params.appointmentDate instanceof Date
      ? params.appointmentDate.toLocaleDateString("en-GB", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : String(params.appointmentDate);

  const text = `السلام علیکم محترم ${params.fullName}!
آپ کی حجامہ سنت سیشن کی بکنگ کی تصدیق کی جاتی ہے۔
🎫 بکنگ ٹوکن: ${params.ticketNumber}
📅 تاریخ: ${dateStr}
⏰ وقت: ${params.slotTime}
📍 مقام: ${CLINIC_CONTACT.address}

اہم ہدایات:
1. حجامہ سیشن سے کم از کم 2 سے 3 گھنٹے پہلے کچھ نہ کھائیں (خالی پیٹ تشریف لائیں)۔
2. سیشن کے بعد دودھ اور بھاری گوشت سے 24 گھنٹے پرہیز فرمائیں۔

---
Assalamu Alaikum ${params.fullName}!
Your Sunnah Hijama appointment is confirmed.
🎫 Token: ${params.ticketNumber}
📅 Date: ${dateStr}
⏰ Slot: ${params.slotTime}
📍 Venue: ${CLINIC_CONTACT.address}

Guidelines:
- Please arrive on an empty stomach (2–3 hours fast before session).
- Maintain gentle hydration.
Helpline: ${CLINIC_CONTACT.phone}`;

  return buildWhatsAppUrl(params.phone, text);
}

/**
 * Generates a Digital Member Welcome & Voucher message for clinic walk-ins & online signups.
 * Sends Membership ID, personal referral code, and ₨ 200 welcome voucher code.
 */
export function generateMembershipWelcomeWhatsAppLink(
  params: MemberWelcomeWhatsAppParams
): string {
  const discount = params.discountAmount || 200;
  const minSpend = params.minSubtotal || 1200;
  const shareLink = `${CLINIC_CONTACT.websiteUrl}/join?ref=${params.referralCode}`;

  const text = `السلام علیکم ${params.name}!
تعمیرِ صحت ہیلتھ کلب میں خوش آمدید!
💳 ممبرشپ آئی ڈی: ${params.membershipId}
🎁 ویلکم ڈسکاؤنٹ واؤچر: ${params.welcomeCouponCode} (₨ ${discount} رعایت برائے کم از کم ₨ ${minSpend} خریداری)
🔗 آپ کا ریفرل کوڈ: ${params.referralCode}

دوستوں کو مدعو کریں اور ہر آرڈر پر 100 انعامی پوائنٹس حاصل کریں:
${shareLink}

---
Assalamu Alaikum ${params.name}!
Welcome to Tameer-e-Sehat holistic health membership.
💳 Member ID: ${params.membershipId}
🎁 Welcome Voucher: ${params.welcomeCouponCode} (₨ ${discount} off min spend ₨ ${minSpend})
🔗 Your Referral Code: ${params.referralCode}

Invite friends to earn 100 Loyalty Points per friend:
${shareLink}
Website: ${CLINIC_CONTACT.websiteUrl}`;

  return buildWhatsAppUrl(params.phone, text);
}
