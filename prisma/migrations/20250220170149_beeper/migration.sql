-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "beeperId" INTEGER;

-- CreateTable
CREATE TABLE "BeeperAsignee" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "BeeperAsignee_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_beeperId_fkey" FOREIGN KEY ("beeperId") REFERENCES "BeeperAsignee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
