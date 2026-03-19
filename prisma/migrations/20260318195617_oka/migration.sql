-- DropForeignKey
ALTER TABLE "WorkOrder" DROP CONSTRAINT "WorkOrder_operatorId_fkey";

-- DropIndex
DROP INDEX "WorkOrder_workOrder_key";

-- AlterTable
ALTER TABLE "WorkOrder" ALTER COLUMN "operatorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
