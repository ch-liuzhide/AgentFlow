import type EventEmitter from "eventemitter3";
import type { Agent } from "../agent";
import type { FlowContext } from "../core/flowContext";
import { Logger } from "../logger/logger";
import {
  TaskAction,
  TaskConfig,
  TaskPayload,
  TaskExecuteStatus,
} from "./types";

import { v4 } from "uuid";
import { FlowEventName } from "../core";

export class Task {
  private actionResultFormatter?: (v: unknown) => void;
  private actionInputFormatter?: (
    v: unknown | TaskPayload<unknown>[]
  ) => TaskPayload<unknown>;
  private taskId: string;
  private maxRepeatCount: number;
  private taskName: string;
  private taskContent: string;
  private action: TaskAction;
  private logger?: Logger;
  private agent?: Agent;
  protected executeCount: number = 0;
  protected flowContext?: FlowContext;
  private eventBus?: EventEmitter;
  protected actionResult: unknown;
  protected taskRunningState: TaskExecuteStatus = TaskExecuteStatus.INIT;
  protected prevTaskIds: Set<string>;
  protected nextTaskIds: Set<string>;

  constructor(config: TaskConfig) {
    const {
      maxRepeatCount,
      taskName,
      taskContent,
      action,
      agent,
      actionResultFormatter,
      actionInputFormatter,
    } = config;
    this.taskId = v4();
    this.maxRepeatCount = maxRepeatCount;
    this.taskName = taskName;
    this.taskContent = taskContent;
    this.action = action;
    this.agent = agent;
    this.actionResultFormatter = actionResultFormatter;
    this.actionInputFormatter = actionInputFormatter;
    this.prevTaskIds = new Set();
    this.nextTaskIds = new Set();
  }
  private handleTaskFailed = () => {
    this.taskRunningState = TaskExecuteStatus.FAILED;
    this.eventBus?.emit(FlowEventName.TaskExecuteFailed, this);
  };

  private handleTaskSuccess = () => {
    this.taskRunningState = TaskExecuteStatus.SUCCEED;
    this.eventBus?.emit(FlowEventName.TaskExecuteSuccess, this);
  };

  /** bind graph context  */
  public bindContext = (flowContext: FlowContext) => {
    this.flowContext = flowContext;
    this.eventBus = flowContext.eventBus;
    this.logger = new Logger({
      belongId: this.taskId,
      graphContext: flowContext,
    });
  };

  public addPrevTasks = (tasks: Task[], isSync: boolean = true) => {
    for (const task of tasks) {
      const taskId = task.getTaskId();
      this.prevTaskIds.add(taskId);
      this.removeTaskIdFromNext(taskId);
      if (isSync) {
        task.addNextTasks([this], false);
      }
    }
  };

  public addNextTasks = (tasks: Task[], isSync: boolean = true) => {
    for (const task of tasks) {
      const taskId = task.getTaskId();
      this.nextTaskIds.add(taskId);
      this.removeTaskIdFromPrev(taskId);
      if (isSync) {
        task.addPrevTasks([this], false);
      }
    }
  };

  public removeTaskIdFromNext = (taskId: string) => {
    this.nextTaskIds.has(taskId) && this.nextTaskIds.delete(taskId);
  };

  public removeTaskIdFromPrev = (taskId: string) => {
    this.prevTaskIds.has(taskId) && this.prevTaskIds.delete(taskId);
  };

  public getTaskId() {
    return this.taskId;
  }

  public getTaskState() {
    return this.taskRunningState;
  }

  public getMaxRepeatCount = () => {
    return this.maxRepeatCount;
  };
  public getTaskName = () => {
    return this.taskName;
  };
  public getRunCount = () => {
    return this.executeCount;
  };

  public getNextTaskIds = () => {
    return Array.from(this.nextTaskIds);
  };

  public getPrevTaskIds() {
    return Array.from(this.prevTaskIds);
  }

  public getActionResult = () => {
    return this.actionResult;
  };

  /**
   * run action
   * @param input
   * @returns
   */
  public runAction = async (input?: TaskPayload<unknown>[]) => {
    this.taskRunningState = TaskExecuteStatus.RUNNING;
    if (this.executeCount > this.maxRepeatCount) {
      this.handleTaskFailed();
      return {
        success: false,
        errMessage: `Hit the maximum number of executions boundary:${this.maxRepeatCount}`,
      };
    }
    try {
      this.logger?.log(`${this.taskName}:start run action`);
      const formattedInput =
        (input && this.actionInputFormatter?.(input)) ?? input;
      const res = await this.action(
        this.taskContent,
        formattedInput,
        this.agent
      );
      const formattedResult = this.actionResultFormatter?.(res);
      this.executeCount = this.executeCount + 1;
      this.actionResult = formattedResult ?? res;
      this.logger?.log(`${this.taskName}:run action success`);
      this.logger?.log(res);
      this.handleTaskSuccess();
    } catch (e) {
      this.logger?.log(`${this.taskName}:run action failed`);
      this.handleTaskFailed();
    }
  };
}
