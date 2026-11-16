import {
  getMarketingSettings,
  updateMarketingSettings,
  DEFAULT_MARKETING_SETTINGS,
} from "../lib/marketing-settings";
import {
  validateReferralCode,
  applyReferralAttribution,
  processReferralRewardOnDelivery,
  getUserReferralStats,
} from "../lib/referrals";

async function runTests() {
  console.log("=== STARTING COUPON, REFERRAL & LOYALTY GOVERNANCE TESTS ===");

  // 1. Initial State: Referrals should be disabled by default (admin control)
  const initialSettings = await getMarketingSettings();
  console.log("1. Initial isReferralActive:", initialSettings.isReferralActive);
  if (initialSettings.isReferralActive !== false) {
    throw new Error("Expected isReferralActive to be false initially as per user instruction.");
  }
  console.log("✔ Pass: isReferralActive is false by default.");

  // 2. Validate referral code when disabled
  const disabledValidation = await validateReferralCode("REF-10001", {
    userId: "test_user_1",
  });
  console.log("2. Disabled referral validation:", disabledValidation);
  if (disabledValidation.valid !== false || !disabledValidation.reason?.includes("paused or inactive")) {
    throw new Error("Expected validation to fail with paused/inactive message when referrals are disabled.");
  }
  console.log("✔ Pass: validateReferralCode correctly blocks codes when disabled.");

  // 3. Attribution when disabled
  const disabledAttribution = await applyReferralAttribution("test_referee", "REF-10001");
  console.log("3. Disabled referral attribution:", disabledAttribution);
  if (disabledAttribution.success !== false) {
    throw new Error("Expected attribution to fail when referrals are disabled.");
  }
  console.log("✔ Pass: applyReferralAttribution blocks assignment when disabled.");

  // 4. Test toggling marketing settings to active
  const updatedSettings = await updateMarketingSettings({
    isReferralActive: true,
    referrerRewardPoints: 150,
  });
  console.log("4. Updated isReferralActive:", updatedSettings.isReferralActive, "Reward points:", updatedSettings.referrerRewardPoints);
  if (updatedSettings.isReferralActive !== true || updatedSettings.referrerRewardPoints !== 150) {
    throw new Error("Failed to update marketing settings.");
  }
  console.log("✔ Pass: updateMarketingSettings successfully updates settings.");

  // 5. Toggle back to false to restore requested disabled state
  await updateMarketingSettings({
    isReferralActive: false,
    referrerRewardPoints: 100,
  });
  const restoredSettings = await getMarketingSettings();
  console.log("5. Restored isReferralActive:", restoredSettings.isReferralActive);
  if (restoredSettings.isReferralActive !== false) {
    throw new Error("Failed to restore isReferralActive to false.");
  }
  console.log("✔ Pass: isReferralActive safely restored to false.");

  // 6. Test Loyalty Calculations
  const subtotal = 3000;
  const expectedEarn = Math.floor(subtotal * restoredSettings.apothecaryEarnPercent);
  const expectedCap = Math.floor(subtotal * restoredSettings.maxRedemptionSubtotalCap);
  console.log(`6. Loyalty Calculation: For subtotal ₨ ${subtotal} -> Earn: ${expectedEarn} pts (₨ ${expectedEarn}), Max Burn: ${expectedCap} pts (₨ ${expectedCap})`);
  if (expectedEarn !== 60 || expectedCap !== 300) {
    throw new Error(`Unexpected loyalty calculation: earn=${expectedEarn}, cap=${expectedCap}`);
  }
  console.log("✔ Pass: Loyalty calculations match 2% earn and 10% subtotal cap.");

  console.log("\n=== ALL COUPON, REFERRAL & LOYALTY TESTS PASSED! ===");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
