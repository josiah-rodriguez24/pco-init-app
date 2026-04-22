-- AlterTable
ALTER TABLE "PlanPerson" ADD COLUMN     "personExternalId" TEXT;

-- AlterTable
ALTER TABLE "TeamPosition" ADD COLUMN     "negativeTagGroups" JSONB,
ADD COLUMN     "tagGroups" JSONB,
ADD COLUMN     "tags" JSONB,
ADD COLUMN     "teamId" TEXT;

-- CreateIndex
CREATE INDEX "PlanPerson_personExternalId_idx" ON "PlanPerson"("personExternalId");

-- CreateIndex
CREATE INDEX "TeamPosition_teamId_idx" ON "TeamPosition"("teamId");

-- AddForeignKey
ALTER TABLE "TeamPosition" ADD CONSTRAINT "TeamPosition_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
