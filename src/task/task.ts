import type EventEmitter from "eventemitter3";
import type { FlowContext } from "../core/flowContext";
import { Logger } from "../logger/logger";
import {
  TaskConfig,
  TaskPayload,
  TaskExecuteStatus,
  ActionConfig,
  PayloadChainInfo,
  TaskPayloadMeta,
} from "./types";

import { v4 } from "uuid";
import { FlowEventName } from "../core";
import { Action } from "./action";

export class Task {
  private eventBus?: EventEmitter;
  private maxRepeatCount: number;
  private _taskName: string;
  private taskContent: string;
  private logger?: Logger;
  protected _taskId: string;
  protected _action?: Action;
  protected _executeCount: number = 0;
  protected _flowContext?: FlowContext;
  protected _actionResult?: TaskPayload;
  protected _status: TaskExecuteStatus = TaskExecuteStatus.INIT;
  protected _prevTaskIds: Set<string>;
  protected _nextTaskIds: Set<string>;
  protected _payloadChainInfo: PayloadChainInfo[] = [];
  protected _inputMeta: TaskPayloadMeta[] = [];
  protected _outputMeta: TaskPayloadMeta;

  constructor(config: TaskConfig) {
    const {
      maxRepeatCount,
      taskName,
      taskContent,
      inputMeta,
      outputMeta,
      actionConfig,
    } = config;
    this._taskId = v4();
    this.maxRepeatCount = maxRepeatCount;
    this._taskName = taskName;
    this.taskContent = taskContent;
    this._prevTaskIds = new Set();
    this._nextTaskIds = new Set();
    this._inputMeta = inputMeta ?? [];
    this._outputMeta = outputMeta;
    actionConfig && this.bindAction(actionConfig);
  }

  public get id() {
    return this._taskId;
  }

  public get action() {
    return this._action;
  }

  public get payloadChainInfo() {
    return this._payloadChainInfo;
  }

  public get outputMeta() {
    return this._outputMeta;
  }

  public get inputMeta() {
    return this._inputMeta;
  }

  public get nextTaskIds() {
    return Array.from(this._nextTaskIds);
  }

  public get prevTaskIds() {
    return Array.from(this._prevTaskIds);
  }

  public get taskOutput() {
    if (!this._action) {
      throw new Error(
        `The task ${this._taskName} is not associated with an executable action.`
      );
    }
    const output = new Map();
    output.set(this._outputMeta.propertyName, this._action.result);
    return output;
  }

  public get taskName() {
    return this._taskName;
  }

  public get status() {
    return this._status;
  }

  public getMaxRepeatCount = () => {
    return this.maxRepeatCount;
  };

  public getRunCount = () => {
    return this._executeCount;
  };

  private handleTaskFailed = () => {
    this._status = TaskExecuteStatus.FAILED;
    this.eventBus?.emit(FlowEventName.TaskExecuteFailed, this);
  };

  private handleTaskSuccess = () => {
    this._status = TaskExecuteStatus.SUCCEED;
    this.eventBus?.emit(FlowEventName.TaskExecuteSuccess, this);
  };

  /** bind graph context  */
  public bindContext = (flowContext: FlowContext) => {
    this._flowContext = flowContext;
    this.eventBus = flowContext.eventBus;
    this.logger = new Logger({
      belongId: this._taskId,
      graphContext: flowContext,
    });
  };

  public bindAction = (config: ActionConfig) => {
    this._action = new Action(config);
  };

  public addPrevTasks = (tasks: Task[], isSync: boolean = true) => {
    for (const task of tasks) {
      const taskId = task.id;
      this._prevTaskIds.add(taskId);
      this.removeTaskIdFromNext(taskId);
      if (isSync) {
        task.addNextTasks([this], false);
      }
    }
  };

  public addNextTasks = (tasks: Task[], isSync: boolean = true) => {
    for (const task of tasks) {
      const taskId = task.id;
      this._nextTaskIds.add(taskId);
      this.removeTaskIdFromPrev(taskId);
      if (isSync) {
        task.addPrevTasks([this], false);
      }
    }
  };

  public removeTaskIdFromNext = (taskId: string) => {
    this._nextTaskIds.has(taskId) && this._nextTaskIds.delete(taskId);
  };

  public removeTaskIdFromPrev = (taskId: string) => {
    this._prevTaskIds.has(taskId) && this._prevTaskIds.delete(taskId);
  };

  public addInputMeta = (metaItem: TaskPayloadMeta) => {
    if (this._inputMeta) {
      this._inputMeta.push(metaItem);
    } else {
      this._inputMeta = [metaItem];
    }
  };

  public setInputMeta = (meta: TaskPayloadMeta[]) => {
    this._inputMeta = meta;
  };

  public setOutputMeta = (metaItem: TaskPayloadMeta) => {
    this._outputMeta = metaItem;
  };

  /**
   * Associate a certain input in the current task with the output field of an upstream task.
   * @param prevTask upstream task
   * @param curPropertyName input field
   */
  public bindPreOutput = (prevTask: Task, curPropertyName: string) => {
    if (
      !this.inputMeta?.find((item) => item.propertyName === curPropertyName)
    ) {
      throw new Error(
        `bindPreOutput error, can not find ${curPropertyName} in ${this.inputMeta}`
      );
    }
    this._payloadChainInfo.push({
      propertyName: curPropertyName,
      prevTaskId: prevTask.id,
      prevPropertyName: prevTask.outputMeta.propertyName,
    });
  };

  /**
   * run action
   * @param input
   * @returns
   */
  public runAction = async (input?: TaskPayload) => {
    try {
      this._status = TaskExecuteStatus.RUNNING;
      if (this._executeCount > this.maxRepeatCount) {
        throw new Error(
          `Hit the maximum number of executions boundary:${this.maxRepeatCount}`
        );
      }
      this.logger?.log(`${this._taskName}:start run action`);
      const res = await this._action!.run(this.taskContent, input);
      this.logger?.log(`${this._taskName}:run action success`);
      this.logger?.log(res);
      this.handleTaskSuccess();
    } catch (e) {
      this.logger?.log(`[Error]:run action failed.\n${e}`);
      this.handleTaskFailed();
    }
  };
}
