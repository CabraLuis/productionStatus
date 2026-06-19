import events from "events";
type Listener = () => void;

export default class KittingController {
  private static instance: KittingController;
  private constructor() {
    this.emitter.setMaxListeners(30);
  }

  private emitter = new events.EventEmitter();

  static getInstance(): KittingController {
    if (!KittingController.instance) {
      KittingController.instance = new KittingController();
    }
    return KittingController.instance;
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
