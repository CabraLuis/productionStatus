/*
  Warnings:

  - The `timeDelayed` column on the `WorkOrder` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "WorkOrder" DROP COLUMN "timeDelayed",
ADD COLUMN     "timeDelayed" INTEGER;
