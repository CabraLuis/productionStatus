import type { APIRoute } from "astro";
import CMMController from "../../../lib/CMMController";
import { prisma } from "../../../lib/prisma";

function fromDateToString(date: Date) {
  date = new Date(+date);
  date.setTime(date.getTime() - date.getTimezoneOffset() * 60000);
  let dateAsString = date.toISOString();
  return dateAsString;
}

export const GET: APIRoute = async () => {
  const workOrders = await prisma.workOrder.findMany({
    take: 18,
    include: {
      part: true,
      status: true,
      step: true,
      partStatusRegistry: true,
      technician: {
        include: {
          area: true,
        },
      },
      operator: {
        include: {
          beeper: true,
        },
      },
      deliveredBy: true,
      deliveredTo: true,
    },
    orderBy: {
      changedAt: "desc",
    },
    where: {
      deliveredToId: 1,
    },
  });
  return new Response(JSON.stringify(workOrders), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const PATCH: APIRoute = async ({ request }) => {
  const { workOrderId, estimatedTime, technicianId, rejected, statusId } =
    await request.json();

  const newStatus = Number(statusId);
  const woId = Number(workOrderId);

  if (isNaN(woId)) {
    return new Response(
      JSON.stringify({ error: "Invalid or missing work order ID" }),
      {
        status: 400,
      },
    );
  }

  await prisma.$transaction(async (tx) => {
    const workOrder = await tx.workOrder.findUnique({
      where: { id: woId },
    });

    if (!workOrder) {
      throw new Error("Work order not found");
    }

    const updatedWO = await tx.workOrder.update({
      where: { id: woId },
      data: {
        statusId: newStatus,
        rejected: rejected || workOrder.rejected,
        estimatedTime: Number(estimatedTime) || workOrder.estimatedTime,
        technicianId: Number(technicianId) || workOrder.technicianId,
        changedAt: new Date(),
      },
    });

    const now = new Date();

    await tx.workOrderStatusRegistry.create({
      data: {
        workOrderId: updatedWO.id,
        statusId: newStatus,
        startedAt: now,
        rejected: updatedWO.rejected ?? false,
        elapsedTime: 0,
      },
    });

    const prevRegistry = await tx.workOrderStatusRegistry.findFirst({
      where: { workOrderId: updatedWO.id, statusId: newStatus - 1 },
      orderBy: { startedAt: "desc" },
    });

    if (prevRegistry) {
      const elapsedMinutes = Math.round(
        (now.getTime() - prevRegistry.startedAt.getTime()) / 60000,
      );

      await tx.workOrderStatusRegistry.update({
        where: { id: prevRegistry.id },
        data: { elapsedTime: elapsedMinutes },
      });

      if (newStatus === 3) {
        const delay = elapsedMinutes - updatedWO.estimatedTime;

        await tx.workOrder.update({
          where: { id: updatedWO.id },
          data: { timeDelayed: delay > 0 ? delay : 0 },
        });
      }
    }
  });

  CMMController.getInstance().addOrUpdate();
  return new Response(null, { status: 201 });
};
