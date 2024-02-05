import type { LogInfo } from "../logger";
import { LogMode } from "../logger";
import type { Task } from "../task";
import type { FlowContextConfig } from "./types";
import EventEmitter from "eventemitter3";

export class FlowContext {
  eventBus;
  logMode: LogMode;
  entryTask: Task[];
  taskPool: Task[];
  logList: LogInfo[];
  constructor(config: FlowContextConfig) {
    const { entryTask, taskPool, logMode } = config;
    this.logMode = logMode;
    this.entryTask = entryTask;
    this.taskPool = taskPool;
    this.logList = [];
    this.eventBus = new EventEmitter();
  }

  /**
   * add task to flowContext
   */
  public addTask(task: Task) {
    this.taskPool.push(task);
    task.bindContext(this);
  }

  public storeLog = (logInfo: LogInfo) => {
    this.logList.push(logInfo);
  };

  public getTaskById = (taskId: string) => {
    return this.taskPool.find((item) => item.getTaskId() === taskId);
  };

  public start = () => {
    // 1. 所有任务绑定 graph 信息
    this.taskPool.forEach((task) => task.bindContext(this));
    // todo:开始执行全部的 task
    // 根据 taskPool、entryTask 解析调度顺序，让合适的组件先行调度
  };
}
