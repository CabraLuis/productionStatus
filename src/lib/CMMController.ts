import events from "events";
type Listener = () => void;

export default class CMMController {
  private static instance: CMMController;
  private constructor() {
    this.emitter.setMaxListeners(30);
  }

  private emitter = new events.EventEmitter();

  static getInstance(): CMMController {
    if (!CMMController.instance) {
      CMMController.instance = new CMMController();
    }
    return CMMController.instance;
  }

  public sub(listener: Listener): any {
    return this.emitter.on("workOrder", listener);
  }

  public unsub(listener: Listener): any {
    return this.emitter.off("workOrder", listener);
  }

  public addOrUpdate(): void {
    this.emitter.emit("workOrder", "UPDATED");
  }
}
