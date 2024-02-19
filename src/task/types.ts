import type { Agent } from "../agent";

export type TaskConfig = {
  taskName: string;
  taskContent: string;
  maxRepeatCount: number;
  action: TaskAction;
  actionInputFormatter?: (v: TaskPayload<unknown>[]) => TaskPayload<unknown>;
  actionResultFormatter?: (v: unknown) => void;
  agent?: Agent;
};

export type TaskPayload<T> = {
  propertyName: string;
  value: T | TaskPayload<T>;
};

export type TaskAction = (
  taskContent: string,
  input?: TaskPayload<unknown>,
  agent?: Agent
) => Promise<TaskPayload<unknown>>;

export enum TaskExecuteStatus {
  INIT = "INIT",
  RUNNING = "RUNNING",
  SUCCEED = "SUCCEED",
  FAILED = "FAILED",
}
