import { useEffect, useRef, useState } from "preact/hooks";
import type React from "preact/compat";
import Card from "./Card";
import type { WorkOrder } from "../custTypes";
import type { Prisma } from "@prisma/client";

type TechnicianWithArea = Prisma.TechnicianGetPayload<{
  include: {
    area: true;
  };
}>;

export default function CleanLineModule() {
  const [technicians, setTechnicians] = useState<TechnicianWithArea[]>([]);

  const [formData, setFormData] = useState({
    estimatedTime: "",
    technicianId: "",
  });

  const [wo, setWO] = useState<WorkOrder | null>(null);
  const [standby, setStandby] = useState<WorkOrder[]>([]);
  const [measuring, setMeasuring] = useState<WorkOrder[]>([]);
  const [done, setDone] = useState<WorkOrder[]>([]);

  const [isSubmittingClean, setIsSubmittingClean] = useState(false);
  const [isSubmittingRelease, setIsSubmittingRelease] = useState(false);

  const formModalRef = useRef<HTMLDialogElement>(null);
  const releaseModalRef = useRef<HTMLDialogElement>(null);

  async function getInfo() {
    const response = await fetch("/api/CleanLine/main");
    const data = await response.json();

    setStandby(data.standby);
    setMeasuring(data.measuring);
    setDone(data.done);
  }

  async function getTechnicians() {
    const res = await fetch("/api/info?deliveredTo=2");
    const data = await res.json();

    setTechnicians(data.info.technicians ?? []);
  }

  useEffect(() => {
    let eventSource: EventSource;
    let retryTimeout: ReturnType<typeof setTimeout>;

    function connect() {
      eventSource = new EventSource("/api/CleanLine/stream");

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

  function resetCleanForm() {
    setFormData({
      estimatedTime: "",
      technicianId: "",
    });
  }

  function showForm(workOrder: WorkOrder) {
    setWO(workOrder);
    resetCleanForm();
    formModalRef.current?.showModal();
  }

  function closeForm() {
    if (isSubmittingClean) return;

    formModalRef.current?.close();
    resetCleanForm();
    setWO(null);
  }

  function showRelease(workOrder: WorkOrder) {
    setWO(workOrder);
    releaseModalRef.current?.showModal();
  }

  function closeRelease() {
    if (isSubmittingRelease) return;

    releaseModalRef.current?.close();
    setWO(null);
  }

  async function clean(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!wo || isSubmittingClean) return;

    try {
      setIsSubmittingClean(true);

      const response = await fetch("/api/CleanLine/main", {
        method: "PATCH",
        body: JSON.stringify({
          workOrderId: wo.id,
          statusId: 2,
          technicianId: formData.technicianId,
          estimatedTime: formData.estimatedTime,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("No se pudo iniciar la limpieza");
      }

      await getInfo();
      formModalRef.current?.close();
      resetCleanForm();
      setWO(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingClean(false);
    }
  }

  async function finalize() {
    if (!wo || isSubmittingRelease) return;

    try {
      setIsSubmittingRelease(true);

      const response = await fetch("/api/CleanLine/main", {
        method: "PATCH",
        body: JSON.stringify({
          workOrderId: wo.id,
          statusId: 3,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("No se pudo liberar la pieza");
      }

      await getInfo();
      releaseModalRef.current?.close();
      setWO(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingRelease(false);
    }
  }

  const cleanLineTechnicians = technicians.filter((t) => t.area?.id === 2);

  return (
    <div>
      {/* Modal iniciar limpieza */}
      <dialog ref={formModalRef} class="modal">
        <div class="modal-box max-w-xl overflow-hidden rounded-2xl border-4 border-base-300 p-0">
          <div class="flex items-start justify-between gap-4 border-b-2 border-base-300 bg-base-200 px-6 py-4">
            <div>
              <h2 class="text-3xl font-black leading-none text-black">
                Iniciar limpieza
              </h2>

              <p class="mt-2 text-base font-bold text-black/60">
                Captura el técnico y el tiempo estimado.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              class="btn btn-circle btn-sm"
              disabled={isSubmittingClean}
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
                {wo ? `Step ${wo.step.step}` : "\u00A0"}
              </div>
            </div>
          </div>

          <form onSubmit={clean} class="px-6 py-5">
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
                disabled={isSubmittingClean}
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
                disabled={isSubmittingClean}
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

                {cleanLineTechnicians.map((technician) => (
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
                disabled={isSubmittingClean}
                class="btn btn-ghost font-black"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmittingClean}
                class="btn btn-success min-w-36 text-xl font-black"
              >
                {isSubmittingClean ? "Iniciando..." : "Limpiar"}
              </button>
            </div>
          </form>
        </div>

        <form method="dialog" class="modal-backdrop">
          <button onClick={() => setWO(null)}>Cerrar</button>
        </form>
      </dialog>

      {/* Modal liberar pieza */}
      <dialog ref={releaseModalRef} class="modal">
        <div class="modal-box max-w-xl overflow-hidden rounded-2xl border-4 border-base-300 p-0">
          <div class="flex items-start justify-between gap-4 border-b-2 border-base-300 bg-base-200 px-6 py-4">
            <div>
              <h2 class="text-3xl font-black leading-none text-black">
                Liberar pieza
              </h2>

              <p class="mt-2 text-base font-bold text-black/60">
                Confirma que la limpieza fue terminada.
              </p>
            </div>

            <button
              type="button"
              onClick={closeRelease}
              class="btn btn-circle btn-sm"
              disabled={isSubmittingRelease}
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
                {wo ? `${wo.quantity} pz` : "\u00A0"}
              </div>
            </div>
          </div>

          <div class="px-6 py-5">
            <button
              type="button"
              onClick={finalize}
              disabled={isSubmittingRelease}
              class="btn btn-success h-20 w-full text-2xl font-black"
            >
              {isSubmittingRelease ? "Liberando..." : "Liberar"}
            </button>
          </div>

          <div class="flex items-center justify-between border-t-2 border-base-300 bg-base-200 px-6 py-3">
            <div class="text-sm font-bold text-black/60">
              {isSubmittingRelease ? "Actualizando estado..." : "\u00A0"}
            </div>

            <button
              type="button"
              onClick={closeRelease}
              disabled={isSubmittingRelease}
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
              onButtonClick={showForm}
              buttonText="Limpiar >"
            />
          ))}
        </div>

        <div class="flex flex-col">
          <div class="mb-4 px-5 text-center text-5xl font-bold">Limpiando</div>

          {measuring.map((workOrder: WorkOrder) => (
            <Card
              key={workOrder.id}
              workOrder={workOrder}
              onButtonClick={showRelease}
              buttonText="Liberar >"
            />
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
