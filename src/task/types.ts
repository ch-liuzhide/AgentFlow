import type EventEmitter from "eventemitter3";
import { Agent } from "../agent";

export type TaskConfig = {
  uniqueId: string;
  taskName: string;
  taskContent: string;
  maxRepeatCount: number;
  action: TaskAction;
  actionResultFomatter?: (v: any) => void
  nextTaskIds: string[];
  agent: Agent;
  eventBus: EventEmitter;

};

export type TaskAction = (
  actionDescription: string,
  /** should be multiple datasets output results */
  input?: unknown
) => Promise<any>;

/** 任务执行状态 */
export enum TaskRunningState {
  /** 初始状态 */
  init = "init",
  /** 执行等待中 */
  pending = "pending",
  /** 执行中 */
  running = "running",
  /** 执行成功 */
  successed = "successed",
  /** 执行失败 */
  failed = "failed",
}