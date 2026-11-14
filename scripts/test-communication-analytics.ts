/**
 * Test Harness for Milestone M7: Communication, Content, & Analytics
 */

import {
  buildWhatsAppUrl,
  generateOrderWhatsAppLink,
  generateHijamaBookingWhatsAppLink,
  generateMembershipWelcomeWhatsAppLink,
} from "../lib/whatsapp";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(` ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(` ❌ FAIL: ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log("\n▶ Testing M7 Communication & WhatsApp Link Generation");

  // 1. WhatsApp link URL building
  const url1 = buildWhatsAppUrl("0300 123 4567", "Hello Test");
  assert(url1.includes("wa.me/923001234567"), "Normalizes Pakistani local phone to 923001234567");
  assert(url1.includes("text=Hello%20Test"), "Properly URL-encodes message text");

  // 2. Order WhatsApp message
  const orderUrl = generateOrderWhatsAppLink({
    orderNumber: "TMS-2026-1001",
    customerName: "Tariq Mahmood",
    phone: "+92 300 9876543",
    total: 2500,
    dueAmount: 2500,
    courierName: "Trax Logistics",
    trackingNumber: "TRX-9988",
  });
  assert(orderUrl.includes("wa.me/923009876543"), "Normalizes international order phone");
  assert(orderUrl.includes("TMS-2026-1001"), "Includes order number");
  assert(orderUrl.includes("TRX-9988"), "Includes courier tracking number");
  assert(!orderUrl.toLowerCase().includes("prescription") && !orderUrl.toLowerCase().includes("diagnosis"), "Guarantees zero medical diagnosis PII leak");

  // 3. Hijama Booking WhatsApp message
  const hijamaUrl = generateHijamaBookingWhatsAppLink({
    ticketNumber: "HIJ-2026-5544",
    fullName: "Ahmad Raza",
    phone: "0321 555 4433",
    appointmentDate: new Date("2026-11-20T10:00:00Z"),
    slotTime: "11:30 AM",
  });
  assert(hijamaUrl.includes("wa.me/923215554433"), "Encodes Hijama patient phone");
  assert(hijamaUrl.includes("HIJ-2026-5544"), "Includes Hijama token number");
  assert(decodeURIComponent(hijamaUrl).includes("خالی پیٹ") || decodeURIComponent(hijamaUrl).includes("fast"), "Includes fasting preparation advice");

  // 4. Member Welcome WhatsApp message
  const memberUrl = generateMembershipWelcomeWhatsAppLink({
    name: "Usman Ghani",
    phone: "0333 111 2233",
    membershipId: "TMS-M-10050",
    referralCode: "REF-10050",
    welcomeCouponCode: "WELCOME-10050-A1B2",
    discountAmount: 200,
    minSubtotal: 1200,
  });
  assert(memberUrl.includes("TMS-M-10050"), "Includes membership ID");
  assert(memberUrl.includes("REF-10050"), "Includes referral code");
  assert(memberUrl.includes("WELCOME-10050-A1B2"), "Includes welcome coupon voucher");

  console.log(`\nM7 Tests Summary: ${passed} Passed, ${failed} Failed\n`);
  if (failed > 0) process.exit(1);
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
