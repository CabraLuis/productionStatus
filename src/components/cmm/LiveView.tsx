import { useEffect, useState } from "preact/hooks";
import Card from "./Card";
import type { WorkOrder } from "../custTypes";

export default function LiveView() {
  const [data, setData] = useState<WorkOrder[]>([]);

  useEffect(() => {
    async function getInfo() {
      let response = await fetch("/api/production?deliveredTo=1");
      let data = await response.json();
      setData(data);
    }
    getInfo();
    const eventSource = new EventSource("/api/CMM/stream");
    eventSource.onmessage = (event) => {
      getInfo();
    };
    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div>
      <div class="grid grid-cols-3">
        <div class="flex flex-col">
          <div class="text-5xl font-bold text-center mb-4 px-5">Standby</div>
          {data.map((workOrder: WorkOrder) =>
            workOrder.statusId === 1 ? (
              <Card workOrder={workOrder}></Card>
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
          <div class="text-5xl font-bold text-center mb-4 px-5">Terminado</div>
          {data.map((workOrder: WorkOrder) =>
            workOrder.statusId === 3 ? (
              <Card workOrder={workOrder}></Card>
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
}
