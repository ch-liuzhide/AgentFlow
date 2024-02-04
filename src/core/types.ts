import type { LogMode } from "../logger";
import type { Task } from "../task";

export type GraphContextConfig = {
  entryTask: Task[];
  taskPool: Task[];
  logMode: LogMode;
};
