/*
  Warnings:

  - You are about to drop the column `step` on the `WorkOrder` table. All the data in the column will be lost.
  - Added the required column `stepId` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkOrder" DROP COLUMN "step",
ADD COLUMN     "stepId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Step" (
    "id" SERIAL NOT NULL,
    "step" INTEGER NOT NULL,

    CONSTRAINT "Step_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Step_step_key" ON "Step"("step");

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "Step"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
