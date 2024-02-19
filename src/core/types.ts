import type EventEmitter from "eventemitter3";
import type { LogMode } from "../logger";
import type { Task } from "../task";

export type FlowContextConfig = {
  eventBus?: EventEmitter;
  entryTask: Task[];
  taskPool: Task[];
  logMode: LogMode;
  schedulerMax?: number;
};

export enum FlowEventName {
  FlowAddTask = "FlowAddTask",
  TaskExecuteSuccess = "TaskExecuteSuccess",
  TaskExecuteFailed = "TaskExecuteFailed",
  TaskExecuteStart = "TaskExecuteStart",
}

export enum SchedulerStatus {
  Init = "Init",
  Running = "Running",
  Paused = "Paused",
  Terminated = "Terminated",
}