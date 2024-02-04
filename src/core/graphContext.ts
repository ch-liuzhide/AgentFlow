import type { LogInfo } from "../logger";
import { LogMode } from "../logger";
import type { Task } from "../task";
import type { GraphContextConfig } from "./types";
import EventEmitter from "eventemitter3";

export class GraphContext {
  eventBus: EventEmitter<string | symbol, any>;
  logMode: LogMode;
  entryTask: Task[];
  taskPool: Task[];
  logList: LogInfo[];
  constructor(config: GraphContextConfig) {
    const { entryTask, taskPool, logMode } = config;
    this.logMode = logMode;
    this.entryTask = entryTask;
    this.taskPool = taskPool;
    this.logList = [];
    this.eventBus = new EventEmitter()
  }

  public addTask(task: Task) {
    this.taskPool.push(task);
    task.bindContext(this);
  }

  public storeLog = (logInfo: LogInfo) => {
    this.logList.push(logInfo);
  };


  public start = () => {
    // 1. 所有任务绑定 graph 信息
    this.taskPool.forEach((task) => task.bindContext(this));
    // todo:开始执行全部的 task 
    // 根据 taskPool、entryTask 解析调度顺序，让合适的组件先行调度
  };

}
