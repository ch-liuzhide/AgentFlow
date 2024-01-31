import type { GraphContext } from "../graph";

/** 日志模式 */
export enum LogMode {
  /** 控制台打印 */
  console = "console",
  /** 存储到日志环境 */
  store = "store",
  /** 不打印，也不存储 */
  forbidden = "forbidden",
  /** 打印且存储 */
  consoleAndStore = "consoleAndStore",
}

export type LoggerConfig = {
  /** 所属 agent 、task 的 id */
  belongId: string;
  graphContext: GraphContext;
};

export type LogInfo = {
  id: string;
  timestamp: string;
  belongId: string;
  content: string;
};
