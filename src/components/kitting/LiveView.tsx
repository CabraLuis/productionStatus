import { useEffect, useState } from "preact/hooks";
import Card from "./Card";
import type { WorkOrder } from "../custTypes";

export default function LiveView() {
  const [standby, setStandby] = useState<WorkOrder[]>([]);
  const [measuring, setMeasuring] = useState<WorkOrder[]>([]);
  const [done, setDone] = useState<WorkOrder[]>([]);

  useEffect(() => {
    async function getInfo() {
      const response = await fetch("/api/production?deliveredTo=9");
      const data = await response.json();
      setStandby(data.standby);
      setMeasuring(data.measuring);
      setDone(data.done);
    }

    getInfo();

    const eventSource = new EventSource("/api/Kitting/stream");
    eventSource.onmessage = () => getInfo();
    return () => eventSource.close();
  }, []);

  return (
    <div>
      <div class="grid grid-cols-3">
        <div class="flex flex-col">
          <div class="text-5xl font-bold text-center mb-4 px-5">Standby</div>
          {standby.map((workOrder: WorkOrder) => (
            <Card workOrder={workOrder} />
          ))}
        </div>
        <div class="flex flex-col">
          <div class="text-5xl font-bold text-center mb-4 px-5">Surtiendo</div>
          {measuring.map((workOrder: WorkOrder) => (
            <Card workOrder={workOrder} />
          ))}
        </div>
        <div class="flex flex-col">
          <div class="text-5xl font-bold text-center mb-4 px-5">Terminado</div>
          {done.map((workOrder: WorkOrder) => (
            <Card workOrder={workOrder} />
          ))}
        </div>
      </div>
    </div>
  );
}
