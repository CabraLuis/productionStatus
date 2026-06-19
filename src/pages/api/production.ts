import type { APIRoute } from "astro";
import CleanLineController from "../../lib/CleanLineController";
import { prisma } from "../../lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import CMMController from "../../lib/CMMController";
import KittingController from "../../lib/KittingController";

dayjs.extend(utc);
dayjs.extend(timezone);

export const POST: APIRoute = async ({ request, cookies }) => {
  const { workOrder } = await request.json();
  if (!workOrder.part || !workOrder.quantity) {
    return new Response("Invalid data", { status: 400 });
  }

  const newPart = await prisma.part.upsert({
    where: {
      number: workOrder.part,
    },
    update: {},
    create: {
      number: workOrder.part,
    },
  });

  let newStep;
  if (workOrder.step) {
    newStep = await prisma.step.upsert({
      where: {
        step: parseInt(workOrder.step),
      },
      update: {},
      create: {
        step: parseInt(workOrder.step),
      },
    });
  }

  const deliveredToArea = await prisma.area.findUnique({
    where: { id: Number(workOrder.deliveredTo) },
  });
  if (!deliveredToArea) {
    return new Response("Invalid destination area", { status: 400 });
  }

  cookies.set("area", `${workOrder.deliveredBy}`, {
    path: "/",
    maxAge: 34560000,
  });

  cookies.set("deliverTo", `${workOrder.deliveredTo}`, {
    path: "/",
    maxAge: 34560000,
  });

  const newWorkOrder = await prisma.workOrder.create({
    data: {
      partId: newPart.id,
      workOrder: workOrder.workOrder,
      quantity: parseInt(workOrder.quantity),
      stepId: newStep ? newStep.id : null,
      deliveredToId: deliveredToArea.id,
      deliveredById: Number(workOrder.deliveredBy),
      changedAt: new Date(),
      priority: 3,
      statusId: 1,
      estimatedTime: 0,
      rejected: false,
      operatorId:
        workOrder.operatorId === " " ? null : parseInt(workOrder.operatorId),
    },
  });

  await prisma.workOrderStatusRegistry.create({
    data: {
      workOrderId: newWorkOrder.id,
      statusId: newWorkOrder.statusId,
      startedAt: newWorkOrder.changedAt,
      rejected: newWorkOrder.rejected ?? false,
      elapsedTime: 0,
    },
  });
  console.log("-----------------------------");
  console.log("NEW WORK ORDER");
  console.log("Date: " + new Date().toISOString());
  console.log("WorkOrder No.: " + newWorkOrder.workOrder);
  console.log("WorkOrder ID: " + newWorkOrder.id);
  console.log("-----------------------------");
  CleanLineController.getInstance().addOrUpdate();
  CMMController.getInstance().addOrUpdate();
  KittingController.getInstance().addOrUpdate();
  return new Response(null, { status: 201 });
};

export const GET: APIRoute = async ({ url }) => {
  try {
    const deliveredTo = Number(url.searchParams.get("deliveredTo"));

    const include = {
      deliveredBy: true,
      part: true,
      status: true,
      step: true,
      partStatusRegistry: true,
      operator: {
        include: { beeper: true },
      },
    };

    const mapDates = (wo: any) => ({
      ...wo,
      changedAt: dayjs
        .utc(wo.changedAt)
        .tz("America/Chicago")
        .format("YYYY-MM-DD HH:mm:ss"),
    });

    const [standby, measuring, done] = await Promise.all([
      prisma.workOrder.findMany({
        where: { deliveredTo: { id: deliveredTo }, statusId: 1 },
        include,
        orderBy: { changedAt: "desc" },
      }),
      prisma.workOrder.findMany({
        where: { deliveredTo: { id: deliveredTo }, statusId: 2 },
        include,
        orderBy: { changedAt: "desc" },
      }),
      prisma.workOrder.findMany({
        take: 18,
        where: { deliveredTo: { id: deliveredTo }, statusId: 3 },
        include,
        orderBy: { changedAt: "desc" },
      }),
    ]);

    return new Response(
      JSON.stringify({
        standby: standby.map(mapDates),
        measuring: measuring.map(mapDates),
        done: done.map(mapDates),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error al obtener órdenes" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const PATCH: APIRoute = async ({ request }) => {
  const { workOrder, priority } = await request.json();

  const updatedWorkOrder = await prisma.workOrder.update({
    where: { id: Number(workOrder) },
    data: {
      priority: parseInt(priority),
    },
    include: { partStatusRegistry: true },
  });

  console.log("-----------------------------");
  console.log("PATCHED WORK ORDER");
  console.log("Date: " + new Date().toISOString());
  console.log("WorkOrder No.: " + updatedWorkOrder.workOrder);
  console.log("WorkOrder ID: " + updatedWorkOrder.id);
  console.log("Changed priority: " + priority);
  console.log("-----------------------------");

  CleanLineController.getInstance().addOrUpdate();
  CMMController.getInstance().addOrUpdate();
  KittingController.getInstance().addOrUpdate();
  return new Response(null, { status: 201 });
};
