import type React from "preact/compat";
import { useEffect, useMemo, useState } from "preact/hooks";

interface ProdOpsModuleProps {
  deliveredBy?: string;
  deliverTo?: string;
}

export default function ProdOpsModule({
  deliveredBy,
  deliverTo,
}: ProdOpsModuleProps) {
  const initialFields = () => ({
    deliveredTo: deliverTo || "",
    part: "",
    workOrder: "",
    quantity: "",
    step: "",
    deliveredBy: deliveredBy || "",
    rejected: false,
    operatorId: "",
  });

  const [formData, setFormData] = useState(initialFields);
  const [parts, setParts] = useState<any[]>([]);
  const [steps, setSteps] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function getInfo() {
    try {
      const response = await fetch("/api/info");

      if (!response.ok) {
        throw new Error("No se pudo cargar la información");
      }

      const data = await response.json();

      setParts(data.info.parts ?? []);
      setSteps(data.info.steps ?? []);
      setAreas(data.info.areas ?? []);
      setOperators(data.info.operators ?? []);
    } catch (error) {
      console.error(error);
      setErrorMessage("No se pudo cargar la información inicial.");
    }
  }

  useEffect(() => {
    getInfo();
  }, []);

  const availableAreas = useMemo(() => {
    return areas.filter((area: any) => {
      if (formData.deliveredTo === "2") {
        return area.name === "KITTING" || area.name === "DETAIL";
      }

      return area.name !== "CMM" && area.name !== "CLEAN LINE";
    });
  }, [areas, formData.deliveredTo]);

  const operatorsInArea = useMemo(() => {
    return operators.filter(
      (op: any) => op.areaId === Number(formData.deliveredBy),
    );
  }, [operators, formData.deliveredBy]);

  function handleWOChange(e: React.TargetedEvent<HTMLInputElement, Event>) {
    const [wo, step] = e.currentTarget.value.split("-");

    setFormData((prev) => ({
      ...prev,
      workOrder: wo ?? "",
      step: step ?? prev.step,
    }));
  }

  async function submit(e: React.TargetedEvent<HTMLFormElement, Event>) {
    e.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const response = await fetch("/api/production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workOrder: {
            ...formData,
            operatorId: formData.operatorId || null,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo agregar la work order");
      }

      setFormData(initialFields());
    } catch (error) {
      console.error(error);
      setErrorMessage("No se pudo agregar la work order.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function cancelForm() {
    if (isSubmitting) return;

    setFormData(initialFields());
    setErrorMessage("");
  }
  return (
    <div>
      <div class="hero bg-base-200 min-h-screen">
        <div class="hero-content flex-col lg:flex-row-reverse">
          <div class="text-center lg:text-left">
            <h1 class="text-5xl font-bold">Ingresa Work Order</h1>
            <p class="py-6">Ingresa una work order para ser monitoreada</p>
          </div>
          <div class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
            <div className="card-body">
              <form onSubmit={submit} class="space-y-3">
                {errorMessage && (
                  <div class="alert alert-error py-2 text-sm font-bold">
                    {errorMessage}
                  </div>
                )}

                <div class="form-control">
                  <label class="label py-1">
                    <span class="label-text font-bold">
                      Departamento de Destino
                    </span>
                  </label>

                  <select
                    autofocus
                    class="select select-bordered w-full font-bold"
                    required
                    disabled={isSubmitting}
                    value={formData.deliveredTo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deliveredTo: e.currentTarget.value,
                        deliveredBy: "",
                        operatorId: "",
                      })
                    }
                  >
                    <option value="" disabled>
                      Seleccione departamento
                    </option>
                    <option value="1">CMM</option>
                    <option value="2">CLEAN LINE</option>
                  </select>
                </div>

                <div class="form-control">
                  <label class="label py-1">
                    <span class="label-text font-bold">Número de Parte</span>
                  </label>

                  <input
                    type="text"
                    placeholder="Ingrese número"
                    class="input input-bordered w-full font-bold"
                    required
                    list="parts"
                    disabled={isSubmitting}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        part: e.currentTarget.value.toUpperCase(),
                      })
                    }
                    value={formData.part}
                  />

                  <datalist id="parts">
                    {parts.map((part: any) => (
                      <option key={part.number} value={part.number} />
                    ))}
                  </datalist>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div class="form-control">
                    <label class="label py-1">
                      <span class="label-text font-bold">Work Order</span>
                    </label>

                    <input
                      type="text"
                      placeholder="Ingrese WO"
                      class="input input-bordered w-full font-bold"
                      required
                      disabled={isSubmitting}
                      onChange={handleWOChange}
                      value={formData.workOrder}
                    />
                  </div>

                  <div class="form-control">
                    <label class="label py-1">
                      <span class="label-text font-bold">Step</span>
                    </label>

                    <input
                      type="number"
                      placeholder="Step"
                      class="input input-bordered w-full font-bold"
                      required
                      min="1"
                      list="steps"
                      disabled={isSubmitting}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          step: e.currentTarget.value,
                        })
                      }
                      value={formData.step}
                    />

                    <datalist id="steps">
                      {steps.map((step: any) => (
                        <option key={step.step} value={step.step} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div class="form-control">
                  <label class="label py-1">
                    <span class="label-text font-bold">Operación</span>
                  </label>

                  <input
                    type="text"
                    placeholder="Ingrese operación"
                    class="input input-bordered w-full font-bold"
                    required
                    list="operations"
                    disabled={isSubmitting}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        operation: e.currentTarget.value.toUpperCase(),
                      })
                    }
                    value={formData.operation}
                  />

                  <datalist id="operations">
                    {operations.map((operation: any) => (
                      <option key={operation.id} value={operation.id} />
                    ))}
                  </datalist>
                </div>

                <div class="form-control">
                  <label class="label py-1">
                    <span class="label-text font-bold">Cantidad de Piezas</span>
                  </label>

                  <input
                    type="number"
                    placeholder="Ingrese cantidad"
                    class="input input-bordered w-full font-bold"
                    required
                    min="1"
                    disabled={isSubmitting}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: e.currentTarget.value,
                      })
                    }
                    value={formData.quantity}
                  />
                </div>

                <div class="form-control">
                  <label class="label py-1">
                    <span class="label-text font-bold">
                      Departamento Que Entrega
                    </span>
                  </label>

                  <select
                    class="select select-bordered w-full font-bold"
                    required
                    disabled={isSubmitting || !formData.deliveredTo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deliveredBy: e.currentTarget.value,
                        operatorId: "",
                      })
                    }
                    value={formData.deliveredBy}
                  >
                    <option value="" disabled>
                      Seleccione departamento
                    </option>

                    {availableAreas.map((area: any) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div class="form-control">
                  <label class="label py-1">
                    <span class="label-text font-bold">Empleado</span>
                  </label>

                  <select
                    class="select select-bordered w-full font-bold"
                    disabled={isSubmitting || !formData.deliveredBy}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        operatorId: e.currentTarget.value,
                      })
                    }
                    value={formData.operatorId}
                  >
                    <option value="">No Asignado</option>

                    {operatorsInArea.map((op: any) => (
                      <option key={op.id} value={op.id}>
                        {op.name}
                        {op.beeperId ? ` - ${op.beeper.number}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div class="mt-6 flex justify-end gap-3 border-t border-base-300 pt-4">
                  <button
                    type="button"
                    class="btn btn-ghost font-bold"
                    disabled={isSubmitting}
                    onClick={cancelForm}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    class="btn btn-success min-w-36 text-lg font-black"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Agregando..." : "Agregar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
