-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" SERIAL NOT NULL,
    "workOrder" INTEGER NOT NULL,
    "partNum" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "step" INTEGER NOT NULL,
    "deliveredBy" INTEGER NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "priority" TEXT NOT NULL,
    "statusId" INTEGER NOT NULL,

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Status" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrderStatusRegistry" (
    "id" SERIAL NOT NULL,
    "workOrderId" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrderStatusRegistry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" SERIAL NOT NULL,
    "area" TEXT NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthorizedUser" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "AuthorizedUser_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_deliveredBy_fkey" FOREIGN KEY ("deliveredBy") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderStatusRegistry" ADD CONSTRAINT "WorkOrderStatusRegistry_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderStatusRegistry" ADD CONSTRAINT "WorkOrderStatusRegistry_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
