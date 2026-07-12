/*
  Warnings:

  - Added the required column `goalCloseDate` to the `GoalCycle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `goalOpenDate` to the `GoalCycle` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CheckinPeriod" AS ENUM ('Q1', 'Q2', 'Q3', 'Q4');

-- AlterTable
ALTER TABLE "GoalCycle" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "goalCloseDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "goalOpenDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "CheckinWindow" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "period" "CheckinPeriod" NOT NULL,
    "openDate" TIMESTAMP(3) NOT NULL,
    "closeDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckinWindow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CheckinWindow_cycleId_period_key" ON "CheckinWindow"("cycleId", "period");

-- AddForeignKey
ALTER TABLE "CheckinWindow" ADD CONSTRAINT "CheckinWindow_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "GoalCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
