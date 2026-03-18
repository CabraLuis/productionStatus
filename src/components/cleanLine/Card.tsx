import type { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "preact/hooks";
import type { WorkOrder } from "../custTypes";

interface CardProps {
  workOrder: WorkOrder;
  onButtonClick?: (wo: WorkOrder) => void;
  buttonText?: string;
}

export default function Card({
  workOrder,
  onButtonClick,
  buttonText,
}: CardProps) {
  const [counter, setCounter] = useState("00:00:00");
  const [isDelayed, setIsDelayed] = useState(false);

  const startTime = useMemo(
    () => dayjs(workOrder.changedAt),
    [workOrder.changedAt],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const diffSeconds = dayjs().diff(startTime, "second");
      const hours = Math.floor(diffSeconds / 3600)
        .toString()
        .padStart(2, "0");
      const minutes = Math.floor((diffSeconds % 3600) / 60)
        .toString()
        .padStart(2, "0");
      const seconds = Math.floor(diffSeconds % 60)
        .toString()
        .padStart(2, "0");
      setCounter(`${hours}:${minutes}:${seconds}`);

      const elapsedMinutes = Math.floor(diffSeconds / 60);
      setIsDelayed(elapsedMinutes >= workOrder.estimatedTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, workOrder.estimatedTime]);

  const priorityMap: Record<number, string> = {
    1: "badge-error",
    2: "badge-warning",
    3: "badge-success",
  };

  const prioritybg = priorityMap[workOrder.priority] ?? "badge-transparent";

  const border =
    {
      1: "border-black",
      2: "border-black",
      3: "border-success",
    }[workOrder.status.id] || "";

  const statusLabel =
    {
      1: "Recibido",
      2: "Limpiando",
      3: "Finalizado",
    }[workOrder.status.id] || "";

  const formattedDate = dayjs(workOrder.changedAt).format(
    "YYYY-MM-DD HH:mm:ss",
  );

  function handleClick() {
    onButtonClick?.(workOrder);
  }

  return (
    <div
      class={`stats grid-cols-2 mb-3 mx-4 bg-base-100 ${border} border-4 relative`}
    >
      <div class="absolute justify-self-center text-lg text-wrap w-28 text-center">
        {workOrder.status.id === 2 && (
          <>
            {counter}
            {isDelayed && (
              <div class="font-bold text-red-500 italic right-0 top-6 left-0 text-center absolute">
                RETARDO
              </div>
            )}
          </>
        )}

        {workOrder.status.id === 3 &&
          workOrder.timeDelayed &&
          workOrder.timeDelayed > 0 && (
            <div class="font-bold text-red-500 italic">
              RETARDO DE {workOrder.timeDelayed} min.
            </div>
          )}
      </div>

      <div class="stat place-items-center relative">
        <div
          class={`badge badge-lg absolute bottom-0 left-0 ${prioritybg}`}
        ></div>

        <div class="stat-title text-black text-lg font-bold">
          {workOrder.part.number} ({workOrder.quantity} pz)
        </div>

        <div class="stat-value text-3xl">
          {workOrder.workOrder.split("@")[0]}
        </div>

        <div class="stat-desc text-black text-xl font-bold">
          Step {workOrder.step.step}
        </div>

        {workOrder.deliveredBy.name === "MAQUINADOS" &&
          workOrder.operator?.beeperId && (
            <div class="text-center absolute bottom-0 right-0 left-0 font-bold text-blue-500 italic">
              Beeper {workOrder.operator.beeper?.number}
            </div>
          )}

        {workOrder.deliveredBy.name !== "MAQUINADOS" && workOrder.operator && (
          <div class="text-center absolute bottom-0 right-0 left-0 font-bold text-blue-500 italic">
            Entregó: {workOrder.operator.name}
          </div>
        )}
      </div>

      <div class="stat place-items-center relative">
        {onButtonClick && (
          <div class="absolute top-0 right-0 h-14">
            <button onClick={handleClick} class="btn btn-info btn-sm">
              {buttonText}
            </button>
          </div>
        )}

        <div class="stat-title text-black text-lg font-bold">Entregó</div>
        <div class="stat-value text-3xl">{workOrder.deliveredBy.name}</div>

        <div class="stat-desc text-black text-lg font-bold">
          {statusLabel}: {formattedDate}
          {workOrder.status.id === 2 ? (
            <div class="text-black text-lg font-bold absolute bottom-0 text-center">
              Estimado: {workOrder.estimatedTime} minutos
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
