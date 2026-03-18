/*
  Warnings:

  - You are about to drop the column `timeDelayed` on the `WorkOrderStatusRegistry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "timeDelayed" TEXT;

-- AlterTable
ALTER TABLE "WorkOrderStatusRegistry" DROP COLUMN "timeDelayed";
