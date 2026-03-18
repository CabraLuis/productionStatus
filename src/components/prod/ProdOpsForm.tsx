import type React from "preact/compat";
import { useEffect, useState } from "preact/hooks";

interface ProdOpsFormProps {
  closeForm?: Function;
  deliveredBy?: string;
}

export default function ProdOpsForm({
  deliveredBy,
  closeForm,
}: ProdOpsFormProps) {
  const initialFields = () => ({
    deliveredTo: "",
    part: "",
    workOrder: "",
    quantity: "",
    step: "",
    deliveredBy: deliveredBy || "",
    rejected: false,
    operatorId: null,
  });

  const [formData, setFormData] = useState(initialFields);
  const [parts, setParts] = useState([]);
  const [steps, setSteps] = useState([]);
  const [areas, setAreas] = useState([]);
  const [operators, setOperators] = useState([]);

  async function getInfo() {
    let response = await fetch("/api/info");
    let data = await response.json();
    setParts(data.info.parts);
    setSteps(data.info.steps);
    setAreas(data.info.areas);
    setOperators(data.info.operators);
  }

  const operatorsInArea = operators.filter(
    (op: any) => op.areaId === Number(formData.deliveredBy),
  );

  useEffect(() => {
    getInfo();
  }, []);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    fetch("/api/production", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workOrder: formData }),
    });
    setFormData(initialFields());
    if (closeForm) closeForm();
  }

  function handleWOChange(e: any) {
    const [wo, step] = e.target.value.split("-");

    setFormData((prev) => ({
      ...prev,
      workOrder: wo ?? "",
      step: step ?? prev.step,
    }));
  }

  return (
    <form onSubmit={submit}>
      <div class="form-control">
        <label class="label">
          <span class="label-text">Departamento de Destino</span>
        </label>
        <select
          autofocus
          class="select select-bordered"
          required
          value={formData.deliveredTo}
          onChange={(e: any) =>
            setFormData({ ...formData, deliveredTo: e.target.value })
          }
        >
          <option value="" disabled>
            Seleccione departamento
          </option>
          <option value="CMM">CMM</option>
          <option value="CLEAN LINE">CLEAN LINE</option>
        </select>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Número de Parte</span>
        </label>
        <input
          autofocus={true}
          type="text"
          placeholder="Ingrese número"
          class="input input-bordered"
          required
          list="parts"
          onChange={(e: any) =>
            setFormData({ ...formData, part: e.target.value })
          }
          value={formData.part}
        />
        <datalist id="parts">
          {parts.map((part: any) => (
            <option value={part.number}></option>
          ))}
        </datalist>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Work Order</span>
        </label>
        <input
          autofocus={true}
          type="text"
          placeholder="Ingrese work order"
          class="input input-bordered"
          required
          onChange={(e: any) => handleWOChange(e)}
          value={formData.workOrder}
        />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Step</span>
        </label>
        <input
          autofocus={true}
          type="number"
          placeholder="Ingrese número de paso"
          class="input input-bordered"
          required
          list="steps"
          onChange={(e: any) =>
            setFormData({ ...formData, step: e.target.value })
          }
          value={formData.step}
        />
        <datalist id="steps">
          {steps.map((step: any) => (
            <option key={step.step} value={step.step}></option>
          ))}
        </datalist>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Cantidad de Piezas</span>
        </label>
        <input
          autofocus={true}
          type="number"
          placeholder="Ingrese cantidad"
          class="input input-bordered"
          required
          onChange={(e: any) =>
            setFormData({ ...formData, quantity: e.target.value })
          }
          value={formData.quantity}
        />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Departamento Que Entrega</span>
        </label>
        <select
          class="select select-bordered"
          required
          onChange={(e: any) =>
            setFormData({
              ...formData,
              deliveredBy: e.target.value,
              operatorId: null,
            })
          }
          value={formData.deliveredBy}
        >
          <option value="" disabled>
            Seleccione departamento
          </option>
          {areas
            .filter(
              (area: any) => area.name !== "CMM" && area.name !== "CLEAN LINE",
            )
            .map((area: any) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
        </select>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Empleado</span>
        </label>
        <select
          required
          autofocus
          class="select select-bordered"
          onChange={(e: any) =>
            setFormData({ ...formData, operatorId: e.target.value })
          }
          value={formData.operatorId || ""}
        >
          <option value="">Seleccione empleado</option>
          {operatorsInArea.map((op: any) => (
            <option key={op.id} value={op.id}>
              {op.name}
              {op.beeperId ? ` - ${op.beeper.number}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div class="form-control mt-6">
        <button class="btn btn-success text-xl">Agregar</button>
      </div>
    </form>
  );
}
