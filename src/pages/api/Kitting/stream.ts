import type { APIRoute } from "astro";
import KittingController from "../../../lib/KittingController";

export const GET: APIRoute = async () => {
  let sendEvent: () => void;
  let heartbeatInterval: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      sendEvent = () => {
        controller.enqueue(encoder.encode(`data: UPDATED\n\n`));
      };

      heartbeatInterval = setInterval(() => {
        controller.enqueue(encoder.encode(`: ping\n\n`));
      }, 30000);

      KittingController.getInstance().unsub(sendEvent);
      KittingController.getInstance().sub(sendEvent);
    },
    cancel() {
      KittingController.getInstance().unsub(sendEvent);
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
