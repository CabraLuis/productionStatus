import { useEffect, useRef, useState } from "preact/hooks";
import Card from "./Card";
import type { WorkOrder } from "../custTypes";
import type { Prisma } from "@prisma/client";

type TechnicianWithArea = Prisma.TechnicianGetPayload<{
  include: {
    area: true;
  };
}>;

export default function CleanLineModule() {
  const [data, setData] = useState<WorkOrder[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianWithArea[]>([]);
  const [formData, setFormData] = useState({
    estimatedTime: "",
    technicianId: "",
  });
  const [wo, setWO] = useState<WorkOrder | null>(null);
  const formModalRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    async function getInfo() {
      let response = await fetch("/api/CleanLine/main");
      let data = await response.json();
      setData(data);
    }

    async function getTechnicians() {
      const res = await fetch("/api/info?deliveredTo=2");
      const data = await res.json();
      setTechnicians(data.info.technicians);
    }
    let eventSource: EventSource;
    let retryTimeout: ReturnType<typeof setTimeout>;

    function connect() {
      eventSource = new EventSource("/api/CleanLine/stream");

      eventSource.onmessage = () => {
        getInfo();
      };

      eventSource.onerror = () => {
        eventSource.close();
        // reintenta cada 5 segundos
        retryTimeout = setTimeout(connect, 5000);
      };
    }

    connect();
    getInfo();
    getTechnicians();

    return () => {
      eventSource.close();
      clearTimeout(retryTimeout);
    };
  }, []);

  async function measure(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    fetch("/api/CleanLine/main", {
      method: "PATCH",
      body: JSON.stringify({
        workOrderId: wo?.id,
        statusId: 2,
        technicianId: formData.technicianId,
        estimatedTime: formData.estimatedTime,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    formData.technicianId = "";
    formData.estimatedTime = "";
    closeForm();
  }

  async function finalize(workOrder: WorkOrder) {
    await fetch("/api/CleanLine/main", {
      method: "PATCH",
      body: JSON.stringify({
        workOrderId: workOrder.id,
        statusId: 3,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  function showForm(workOrder: WorkOrder) {
    setTimeout(() => {
      setWO(workOrder);
      formModalRef.current?.showModal();
    }, 0);
  }

  function closeForm() {
    setTimeout(() => {
      formModalRef.current?.close();
    }, 0);
  }

  return (
    <div>
      <div>
        <dialog ref={formModalRef} id="modal2" class="modal">
          <div className="modal-box">
            <button
              onClick={closeForm}
              class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </button>
            <form onSubmit={measure}>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Tiempo Estimado (minutos)</span>
                </label>
                <input
                  type="number"
                  placeholder="Ingrese tiempo estimado de medición"
                  class="input input-bordered"
                  required
                  onChange={(e: any) =>
                    setFormData({ ...formData, estimatedTime: e.target.value })
                  }
                  value={formData.estimatedTime}
                />
              </div>

              <label class="form-control w-full">
                <div class="label">
                  <span class="label-text">Técnico</span>
                </div>
                <select
                  class="select select-bordered"
                  onChange={(e: any) =>
                    setFormData({ ...formData, technicianId: e.target.value })
                  }
                >
                  <option value="" disabled selected>
                    Selecciona
                  </option>

                  {technicians
                    .filter((t) => t.area?.id === 2)
                    .map((technician) => (
                      <option value={technician.id} key={technician.id}>
                        {technician.name}
                      </option>
                    ))}
                </select>
              </label>

              <div class="form-control mt-6">
                <button class="btn btn-success text-xl">Limpiar</button>
              </div>
            </form>
          </div>
        </dialog>

        <div class="grid grid-cols-3 ">
          <div class="flex flex-col">
            <div class="text-5xl font-bold text-center mb-4 px-5">Standby</div>
            {data.map((workOrder: WorkOrder) =>
              workOrder.statusId === 1 ? (
                <Card
                  workOrder={workOrder}
                  onButtonClick={showForm}
                  buttonText="Limpiar >"
                ></Card>
              ) : null,
            )}
          </div>

          <div class="flex flex-col ">
            <div class="text-5xl font-bold text-center mb-4 px-5">
              Limpiando
            </div>
            {data.map((workOrder: WorkOrder) =>
              workOrder.statusId === 2 ? (
                <Card
                  workOrder={workOrder}
                  onButtonClick={finalize}
                  buttonText="Liberar >"
                ></Card>
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
