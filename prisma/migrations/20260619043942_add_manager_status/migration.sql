/*
  Warnings:

  - Added the required column `gender` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Manager` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ManagerStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "gender" "Gender" NOT NULL;

-- AlterTable
ALTER TABLE "Manager" ADD COLUMN     "gender" "Gender" NOT NULL,
ADD COLUMN     "status" "ManagerStatus" NOT NULL DEFAULT 'ACTIVE';
