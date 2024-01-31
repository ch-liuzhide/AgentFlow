import uuid from "uuid";
import type { GraphContext } from "../graph";
import { LogMode, LoggerConfig } from "./types";

export class Logger {
  private logId: string;
  private belongId: string;
  private logMode;
  private graphContext: GraphContext;

  constructor(config: LoggerConfig) {
    const { belongId, graphContext } = config;
    this.logId = uuid.v4();
    this.logMode = graphContext.logMode;
    this.belongId = belongId;
    this.graphContext = graphContext;
  }

  /** 打印日志 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public log = (payload: any) => {
    switch (this.logMode) {
      case LogMode.console:
        this._console(payload);
      case LogMode.store:
        this._storeLog(payload);
      case LogMode.consoleAndStore:
        this._console(payload);
        this._storeLog(payload);
      default:
      // ignore
    }
  };

  /** 普通打印 */
  private _console = (payload: string) => {
    console.log(`logId：${this.logId} \n  log content : ${payload}`);
  };

  /** 存储 */
  private _storeLog = (payload: string) => {
    this.graphContext.storeLog({
      id: this.logId,
      belongId: this.belongId,
      timestamp: new Date().toString(),
      content: payload,
    });
  };
}
