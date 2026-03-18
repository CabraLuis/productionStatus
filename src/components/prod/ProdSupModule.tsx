import { useEffect, useRef, useState } from "preact/hooks";
import Card from "./Card";
import type { WorkOrder } from "../custTypes";

interface ProdSupModuleProps {
  deliveredToId: number;
}

export default function ProdSupModule({ deliveredToId }: ProdSupModuleProps) {
  const [data, setData] = useState<WorkOrder[]>([]);
  const [wo, setWO] = useState<WorkOrder | null>(null);
  const rejectModalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    async function getInfo() {
      let response = await fetch(
        `/api/production?deliveredTo=${deliveredToId}`,
      );
      let data = await response.json();
      setData(data);
    }
    getInfo();
    const eventSource = new EventSource("/api/CleanLine/stream");
    eventSource.onmessage = (event) => {
      getInfo();
    };
    return () => eventSource.close();
  }, []);

  async function changePriority(priority: number) {
    if (wo) {
      await fetch("/api/production", {
        method: "PATCH",
        body: JSON.stringify({
          workOrder: wo.id,
          priority: priority,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  }

  function showPriorityForm(workOrder: WorkOrder) {
    setTimeout(() => {
      setWO(workOrder);
      rejectModalRef.current?.showModal();
    }, 0);
  }

  function closePriority() {
    setTimeout(() => {
      rejectModalRef.current?.close();
    }, 0);
  }

  async function low() {
    await changePriority(3);
    closePriority();
  }

  async function medium() {
    await changePriority(2);
    closePriority();
  }

  async function high() {
    await changePriority(1);
    closePriority();
  }

  return (
    <div>
      <div>
        <dialog ref={rejectModalRef} id="modal" class="modal">
          <div className="modal-box overflow-hidden">
            <h2 class="card-title">Cambiar Prioridad</h2>
            <p>Indica que prioridad debe tener esta work order.</p>
            <div class="card-actions justify-center">
              <button onClick={low} class="btn btn-success">
                Prioridad Baja
              </button>
              <button onClick={medium} class="btn btn-warning">
                Prioridad Media
              </button>
              <button onClick={high} class="btn btn-error">
                Prioridad Alta
              </button>
            </div>
          </div>
        </dialog>
        <div class="grid grid-cols-3 ">
          <div class="flex flex-col">
            <div class="text-5xl font-bold text-center mb-4 px-5">Standby</div>
            {data.map((workOrder: WorkOrder) =>
              workOrder.statusId === 1 ? (
                <Card
                  workOrder={workOrder}
                  onButtonClick={showPriorityForm}
                  buttonText="Prioridad"
                ></Card>
              ) : null,
            )}
          </div>
          <div class="flex flex-col">
            <div class="text-5xl font-bold text-center mb-4 px-5">Midiendo</div>
            {data.map((workOrder: WorkOrder) =>
              workOrder.statusId === 2 ? (
                <Card workOrder={workOrder}></Card>
              ) : null,
            )}
          </div>
          <div class="flex flex-col">
            <div class="text-5xl font-bold text-center mb-4 px-5">
              Terminado
            </div>
            {data.map((workOrder: WorkOrder) =>
              workOrder.statusId === 3 ? (
                <Card workOrder={workOrder}></Card>
              ) : null,
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
