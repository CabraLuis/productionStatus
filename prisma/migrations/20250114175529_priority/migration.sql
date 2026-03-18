/*
  Warnings:

  - You are about to drop the column `priority` on the `WorkOrder` table. All the data in the column will be lost.
  - Added the required column `priorityId` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkOrder" DROP COLUMN "priority",
ADD COLUMN     "priorityId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Priority" (
    "id" SERIAL NOT NULL,
    "priority" TEXT NOT NULL,

    CONSTRAINT "Priority_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Priority_priority_key" ON "Priority"("priority");

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_priorityId_fkey" FOREIGN KEY ("priorityId") REFERENCES "Priority"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
