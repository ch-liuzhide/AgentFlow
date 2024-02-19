import type { LogInfo } from "../logger";
import { LogMode } from "../logger";
import type { Task } from "../task";
import { Scheduler } from "./scheduler";
import { FlowEventName, type FlowContextConfig } from "./types";
import EventEmitter from "eventemitter3";

export class FlowContext {
  eventBus;
  logMode: LogMode;
  entryTask: Task[];
  taskPool: Task[];
  logList: LogInfo[];
  schedulerMax: number;
  scheduler?: Scheduler;
  constructor(config: FlowContextConfig) {
    const { entryTask, taskPool, logMode, eventBus, schedulerMax } = config;
    this.logMode = logMode;
    this.entryTask = entryTask;
    this.taskPool = taskPool;
    this.logList = [];
    this.eventBus = eventBus ?? new EventEmitter();
    this.schedulerMax = schedulerMax ?? 4;
  }

  /**
   * add task to flowContext,then emit event
   */
  public addTask(task: Task) {
    task.bindContext(this);
    this.taskPool.push(task);
    this.eventBus.emit(FlowEventName.FlowAddTask, task);
  }

  public storeLog = (logInfo: LogInfo) => {
    this.logList.push(logInfo);
  };

  public getTaskById = (taskId: string) => {
    return this.taskPool.find((item) => item.getTaskId() === taskId);
  };

  public start = async () => {
    this.taskPool.forEach((task) => task.bindContext(this));
    this.scheduler = new Scheduler(
      this.eventBus,
      this.entryTask,
      this.taskPool,
      this.schedulerMax,
      // if timeout exceed 60 min,the flow will
      60
    );
    await this.scheduler.start();
  };

  public reset = () => {};

  public restart = () => {};

  public pause = () => {};
}
