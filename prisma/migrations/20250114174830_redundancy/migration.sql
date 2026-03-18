/*
  Warnings:

  - A unique constraint covering the columns `[area]` on the table `Area` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `AuthorizedUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[number]` on the table `Part` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[status]` on the table `Status` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workOrder]` on the table `WorkOrder` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Area_area_key" ON "Area"("area");

-- CreateIndex
CREATE UNIQUE INDEX "AuthorizedUser_email_key" ON "AuthorizedUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Part_number_key" ON "Part"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Status_status_key" ON "Status"("status");

-- CreateIndex
CREATE UNIQUE INDEX "WorkOrder_workOrder_key" ON "WorkOrder"("workOrder");
