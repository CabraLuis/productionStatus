-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "cmmTechId" INTEGER;

-- CreateTable
CREATE TABLE "CMMTech" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CMMTech_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_cmmTechId_fkey" FOREIGN KEY ("cmmTechId") REFERENCES "CMMTech"("id") ON DELETE SET NULL ON UPDATE CASCADE;
