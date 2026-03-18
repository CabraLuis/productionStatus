/*
  Warnings:

  - Added the required column `timeDelayed` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "timeDelayed" INTEGER NOT NULL;
