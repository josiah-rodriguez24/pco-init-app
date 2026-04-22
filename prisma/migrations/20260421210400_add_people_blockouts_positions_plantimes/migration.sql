-- CreateTable
CREATE TABLE "AppUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceType" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "frequency" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "serviceTypeId" TEXT NOT NULL,
    "title" TEXT,
    "dates" TEXT,
    "sortDate" TIMESTAMP(3),
    "seriesTitle" TEXT,
    "status" TEXT,
    "totalLength" INTEGER,
    "planningCenterUrl" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "serviceTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sequence" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanTeam" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,

    CONSTRAINT "PlanTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanPerson" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "personId" TEXT,
    "personName" TEXT NOT NULL,
    "personEmail" TEXT,
    "teamName" TEXT,
    "status" TEXT,
    "position" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "itemType" TEXT,
    "sequence" INTEGER,
    "length" INTEGER,
    "songId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Song" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "ccliNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "photoThumbnail" TEXT,
    "status" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blockout" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "description" TEXT,
    "reason" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "repeatFrequency" TEXT,
    "repeatPeriod" TEXT,
    "repeatInterval" TEXT,
    "repeatUntil" TIMESTAMP(3),
    "timeZone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blockout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamPosition" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "serviceTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sequence" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonTeamPositionAssignment" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "teamPositionId" TEXT NOT NULL,
    "schedulePreference" TEXT,
    "preferredWeeks" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonTeamPositionAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanTime" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "name" TEXT,
    "timeType" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncJob" (
    "id" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "itemsSynced" INTEGER NOT NULL DEFAULT 0,
    "itemsFailed" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_email_key" ON "AppUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceType_externalId_key" ON "ServiceType"("externalId");

-- CreateIndex
CREATE INDEX "ServiceType_externalId_idx" ON "ServiceType"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_externalId_key" ON "Plan"("externalId");

-- CreateIndex
CREATE INDEX "Plan_externalId_idx" ON "Plan"("externalId");

-- CreateIndex
CREATE INDEX "Plan_serviceTypeId_idx" ON "Plan"("serviceTypeId");

-- CreateIndex
CREATE INDEX "Plan_sortDate_idx" ON "Plan"("sortDate");

-- CreateIndex
CREATE UNIQUE INDEX "Team_externalId_key" ON "Team"("externalId");

-- CreateIndex
CREATE INDEX "Team_externalId_idx" ON "Team"("externalId");

-- CreateIndex
CREATE INDEX "Team_serviceTypeId_idx" ON "Team"("serviceTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanTeam_planId_teamId_key" ON "PlanTeam"("planId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanPerson_externalId_key" ON "PlanPerson"("externalId");

-- CreateIndex
CREATE INDEX "PlanPerson_externalId_idx" ON "PlanPerson"("externalId");

-- CreateIndex
CREATE INDEX "PlanPerson_planId_idx" ON "PlanPerson"("planId");

-- CreateIndex
CREATE INDEX "PlanPerson_personId_idx" ON "PlanPerson"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "Item_externalId_key" ON "Item"("externalId");

-- CreateIndex
CREATE INDEX "Item_externalId_idx" ON "Item"("externalId");

-- CreateIndex
CREATE INDEX "Item_planId_idx" ON "Item"("planId");

-- CreateIndex
CREATE INDEX "Item_songId_idx" ON "Item"("songId");

-- CreateIndex
CREATE UNIQUE INDEX "Song_externalId_key" ON "Song"("externalId");

-- CreateIndex
CREATE INDEX "Song_externalId_idx" ON "Song"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Person_externalId_key" ON "Person"("externalId");

-- CreateIndex
CREATE INDEX "Person_externalId_idx" ON "Person"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Blockout_externalId_key" ON "Blockout"("externalId");

-- CreateIndex
CREATE INDEX "Blockout_externalId_idx" ON "Blockout"("externalId");

-- CreateIndex
CREATE INDEX "Blockout_personId_idx" ON "Blockout"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamPosition_externalId_key" ON "TeamPosition"("externalId");

-- CreateIndex
CREATE INDEX "TeamPosition_externalId_idx" ON "TeamPosition"("externalId");

-- CreateIndex
CREATE INDEX "TeamPosition_serviceTypeId_idx" ON "TeamPosition"("serviceTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonTeamPositionAssignment_externalId_key" ON "PersonTeamPositionAssignment"("externalId");

-- CreateIndex
CREATE INDEX "PersonTeamPositionAssignment_externalId_idx" ON "PersonTeamPositionAssignment"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonTeamPositionAssignment_personId_teamPositionId_key" ON "PersonTeamPositionAssignment"("personId", "teamPositionId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanTime_externalId_key" ON "PlanTime"("externalId");

-- CreateIndex
CREATE INDEX "PlanTime_externalId_idx" ON "PlanTime"("externalId");

-- CreateIndex
CREATE INDEX "PlanTime_planId_idx" ON "PlanTime"("planId");

-- CreateIndex
CREATE INDEX "WebhookEvent_eventType_idx" ON "WebhookEvent"("eventType");

-- CreateIndex
CREATE INDEX "WebhookEvent_createdAt_idx" ON "WebhookEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanTeam" ADD CONSTRAINT "PlanTeam_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanTeam" ADD CONSTRAINT "PlanTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanPerson" ADD CONSTRAINT "PlanPerson_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanPerson" ADD CONSTRAINT "PlanPerson_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blockout" ADD CONSTRAINT "Blockout_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamPosition" ADD CONSTRAINT "TeamPosition_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonTeamPositionAssignment" ADD CONSTRAINT "PersonTeamPositionAssignment_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonTeamPositionAssignment" ADD CONSTRAINT "PersonTeamPositionAssignment_teamPositionId_fkey" FOREIGN KEY ("teamPositionId") REFERENCES "TeamPosition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanTime" ADD CONSTRAINT "PlanTime_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
