/*
  Warnings:

  - You are about to drop the column `area` on the `Area` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Area` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Area` table without a default value. This is not possible if the table is not empty.
  - Added the required column `operatorId` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Area_area_key";

-- AlterTable
ALTER TABLE "Area" DROP COLUMN "area",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "operatorId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Area_name_key" ON "Area"("name");

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
