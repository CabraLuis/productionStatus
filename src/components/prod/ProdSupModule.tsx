import { useEffect, useRef, useState } from "preact/hooks";
import Card from "./Card";
import type { WorkOrder } from "../custTypes";

interface ProdSupModuleProps {
  deliveredToId: number;
}

export default function ProdSupModule({ deliveredToId }: ProdSupModuleProps) {
  const [wo, setWO] = useState<WorkOrder | null>(null);
  const [standby, setStandby] = useState<WorkOrder[]>([]);
  const [measuring, setMeasuring] = useState<WorkOrder[]>([]);
  const [done, setDone] = useState<WorkOrder[]>([]);
  const [isChangingPriority, setIsChangingPriority] = useState(false);

  const priorityModalRef = useRef<HTMLDialogElement>(null);

  async function getInfo() {
    const response = await fetch(
      `/api/production?deliveredTo=${deliveredToId}`,
    );
    const data = await response.json();

    setStandby(data.standby);
    setMeasuring(data.measuring);
    setDone(data.done);
  }

  useEffect(() => {
    getInfo();

    const eventSource =
      deliveredToId === 1
        ? new EventSource("/api/CMM/stream")
        : new EventSource("/api/CleanLine/stream");

    eventSource.onmessage = () => {
      getInfo();
    };

    return () => eventSource.close();
  }, [deliveredToId]);

  function showPriorityModal(workOrder: WorkOrder) {
    setWO(workOrder);

    if (!priorityModalRef.current?.open) {
      priorityModalRef.current?.showModal();
    }
  }

  function closePriorityModal() {
    priorityModalRef.current?.close();
    setWO(null);
  }

  async function changePriority(priority: number) {
    if (!wo || isChangingPriority) return;

    try {
      setIsChangingPriority(true);

      const response = await fetch("/api/production", {
        method: "PATCH",
        body: JSON.stringify({
          workOrder: wo.id,
          priority,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("No se pudo cambiar la prioridad");
      }

      await getInfo();
      closePriorityModal();
    } catch (error) {
      console.error(error);
    } finally {
      setIsChangingPriority(false);
    }
  }

  return (
    <div>
      <dialog ref={priorityModalRef} class="modal">
        <div class="modal-box max-w-2xl overflow-hidden rounded-2xl border-4 border-base-300 p-0">
          {/* Header */}
          <div class="flex items-start justify-between gap-4 border-b-2 border-base-300 bg-base-200 px-6 py-4">
            <div class="min-w-0">
              <h2 class="text-3xl font-black leading-none text-black">
                Cambiar prioridad
              </h2>

              <p class="mt-2 text-base font-bold text-black/70">
                Selecciona la nueva prioridad para esta work order.
              </p>
            </div>

            <button
              type="button"
              onClick={closePriorityModal}
              class="btn btn-circle btn-sm"
              disabled={isChangingPriority}
            >
              ✕
            </button>
          </div>

          {/* Work order seleccionada */}
          <div class="grid grid-cols-2 gap-3 border-b-2 border-base-300 px-6 py-4">
            <div class="rounded-xl bg-base-200 px-4 py-3 text-center">
              <div class="text-sm font-black uppercase text-black/60">
                Work Order
              </div>

              <div class="truncate text-3xl font-black leading-none text-black">
                {wo ? wo.workOrder.split("@")[0] : "—"}
              </div>
            </div>

            <div class="rounded-xl bg-base-200 px-4 py-3 text-center">
              <div class="text-sm font-black uppercase text-black/60">
                Parte
              </div>

              <div class="truncate text-2xl font-black leading-none text-black">
                {wo ? wo.part.number : "—"}
              </div>

              <div class="mt-1 text-base font-bold text-black/70">
                {wo ? `${wo.quantity} pz` : "\u00A0"}
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div class="grid grid-cols-3 gap-4 px-6 py-5">
            <button
              type="button"
              onClick={() => changePriority(3)}
              disabled={isChangingPriority}
              class="btn btn-success h-24 flex-col text-xl font-black"
            >
              Baja
              <span class="text-sm font-bold normal-case opacity-80">
                Prioridad 3
              </span>
            </button>

            <button
              type="button"
              onClick={() => changePriority(2)}
              disabled={isChangingPriority}
              class="btn btn-warning h-24 flex-col text-xl font-black"
            >
              Media
              <span class="text-sm font-bold normal-case opacity-80">
                Prioridad 2
              </span>
            </button>

            <button
              type="button"
              onClick={() => changePriority(1)}
              disabled={isChangingPriority}
              class="btn btn-error h-24 flex-col text-xl font-black"
            >
              Alta
              <span class="text-sm font-bold normal-case opacity-80">
                Prioridad 1
              </span>
            </button>
          </div>

          {/* Footer */}
          <div class="flex items-center justify-between border-t-2 border-base-300 bg-base-200 px-6 py-3">
            <div class="text-sm font-bold text-black/60">
              {isChangingPriority ? "Guardando cambio..." : "\u00A0"}
            </div>

            <button
              type="button"
              onClick={closePriorityModal}
              disabled={isChangingPriority}
              class="btn btn-ghost btn-sm font-black"
            >
              Cancelar
            </button>
          </div>
        </div>

        <form method="dialog" class="modal-backdrop">
          <button onClick={() => setWO(null)}>Cerrar</button>
        </form>
      </dialog>

      <div class="grid grid-cols-3">
        <div class="flex flex-col">
          <div class="mb-4 px-5 text-center text-5xl font-bold">Standby</div>

          {standby.map((workOrder: WorkOrder) => (
            <Card
              key={workOrder.id}
              workOrder={workOrder}
              onButtonClick={showPriorityModal}
              buttonText="Prioridad"
            />
          ))}
        </div>

        <div class="flex flex-col">
          <div class="mb-4 px-5 text-center text-5xl font-bold">
            {deliveredToId === 1 ? "Midiendo" : "Limpiando"}
          </div>

          {measuring.map((workOrder: WorkOrder) => (
            <Card key={workOrder.id} workOrder={workOrder} />
          ))}
        </div>

        <div class="flex flex-col">
          <div class="mb-4 px-5 text-center text-5xl font-bold">Terminado</div>

          {done.map((workOrder: WorkOrder) => (
            <Card key={workOrder.id} workOrder={workOrder} />
          ))}
        </div>
      </div>
    </div>
  );
}
