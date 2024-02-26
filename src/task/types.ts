export type TaskConfig = {
  taskName: string;
  taskContent: string;
  maxRepeatCount: number;
  inputMeta?: TaskPayloadMeta[];
  outputMeta: TaskPayloadMeta;
  // TODO: Consider how to materialize user-defined actions.
  actionConfig?: ActionConfig;
};

export type PayloadChainInfo = {
  propertyName: string;
  prevTaskId: string;
  prevPropertyName: string;
};

export type ActionConfig = {
  action: TaskAction;
  actionInputFormatter?: (v: TaskPayload) => TaskPayload;
  actionOutputFormatter?: (v: unknown) => TaskPayload;
};

export type TaskPayloadMeta = {
  propertyName: string;
  propertyDesc: string;
  propertyType: "boolean" | "number" | "string";
};

export type TaskPayload = Map<string, string | boolean | number | TaskPayload>;

export type TaskAction = (
  taskContent: string,
  payload?: TaskPayload
) => Promise<unknown>;

export enum TaskExecuteStatus {
  INIT = "INIT",
  RUNNING = "RUNNING",
  SUCCEED = "SUCCEED",
  FAILED = "FAILED",
}
