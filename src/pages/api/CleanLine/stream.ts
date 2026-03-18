import type { APIRoute } from "astro";
import CleanLineController from "../../../lib/CleanLineController";

export const GET: APIRoute = async () => {
  let sendEvent: () => void;
  let heartbeatInterval: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      sendEvent = () => {
        controller.enqueue(encoder.encode(`data: UPDATED\n\n`));
      };

      // ping cada 30 segundos para mantener la conexión viva
      heartbeatInterval = setInterval(() => {
        controller.enqueue(encoder.encode(`: ping\n\n`));
      }, 30000);

      CleanLineController.getInstance().unsub(sendEvent);
      CleanLineController.getInstance().sub(sendEvent);
    },
    cancel() {
      CleanLineController.getInstance().unsub(sendEvent);
      clearInterval(heartbeatInterval);
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
};
