/*
  Warnings:

  - You are about to drop the column `areaId` on the `WorkOrder` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "WorkOrder" DROP CONSTRAINT "WorkOrder_areaId_fkey";

-- AlterTable
ALTER TABLE "WorkOrder" DROP COLUMN "areaId";
