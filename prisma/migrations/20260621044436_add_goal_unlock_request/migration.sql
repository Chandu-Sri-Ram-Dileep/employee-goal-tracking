-- CreateEnum
CREATE TYPE "UnlockRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "GoalUnlockRequest" (
    "id" TEXT NOT NULL,
    "goalSheetId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "managerId" TEXT,
    "reason" TEXT NOT NULL,
    "status" "UnlockRequestStatus" NOT NULL DEFAULT 'PENDING',
    "managerRemarks" TEXT,
    "adminRemarks" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoalUnlockRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GoalUnlockRequest" ADD CONSTRAINT "GoalUnlockRequest_goalSheetId_fkey" FOREIGN KEY ("goalSheetId") REFERENCES "GoalSheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalUnlockRequest" ADD CONSTRAINT "GoalUnlockRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalUnlockRequest" ADD CONSTRAINT "GoalUnlockRequest_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Manager"("id") ON DELETE SET NULL ON UPDATE CASCADE;
