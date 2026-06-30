import { useEffect, useRef, useState } from "preact/hooks";
import type React from "preact/compat";
import Card from "./Card";
import type { Prisma } from "@prisma/client";
import type { WorkOrder } from "../custTypes";

type TechnicianWithArea = Prisma.TechnicianGetPayload<{
  include: {
    area: true;
  };
}>;

export default function DispositionModule() {
  const [formData, setFormData] = useState({
    estimatedTime: "",
    technicianId: "",
  });

  const [wo, setWO] = useState<WorkOrder | null>(null);
  const [technicians, setTechnicians] = useState<TechnicianWithArea[]>([]);
  const [standby, setStandby] = useState<WorkOrder[]>([]);
  const [measuring, setMeasuring] = useState<WorkOrder[]>([]);
  const [done, setDone] = useState<WorkOrder[]>([]);

  const [isSubmittingMeasure, setIsSubmittingMeasure] = useState(false);
  const [isSubmittingRelease, setIsSubmittingRelease] = useState(false);

  const formModalRef = useRef<HTMLDialogElement>(null);

  async function getInfo() {
    const response = await fetch("/api/CMM/main");
    const data = await response.json();

    setStandby(data.standby);
    setMeasuring(data.measuring);
    setDone(data.done);
  }

  async function getTechnicians() {
    const res = await fetch("/api/info?deliveredTo=1");
    const data = await res.json();

    setTechnicians(data.info.technicians ?? []);
  }

  useEffect(() => {
    let eventSource: EventSource;
    let retryTimeout: ReturnType<typeof setTimeout>;

    function connect() {
      eventSource = new EventSource("/api/CMM/stream");

      eventSource.onmessage = () => {
        getInfo();
      };

      eventSource.onerror = () => {
        eventSource.close();
        retryTimeout = setTimeout(connect, 5000);
      };
    }

    connect();
    getInfo();
    getTechnicians();

    return () => {
      eventSource?.close();
      clearTimeout(retryTimeout);
    };
  }, []);

  function resetMeasureForm() {
    setFormData({
      estimatedTime: "",
      technicianId: "",
    });
  }

  function showForm(workOrder: WorkOrder) {
    setWO(workOrder);
    resetMeasureForm();
    formModalRef.current?.showModal();
  }

  function closeForm() {
    if (isSubmittingMeasure) return;

    formModalRef.current?.close();
    resetMeasureForm();
    setWO(null);
  }

  async function measure(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!wo || isSubmittingMeasure) return;

    try {
      setIsSubmittingMeasure(true);

      const response = await fetch("/api/Disposition/main", {
        method: "PATCH",
        body: JSON.stringify({
          workOrderId: wo.id,
          statusId: 2,
          rejected: false,
          technicianId: formData.technicianId,
          estimatedTime: formData.estimatedTime,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("No se pudo iniciar la medición");
      }

      await getInfo();
      formModalRef.current?.close();
      resetMeasureForm();
      setWO(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingMeasure(false);
    }
  }

  const dispositionTechnicians = technicians.filter((t) => t.area?.id === 1);

  return (
    <div>
      {/* Modal Medir */}
      <dialog ref={formModalRef} class="modal">
        <div class="modal-box max-w-xl overflow-hidden rounded-2xl border-4 border-base-300 p-0">
          <div class="flex items-start justify-between gap-4 border-b-2 border-base-300 bg-base-200 px-6 py-4">
            <div>
              <h2 class="text-3xl font-black leading-none text-black">
                Iniciar medición
              </h2>

              <p class="mt-2 text-base font-bold text-black/60">
                Captura el técnico y el tiempo estimado.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              class="btn btn-circle btn-sm"
              disabled={isSubmittingMeasure}
            >
              ✕
            </button>
          </div>

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
                {wo?.step ? `Step ${wo.step.step}` : "\u00A0"}
              </div>
            </div>
          </div>

          <form onSubmit={measure} class="px-6 py-5">
            <div class="form-control">
              <label class="label py-1">
                <span class="label-text font-bold">Tiempo estimado</span>
              </label>

              <input
                type="number"
                placeholder="Minutos"
                class="input input-bordered w-full text-lg font-bold"
                required
                min="1"
                disabled={isSubmittingMeasure}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedTime: e.currentTarget.value,
                  })
                }
                value={formData.estimatedTime}
              />
            </div>

            <div class="form-control mt-3">
              <label class="label py-1">
                <span class="label-text font-bold">Técnico</span>
              </label>

              <select
                class="select select-bordered w-full text-lg font-bold"
                required
                disabled={isSubmittingMeasure}
                value={formData.technicianId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    technicianId: e.currentTarget.value,
                  })
                }
              >
                <option value="" disabled>
                  Selecciona técnico
                </option>

                {dispositionTechnicians.map((technician) => (
                  <option value={technician.id} key={technician.id}>
                    {technician.name}
                  </option>
                ))}
              </select>
            </div>

            <div class="mt-6 flex justify-end gap-3 border-t-2 border-base-300 pt-4">
              <button
                type="button"
                onClick={closeForm}
                disabled={isSubmittingMeasure}
                class="btn btn-ghost font-black"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmittingMeasure}
                class="btn btn-success min-w-36 text-xl font-black"
              >
                {isSubmittingMeasure ? "Iniciando..." : "Medir"}
              </button>
            </div>
          </form>
        </div>

        <form method="dialog" class="modal-backdrop">
          <button onClick={() => setWO(null)}>Cerrar</button>
        </form>
      </dialog>

      <div class="grid grid-cols-3">
        <div class="flex flex-col">
          <div class="mb-4 px-5 text-center text-5xl font-bold">Standby</div>

          {standby.map((workOrder: WorkOrder) => (
            <Card key={workOrder.id} workOrder={workOrder} />
          ))}
        </div>

        <div class="flex flex-col">
          <div class="mb-4 px-5 text-center text-5xl font-bold">Midiendo</div>

          {measuring.map((workOrder: WorkOrder) => (
            <Card key={workOrder.id} workOrder={workOrder} />
          ))}
        </div>

        <div class="flex flex-col">
          <div class="mb-4 px-5 text-center text-5xl font-bold">Terminado</div>

          {done.map((workOrder: WorkOrder) => (
            <Card
              key={workOrder.id}
              workOrder={workOrder}
              onButtonClick={showForm}
              buttonText="Disponer"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
