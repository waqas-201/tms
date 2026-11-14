-- AlterTable
ALTER TABLE "user" ADD COLUMN "referralCode" TEXT;
ALTER TABLE "user" ADD COLUMN "referredById" TEXT;
ALTER TABLE "user" ADD COLUMN "isReferralRewardClaimed" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "user_referralCode_key" ON "user"("referralCode");

-- CreateIndex
CREATE INDEX "user_referredById_idx" ON "user"("referredById");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
