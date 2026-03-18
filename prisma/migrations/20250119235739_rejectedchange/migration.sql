/*
  Warnings:

  - You are about to drop the column `rejected` on the `WorkOrderStatusRegistry` table. All the data in the column will be lost.
  - Added the required column `rejected` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "rejected" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "WorkOrderStatusRegistry" DROP COLUMN "rejected";
