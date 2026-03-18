/*
  Warnings:

  - You are about to drop the column `beeperId` on the `WorkOrder` table. All the data in the column will be lost.
  - You are about to drop the column `cmmTechId` on the `WorkOrder` table. All the data in the column will be lost.
  - You are about to drop the column `deliveredBy` on the `WorkOrder` table. All the data in the column will be lost.
  - You are about to drop the column `employee` on the `WorkOrder` table. All the data in the column will be lost.
  - You are about to drop the column `priorityId` on the `WorkOrder` table. All the data in the column will be lost.
  - You are about to drop the column `receivedAt` on the `WorkOrder` table. All the data in the column will be lost.
  - You are about to drop the `BeeperAsignee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CMMTech` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Priority` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `changedAt` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveredById` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveredToId` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priority` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `techId` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "WorkOrder" DROP CONSTRAINT "WorkOrder_beeperId_fkey";

-- DropForeignKey
ALTER TABLE "WorkOrder" DROP CONSTRAINT "WorkOrder_cmmTechId_fkey";

-- DropForeignKey
ALTER TABLE "WorkOrder" DROP CONSTRAINT "WorkOrder_deliveredBy_fkey";

-- DropForeignKey
ALTER TABLE "WorkOrder" DROP CONSTRAINT "WorkOrder_priorityId_fkey";

-- AlterTable
ALTER TABLE "WorkOrder" DROP COLUMN "beeperId",
DROP COLUMN "cmmTechId",
DROP COLUMN "deliveredBy",
DROP COLUMN "employee",
DROP COLUMN "priorityId",
DROP COLUMN "receivedAt",
ADD COLUMN     "areaId" INTEGER,
ADD COLUMN     "changedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "deliveredById" INTEGER NOT NULL,
ADD COLUMN     "deliveredToId" INTEGER NOT NULL,
ADD COLUMN     "priority" INTEGER NOT NULL,
ADD COLUMN     "techId" INTEGER NOT NULL,
ALTER COLUMN "rejected" DROP NOT NULL;

-- DropTable
DROP TABLE "BeeperAsignee";

-- DropTable
DROP TABLE "CMMTech";

-- DropTable
DROP TABLE "Priority";

-- CreateTable
CREATE TABLE "Technician" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Technician_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Operator" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "areaId" INTEGER NOT NULL,
    "beeperId" INTEGER,

    CONSTRAINT "Operator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Beeper" (
    "id" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,

    CONSTRAINT "Beeper_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Beeper_number_key" ON "Beeper"("number");

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_techId_fkey" FOREIGN KEY ("techId") REFERENCES "Technician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_deliveredById_fkey" FOREIGN KEY ("deliveredById") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_deliveredToId_fkey" FOREIGN KEY ("deliveredToId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operator" ADD CONSTRAINT "Operator_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operator" ADD CONSTRAINT "Operator_beeperId_fkey" FOREIGN KEY ("beeperId") REFERENCES "Beeper"("id") ON DELETE SET NULL ON UPDATE CASCADE;
