/*
  Warnings:

  - You are about to drop the column `timeDelayed` on the `WorkOrder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WorkOrder" DROP COLUMN "timeDelayed";

-- AlterTable
ALTER TABLE "WorkOrderStatusRegistry" ADD COLUMN     "timeDelayed" TEXT;
