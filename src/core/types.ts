import type { LogMode } from "../logger";
import type { Task } from "../task";

export type FlowContextConfig = {
  entryTask: Task[];
  taskPool: Task[];
  logMode: LogMode;
};
