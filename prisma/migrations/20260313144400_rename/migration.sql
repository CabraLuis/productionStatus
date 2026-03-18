/*
  Warnings:

  - You are about to drop the column `techId` on the `WorkOrder` table. All the data in the column will be lost.
  - Added the required column `areaId` to the `Technician` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "WorkOrder" DROP CONSTRAINT "WorkOrder_techId_fkey";

-- AlterTable
ALTER TABLE "Technician" ADD COLUMN     "areaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "WorkOrder" DROP COLUMN "techId",
ADD COLUMN     "technicianId" INTEGER;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "Technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Technician" ADD CONSTRAINT "Technician_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
