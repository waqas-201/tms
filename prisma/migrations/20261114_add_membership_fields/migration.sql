-- AlterTable
ALTER TABLE "user" ADD COLUMN "membershipId" TEXT;
ALTER TABLE "user" ADD COLUMN "signupSource" TEXT NOT NULL DEFAULT 'WEBSITE';

-- CreateIndex
CREATE UNIQUE INDEX "user_membershipId_key" ON "user"("membershipId");

-- CreateIndex
CREATE INDEX "user_phone_idx" ON "user"("phone");

-- CreateIndex
CREATE INDEX "user_signupSource_idx" ON "user"("signupSource");
