import type { APIRoute } from "astro";
import { prisma } from "../../lib/prisma";

export const POST: APIRoute = async ({ request, cookies }) => {
  const { user } = await request.json();
  const authorizedUser = await prisma.authorizedUser.findUnique({
    where: { email: user.email, password: user.password },
  });

  if (!authorizedUser) {
    return new Response(null, { status: 401 });
  }

  cookies.set("auth", `${authorizedUser.id}`, { path: "/", maxAge: 34560000 });

  if (authorizedUser.id === 3) {
    return new Response(JSON.stringify({ message: "CMM" }), { status: 200 });
  } else if (authorizedUser.id === 1) {
    return new Response(JSON.stringify({ message: "PRODOPS" }), {
      status: 200,
    });
  } else if (authorizedUser.id === 2) {
    return new Response(JSON.stringify({ message: "PRODSUP" }), {
      status: 200,
    });
  } else if (authorizedUser.id === 4) {
    return new Response(JSON.stringify({ message: "CLEANLINE" }), {
      status: 200,
    });
  } else {
    return new Response(null, { status: 401 });
  }
};
