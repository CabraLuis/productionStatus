/*
  Warnings:

  - Added the required column `rejected` to the `WorkOrderStatusRegistry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkOrderStatusRegistry" ADD COLUMN     "rejected" BOOLEAN NOT NULL;
