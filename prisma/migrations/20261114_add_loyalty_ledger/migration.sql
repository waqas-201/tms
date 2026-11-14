CREATE TABLE "loyalty_ledger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "referenceId" TEXT,
    "balanceAfter" INTEGER NOT NULL,
    "reason" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_ledger_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "loyalty_ledger_userId_source_referenceId_type_key" ON "loyalty_ledger"("userId", "source", "referenceId", "type");
CREATE INDEX "loyalty_ledger_userId_idx" ON "loyalty_ledger"("userId");
CREATE INDEX "loyalty_ledger_createdAt_idx" ON "loyalty_ledger"("createdAt");

ALTER TABLE "loyalty_ledger" ADD CONSTRAINT "loyalty_ledger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
