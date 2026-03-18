import events from "events";
type Listener = () => void;

export default class CleanLineController {
  private static instance: CleanLineController;
  private constructor() {
    this.emitter.setMaxListeners(30);
  }

  private emitter = new events.EventEmitter();

  static getInstance(): CleanLineController {
    if (!CleanLineController.instance) {
      CleanLineController.instance = new CleanLineController();
    }
    return CleanLineController.instance;
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
