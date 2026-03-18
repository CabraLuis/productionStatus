/*
  Warnings:

  - Added the required column `estimatedTime` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rejected` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "estimatedTime" INTEGER NOT NULL,
ADD COLUMN     "rejected" BOOLEAN NOT NULL;
