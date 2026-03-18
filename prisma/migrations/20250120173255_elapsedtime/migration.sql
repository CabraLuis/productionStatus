/*
  Warnings:

  - Added the required column `elapsedTime` to the `WorkOrderStatusRegistry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkOrderStatusRegistry" ADD COLUMN     "elapsedTime" INTEGER NOT NULL;
