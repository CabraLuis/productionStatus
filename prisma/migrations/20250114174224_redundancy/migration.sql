/*
  Warnings:

  - You are about to drop the column `stepId` on the `WorkOrder` table. All the data in the column will be lost.
  - You are about to drop the `Step` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `step` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "WorkOrder" DROP CONSTRAINT "WorkOrder_stepId_fkey";

-- AlterTable
ALTER TABLE "WorkOrder" DROP COLUMN "stepId",
ADD COLUMN     "step" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Step";
