-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "dept" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "siteCode" TEXT,
    "client" TEXT,
    "gitlabUrl" TEXT,
    "gitlabToken" TEXT,
    "gitlabProjectId" TEXT,
    "gitlabBranch" TEXT,
    "gitlabAuthorEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entry" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "projectId" INTEGER,
    "weekKey" TEXT NOT NULL,
    "dateLabel" TEXT NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "customProjectName" TEXT,
    "tree" JSONB NOT NULL DEFAULT '[]',
    "isOffsite" BOOLEAN NOT NULL DEFAULT false,
    "offsitePlace" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DayStatus" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "weekKey" TEXT NOT NULL,
    "dateLabel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'normal',

    CONSTRAINT "DayStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeekSummary" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "weekKey" TEXT NOT NULL,
    "thisWeek" TEXT,
    "nextWeek" TEXT,

    CONSTRAINT "WeekSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- CreateIndex
CREATE INDEX "Entry_userId_weekKey_idx" ON "Entry"("userId", "weekKey");

-- CreateIndex
CREATE INDEX "Entry_userId_weekKey_dateLabel_timeSlot_idx" ON "Entry"("userId", "weekKey", "dateLabel", "timeSlot");

-- CreateIndex
CREATE INDEX "DayStatus_userId_weekKey_idx" ON "DayStatus"("userId", "weekKey");

-- CreateIndex
CREATE UNIQUE INDEX "DayStatus_userId_weekKey_dateLabel_key" ON "DayStatus"("userId", "weekKey", "dateLabel");

-- CreateIndex
CREATE INDEX "WeekSummary_userId_idx" ON "WeekSummary"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WeekSummary_userId_weekKey_key" ON "WeekSummary"("userId", "weekKey");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayStatus" ADD CONSTRAINT "DayStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeekSummary" ADD CONSTRAINT "WeekSummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
