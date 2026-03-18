import type { APIRoute } from "astro";
import { prisma } from "../../lib/prisma";

export const GET: APIRoute = async ({ url }) => {
  try {
    const deliveredTo = url.searchParams.get("deliveredTo");

    const [parts, steps, areas, status, operators, technicians] =
      await Promise.all([
        prisma.part.findMany(),
        prisma.step.findMany(),
        prisma.area.findMany(),
        prisma.status.findMany(),
        prisma.operator.findMany({
          include: {
            beeper: true,
          },
        }),
        prisma.technician.findMany({
          include: {
            area: true,
          },
          where: { areaId: deliveredTo ? parseInt(deliveredTo) : undefined },
        }),
      ]);
    return new Response(
      JSON.stringify({
        info: {
          parts,
          steps,
          areas,
          status,
          operators,
          technicians,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error al obtener catálogos" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
