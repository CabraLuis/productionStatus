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
      const diffSeconds = dayjs().diff(startTime, "seconds");
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
    }[workOrder.statusId] || "";

  const statusLabel =
    {
      1: "Recibido",
      2: "Limpiando",
      3: "Finalizado",
    }[workOrder.statusId] || "";

  const formattedDate = dayjs(workOrder.changedAt).format(
    "YYYY-MM-DD HH:mm:ss",
  );

  function handleClick() {
    onButtonClick?.(workOrder);
  }

  const deliveredInfo =
    workOrder.deliveredBy.name === "MAQUINADOS" && workOrder.operator?.beeperId
      ? `Beeper ${workOrder.operator.beeper?.number}`
      : workOrder.deliveredBy.name !== "MAQUINADOS" && workOrder.operator
        ? `Entregó: ${workOrder.operator.name}`
        : null;

  const isFinished = workOrder.statusId === 3;
  const hasFinalDelay =
    isFinished && workOrder.timeDelayed && workOrder.timeDelayed > 0;

  return (
    <article
      class={`mx-4 mb-2 overflow-hidden rounded-xl border-4 ${border} bg-base-100 shadow-md`}
    >
      {/* Franja superior */}
      <div class="grid min-h-10 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b-2 border-base-300 bg-base-200 px-4 py-1">
        <div class="flex items-center gap-2 overflow-hidden">
          <span class={`badge badge-md ${prioritybg}`} />
          <span class="truncate text-lg font-black uppercase text-black">
            {statusLabel}
          </span>
        </div>

        <div class="text-center">
          {workOrder.statusId === 2 && (
            <div class="flex items-baseline justify-center gap-2">
              <span class="text-2xl font-black leading-none tabular-nums text-black">
                {counter}
              </span>

              {isDelayed && (
                <span class="text-xl font-black italic leading-none text-error">
                  RETARDO
                </span>
              )}
            </div>
          )}

          {hasFinalDelay ? (
            <span class="text-xl font-black italic leading-none text-error">
              RETARDO DE {workOrder.timeDelayed} min
            </span>
          ) : null}

          {workOrder.statusId === 1 && (
            <span class="text-lg font-black text-black">En espera</span>
          )}
        </div>

        <div class="flex items-center justify-end gap-2">
          {onButtonClick && (
            <button
              onClick={handleClick}
              class="btn btn-info btn-xs font-black"
            >
              {buttonText}
            </button>
          )}
        </div>
      </div>

      {/* Cuerpo principal */}
      <div class="grid grid-cols-2">
        {/* Izquierda */}
        <section class="min-w-0 border-r-2 border-base-300 px-4 py-2 text-center">
          <div class="truncate text-xl font-black leading-tight text-black">
            {workOrder.part.number}
            <span class="ml-2 text-base font-black text-black/70">
              ({workOrder.quantity} pz)
            </span>
          </div>

          <div class="mt-1 truncate text-[2.15rem] font-black leading-none tracking-tight text-black">
            {workOrder.workOrder.split("@")[0]}
          </div>

          <div class="mt-2 text-xl font-black leading-none text-black">
            Step {workOrder.step.step}
          </div>

          {deliveredInfo ? (
            <div class="mt-1 truncate text-lg font-black italic leading-tight text-info">
              {deliveredInfo}
            </div>
          ) : (
            "\u00A0"
          )}
        </section>

        {/* Derecha */}
        <section class="min-w-0 px-4 py-2 text-center">
          <div class="text-base font-black uppercase leading-tight text-black/70">
            Entregó
          </div>

          <div class="mt-1 truncate text-[2.15rem] font-black leading-none tracking-tight text-black">
            {workOrder.deliveredBy.name}
          </div>

          <div class="mt-2 truncate text-base font-black leading-tight text-black">
            {formattedDate}
          </div>

          {workOrder.statusId === 2 && (
            <div class="mt-1 text-lg font-black leading-tight text-black">
              Est. {workOrder.estimatedTime} min
            </div>
          )}
        </section>
      </div>
    </article>
  );
}
