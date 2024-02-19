import type EventEmitter from "eventemitter3";
import { Task, TaskExecuteStatus, TaskPayload } from "../task";
import { FlowEventName, SchedulerStatus } from "./types";

export class Scheduler {
  /** The maximum number of concurrent executions for a task. */
  protected max: number;
  /** The number of tasks currently being executed in this scheduler. */
  protected count: number;
  /** The maximum timeout duration for the current scheduler. */
  protected timeout: number;
  /** The queue of tasks ready for execution. */
  protected queue: Task[];
  /** The entry task executed by the current scheduler. */
  protected entryTask: Task[];
  protected taskMap: Map<string, Task>;
  /** Status of the scheduler." */
  protected schedulerStatus: SchedulerStatus;
  /** The last task in the entire set of tasks. */
  protected endTask: Task[] = [];
  constructor(
    eventBus: EventEmitter,
    entryTask: Task[],
    taskPool: Task[],
    max: number,
    timeout: number
  ) {
    this.max = max;
    this.count = 0;
    this.queue = [];
    this.entryTask = entryTask;
    this.timeout = timeout * 1000;
    const taskMap: Map<string, Task> = new Map();
    taskPool.forEach((task) => {
      taskMap.set(task.getTaskId(), task);
    });
    this.taskMap = taskMap;
    eventBus.on(FlowEventName.TaskExecuteFailed, this.handleTaskFailed);
    eventBus.on(FlowEventName.TaskExecuteSuccess, this.handleTaskSuccess);
    this.schedulerStatus = SchedulerStatus.Init;
    this.endTask = this.getEndTask();
  }

  /**
   * The scheduler starts scheduling
   */
  public start = async () => {
    this.schedulerStatus = SchedulerStatus.Running;
    for (const task of this.entryTask) {
      this._execute(task);
    }
    // Terminate scheduling when the scheduler's status is checked and found to be in a terminated state.
    await this.waitForTerminated();
  };

  /**
   * get the end task of scheduler
   * @returns endTask
   */
  private getEndTask = () => {
    const endTask: Task[] = [];
    this.taskMap.forEach((task) => {
      const nextTaskIds = task.getNextTaskIds();
      if (!nextTaskIds || !nextTaskIds.length) {
        endTask.push(task);
      }
    });
    return endTask;
  };

  private getPrevTasks = (task: Task): Task[] => {
    return task
      .getPrevTaskIds()
      .map((taskId) => this.taskMap.get(taskId))
      .filter(Boolean) as Task[];
  };

  private getNextTasks = (task: Task): Task[] => {
    return task
      .getNextTaskIds()
      .map((taskId) => this.taskMap.get(taskId))
      .filter(Boolean) as Task[];
  };

  private isAllEndTaskTerminated = () => {
    return this.endTask.every(
      (task) =>
        task.getTaskState() === TaskExecuteStatus.SUCCEED ||
        task.getTaskState() === TaskExecuteStatus.FAILED
    );
  };

  /**
   * End scheduling when the scheduler's status is checked and found to be in a terminated state or when the maximum allowed scheduling time is exceeded.
   * @param interval Check the time interval in milliseconds
   * @param timeout
   * @returns
   */
  private waitForTerminated = async (interval = 2000) => {
    return new Promise<void>((resolve, reject) => {
      let timeSpentWaiting = 0;
      const checkInterval = setInterval(() => {
        if (this.schedulerStatus === SchedulerStatus.Terminated) {
          clearInterval(checkInterval);
          resolve();
        } else if (timeSpentWaiting >= this.timeout) {
          clearInterval(checkInterval);
          reject(new Error("Timeout waiting for value to change"));
        } else {
          timeSpentWaiting += interval;
        }
      }, interval);
    });
  };

  /**
   * Event response after a task node has been successfully executed
   * @param task Succeed Task
   */
  private handleTaskSuccess = (task: Task) => {
    const nextTasks = this.getNextTasks(task);
    if (nextTasks.length) {
      nextTasks.forEach((nextTask) => {
        const prevTasks = this.getPrevTasks(nextTask);
        let outputList: unknown[] = [];
        if (
          prevTasks.every(
            (prevTask) => prevTask.getTaskState() === TaskExecuteStatus.SUCCEED
          )
        ) {
          outputList = prevTasks.map((prevTask) => prevTask.getActionResult());
        } else {
          // If not all upstream tasks have succeeded, ignore this Event response.
          return;
        }
        this._execute(nextTask!, outputList);
      });
    } else {
      if (this.isAllEndTaskTerminated()) {
        this.schedulerStatus = SchedulerStatus.Terminated;
      }
    }
  };

  /**
   * TODO:
   * 通知 flowContext 有任务执行错误
   * 是否启动一个忽略错误的功能，可能一个任务有多个分支，如果某个分支错误，实际上并不影响其它分支的执行
   * 或者让没有错误的分支继续执行，直到没有任务可以执行为止。
   * @param task
   */
  private handleTaskFailed = (task: Task) => {
    console.log(task);
  };

  /**
   *
   * @param task
   * @param input prev task output or manual input
   * @returns
   */
  private _execute = async (task: Task, input?: TaskPayload<unknown>[]) => {
    // If the number of tasks currently being executed exceeds the maximum allowed, then subsequent tasks are queued.
    if (this.count >= this.max) {
      this.queue.push(task);
      return;
    }
    this.count++;
    await task.runAction(input);
    this.count--;
    if (this.queue.length) {
      await this._execute(this.queue.shift()!);
    }
  };
}
