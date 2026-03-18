/*
  Warnings:

  - You are about to drop the column `partNum` on the `WorkOrder` table. All the data in the column will be lost.
  - You are about to drop the column `step` on the `WorkOrder` table. All the data in the column will be lost.
  - Added the required column `partId` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stepId` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkOrder" DROP COLUMN "partNum",
DROP COLUMN "step",
ADD COLUMN     "partId" INTEGER NOT NULL,
ADD COLUMN     "stepId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Part" (
    "id" SERIAL NOT NULL,
    "number" INTEGER NOT NULL,

    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Step" (
    "id" SERIAL NOT NULL,
    "step" INTEGER NOT NULL,

    CONSTRAINT "Step_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "Step"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
