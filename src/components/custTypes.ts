import type { Prisma } from "@prisma/client";

export type WorkOrder = Prisma.WorkOrderGetPayload<{
  include: {
    part: true;
    status: true;
    step: true;
    partStatusRegistry: true;
    deliveredTo: true;
    deliveredBy: true;
    technician: true;
    operator: {
      include: {
        beeper: true;
      };
    };
  };
}>;
