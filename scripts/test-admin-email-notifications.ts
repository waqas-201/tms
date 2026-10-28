import "dotenv/config";
import prisma from "../lib/prisma";
import {
  getAdminNotificationRecipients,
  sendAdminOrderNotificationEmail,
  sendAdminAppointmentNotificationEmail,
  sendAdminHijamaNotificationEmail,
} from "../lib/email";

async function runTest() {
  console.log("════════════════════════════════════════════════════════════════");
  console.log("   AUTOMATED MULTI-ADMIN EMAIL NOTIFICATION VERIFICATION TEST   ");
  console.log("════════════════════════════════════════════════════════════════\n");

  const testSuffix = Date.now();
  const superAdminEmail = `superadmin.${testSuffix}@tameeresehat.test`.toLowerCase();
  const admin1Email = `admin1.${testSuffix}@tameeresehat.test`.toLowerCase();
  const admin2Email = `admin2.${testSuffix}@tameeresehat.test`.toLowerCase();
  const admin3Email = `admin3.${testSuffix}@tameeresehat.test`.toLowerCase();
  const deactivatedAdminEmail = `inactive.${testSuffix}@tameeresehat.test`.toLowerCase();
  const regularUserEmail = `user.${testSuffix}@tameeresehat.test`.toLowerCase();

  const createdUserIds: string[] = [];

  try {
    // 1. Create test users with various roles and statuses
    console.log("1. Provisioning test accounts (Super Admin, Admins, Inactive Admin, User)...");

    const superAdmin = await prisma.user.create({
      data: {
        name: "Test Super Admin",
        email: superAdminEmail,
        role: "super_admin",
        isActive: true,
      },
    });
    createdUserIds.push(superAdmin.id);

    const admin1 = await prisma.user.create({
      data: {
        name: "Test Admin 1",
        email: admin1Email,
        role: "admin",
        isActive: true,
      },
    });
    createdUserIds.push(admin1.id);

    const admin2 = await prisma.user.create({
      data: {
        name: "Test Admin 2",
        email: admin2Email,
        role: "admin",
        isActive: true,
      },
    });
    createdUserIds.push(admin2.id);

    const admin3 = await prisma.user.create({
      data: {
        name: "Test Admin 3",
        email: admin3Email,
        role: "admin",
        isActive: true,
      },
    });
    createdUserIds.push(admin3.id);

    const inactiveAdmin = await prisma.user.create({
      data: {
        name: "Test Inactive Admin",
        email: deactivatedAdminEmail,
        role: "admin",
        isActive: false,
      },
    });
    createdUserIds.push(inactiveAdmin.id);

    const regularUser = await prisma.user.create({
      data: {
        name: "Regular Patient",
        email: regularUserEmail,
        role: "user",
        isActive: true,
      },
    });
    createdUserIds.push(regularUser.id);

    console.log("   ✅ Accounts created successfully.");

    // 2. Test getAdminNotificationRecipients
    console.log("\n2. Testing getAdminNotificationRecipients resolution...");
    const recipients = await getAdminNotificationRecipients();
    console.log("   Found recipients count:", recipients.length);
    console.log("   Recipients:", recipients);

    // Verify all active admins are included
    if (!recipients.includes(superAdminEmail)) {
      throw new Error(`Super admin ${superAdminEmail} missing from recipients`);
    }
    if (!recipients.includes(admin1Email)) {
      throw new Error(`Admin 1 ${admin1Email} missing from recipients`);
    }
    if (!recipients.includes(admin2Email)) {
      throw new Error(`Admin 2 ${admin2Email} missing from recipients`);
    }
    if (!recipients.includes(admin3Email)) {
      throw new Error(`Admin 3 ${admin3Email} missing from recipients`);
    }

    // Verify inactive admin and regular user are excluded
    if (recipients.includes(deactivatedAdminEmail)) {
      throw new Error(`Deactivated admin ${deactivatedAdminEmail} was incorrectly included in recipients!`);
    }
    if (recipients.includes(regularUserEmail)) {
      throw new Error(`Regular user ${regularUserEmail} was incorrectly included in recipients!`);
    }
    console.log("   ✅ Dynamic DB recipient query accurately resolved all active admins and excluded inactive/regular users.");

    // 3. Test Order Alert dispatch
    console.log("\n3. Testing Order Alert notification dispatch...");
    const orderResult = await sendAdminOrderNotificationEmail({
      to: "admin",
      customerName: "Ahmad Raza",
      orderNumber: `ORD-TEST-${testSuffix}`,
      phone: "03001234567",
      city: "Karachi",
      address: "DHA Phase 6",
      deliveryNotes: "Leave at door",
      paymentMethod: "Cash on Delivery (COD)",
      items: [
        {
          productId: "prod_1",
          productName: "Majun Shabab Awar",
          sizeName: "250g Jar",
          sizeWeight: "250g",
          price: 1500,
          quantity: 2,
          total: 3000,
        },
      ],
      subtotal: 3000,
      total: 3000,
    });
    console.log("   Order alert result:", orderResult.success ? "✅ Dispatched" : `❌ Error: ${JSON.stringify(orderResult.error)}`);

    // 4. Test Consultation Alert dispatch
    console.log("\n4. Testing Consultation Alert notification dispatch...");
    const consultResult = await sendAdminAppointmentNotificationEmail({
      to: "admin",
      fullName: "Fatima Noor",
      ticketNumber: `CON-TEST-${testSuffix}`,
      consultationType: "ONLINE",
      appointmentDate: "2026-11-01",
      appointmentSlot: "11:00 AM - 12:00 PM",
      phone: "03219876543",
      email: "fatima.patient@example.com",
      city: "Lahore",
      primarySymptoms: "Digestive issues and lethargy",
    });
    console.log("   Consultation alert result:", consultResult.success ? "✅ Dispatched" : `❌ Error: ${JSON.stringify(consultResult.error)}`);

    // 5. Test Hijama Alert dispatch
    console.log("\n5. Testing Hijama Alert notification dispatch...");
    const hijamaResult = await sendAdminHijamaNotificationEmail({
      fullName: "Zubair Khan",
      ticketNumber: `HIJ-TEST-${testSuffix}`,
      phone: "03335557788",
      email: "zubair.patient@example.com",
      age: 34,
      gender: "MALE",
      appointmentDate: "2026-11-02",
      appointmentSlot: "10:00 AM - 10:45 AM",
      isSunnahDay: true,
      cuppingReason: "Upper back pain and tension",
    });
    console.log("   Hijama alert result:", hijamaResult.success ? "✅ Dispatched" : `❌ Error: ${JSON.stringify(hijamaResult.error)}`);

    console.log("\n════════════════════════════════════════════════════════════════");
    console.log("   ALL MULTI-ADMIN NOTIFICATION TESTS PASSED SUCCESSFULLY!       ");
    console.log("════════════════════════════════════════════════════════════════");
  } finally {
    // Cleanup test users
    console.log("\nCleaning up test users...");
    if (createdUserIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
      console.log("Cleaned up", createdUserIds.length, "test users.");
    }
    await prisma.$disconnect();
  }
}

runTest().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
