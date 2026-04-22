-- CreateTable
CREATE TABLE "NeededPosition" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "teamPositionName" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "scheduledTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NeededPosition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NeededPosition_externalId_key" ON "NeededPosition"("externalId");

-- CreateIndex
CREATE INDEX "NeededPosition_externalId_idx" ON "NeededPosition"("externalId");

-- CreateIndex
CREATE INDEX "NeededPosition_planId_idx" ON "NeededPosition"("planId");

-- AddForeignKey
ALTER TABLE "NeededPosition" ADD CONSTRAINT "NeededPosition_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
