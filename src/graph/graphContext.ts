import type { LogInfo } from "../logger";
import { LogMode } from "../logger";
import type { Task } from "../task";
import type { GraphContextConfig } from "./types";
import { ActionResultType } from "../task/types";

export class GraphContext {
  constructor(config: GraphContextConfig) {
    const { entryTask, taskPool, logMode } = config;
    this.logMode = logMode;
    this.entryTask = entryTask;
    this.taskPool = taskPool;
    this.logList = [];
  }
  public entryTask: Array<Task>;
  public logMode: LogMode = LogMode.console;
  /** 存放日志信息 */
  private logList: Array<LogInfo> = [];
  /** 存放任务节点执行结果 */
  private actionResultStore: Array<ActionResultType> = [];
  /** 全部任务 */
  taskPool: Array<Task>;

  public addTask(task: Task) {
    this.taskPool.push(task);
    task.bindContext(this);
  }

  public storeLog = (logInfo: LogInfo) => {
    this.logList.push(logInfo);
  };

  public storeResult = (actionResult: ActionResultType) => {
    this.actionResultStore.push(actionResult);
  };

  public start = () => {
    // 1. 所有任务绑定 graph 信息
    this.taskPool.forEach((task) => task.bindContext(this));
    // 2. 根据 taskPool、entryTask 执行调度
    this._execute(4);
  };

  private _execute = (max: number) => {
    // 获得函数数组的迭代器
    // values()是对键值的遍历
    const iter = this.taskPool.values();
    // 在 ECMAScript 2015(ES6) 中 JavaScript 引入了迭代器接口（iterator）用来遍历数据。迭代器对象知道如何每次访问集合中的一项， 并跟踪该序列中的当前位置。在 JavaScript 中迭代器是一个对象，它提供了一个 next() 方法，用来返回序列中的下一项。这个方法返回包含两个属性：done 和 value
    const worker = async () => {
      // 按顺序执行函数
      for (const task of iter) {
        await task.runAction();
      }
    };
    // let pool = new Array(n).fill().map(worker);
    const pool = new Array(max).map(worker);
    return Promise.all(pool);
  };
}
