/*
  Warnings:

  - You are about to drop the column `rejected` on the `WorkOrder` table. All the data in the column will be lost.
  - Added the required column `rejected` to the `WorkOrderStatusRegistry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkOrder" DROP COLUMN "rejected";

-- AlterTable
ALTER TABLE "WorkOrderStatusRegistry" ADD COLUMN     "rejected" BOOLEAN NOT NULL;
