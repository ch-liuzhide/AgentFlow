import type { Agent } from "../agent";
import type { GraphContext } from "../core/graphContext";
import { Logger } from "../logger/logger";
import { TaskAction, TaskConfig, TaskRunningState } from "./types";

import uuid from "uuid";

export class Task {
  actionResultFomatter?: (v: any) => void;
  constructor(config: TaskConfig) {
    const { maxRepeatCount, taskName, taskContent, action, agent, actionResultFomatter } = config;
    this.taskId = uuid.v4();
    this.maxRepeatCount = maxRepeatCount;
    this.taskName = taskName;
    this.taskContent = taskContent;
    this.action = action;
    this.agent = agent;
    this.actionResultFomatter = actionResultFomatter
  }
  private taskId: string;
  private maxRepeatCount: number;
  private taskName: string;
  private taskContent: string;
  private nextTaskList?: Array<string>;
  private action: TaskAction;
  private logger?: Logger;
  private agent: Agent;
  protected runCount: number = 0;
  protected graphContext?: GraphContext;
  protected actionResultStore: any[] = []
  public taskRunningState: TaskRunningState = TaskRunningState.init

  public getTaskId = () => {
    return this.taskId;
  };
  public getMaxRepeatCount = () => {
    return this.maxRepeatCount;
  };
  public getTaskName = () => {
    return this.taskName;
  };
  public getRunCount = () => {
    return this.runCount;
  };
  public getNextTask = () => {
    return this.nextTaskList;
  };

  /** execute action hook */
  public runAction = async (input?: unknown) => {
    if (this.runCount > this.maxRepeatCount) {
      return {
        success: false,
        errMessage: `Hit the maximum number of executions boundary:${this.maxRepeatCount}`,
      };
    }
    try {
      this.logger?.log(`${this.taskName}:start run action`);
      const res = await this.action(this.taskContent, input);
      const formattedResult = this.actionResultFomatter?.(res)
      this.actionResultStore.push(formattedResult ?? res)

      this.logger?.log(`${this.taskName}:run action success`);
      this.logger?.log(res);
      this.runCount = this.runCount + 1;
      return {
        success: true,
        resultInfo: res,
      };
    } catch (e) {
      this.logger?.log(`${this.taskName}:run action failed`);
      return {
        success: false,
        errMessage: e,
      };
    }
  };
  /** bind graph context  */
  public bindContext = (graphContext: GraphContext) => {
    this.graphContext = graphContext;
    this.logger = new Logger({
      belongId: this.taskId,
      graphContext: graphContext,
    });
  };
}
