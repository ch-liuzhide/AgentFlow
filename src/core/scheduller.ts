import type EventEmitter from "eventemitter3";
import { Task } from "../task";

/**
 * 任务调度器的作用
 * 1. 根据初始化的 task 解析调度顺序，将任务的上游依赖和下游依赖进行重建，如果指定了 endTask ，则需要将游离节点抛出
 * 2. 将执行初始任务加入任务队列
 * 3. 启动执行器对任务队列的内容进行执行，直到队列为空为止
 * 4. 在任务结束后，让下游任务顺利加入调度开始执行
 * 在上游任务结束后有多种情况需要考虑
 * 1. 有时候一个任务依赖多个上游任务的产出，需要判断考虑上游任务的产出均完成后，再将该任务加入调度。
 * 2. 有时候上游任务会产出新的 task ，改变了原来的依赖关系，此时需要进行动态的更新图。更新过程实际上不需要全局刷新，
 * 只需要关注产生的节点对应的上下游依赖。我们先忽略这种特性
 * 3. 我们有人工节点的需要。任务调度可能一直卡在人工节点不能结束。需要等待过程不阻塞线程
 */
export class Scheduler {
  max: number;
  count: number;
  queue: Task[];
  entryTask: Task[];
  taskPool: Task[];
  constructor(
    eventBus: EventEmitter,
    entryTask: Task[],
    taskPool: Task[],
    max: number
  ) {
    // 最大可并发任务数
    this.max = max;
    // 当前并发任务数
    this.count = 0;
    // 阻塞的任务队列
    this.queue = [];
    this.entryTask = entryTask;
    this.taskPool = taskPool;
    eventBus.on("TaskExecuteEnd", this.handleTaskEnd);
  }

  public start = () => {
    for (const task of this.entryTask) {
      this._execute(task);
    }
  };

  private handleTaskEnd = (task: Task) => {
    // 某个任务执行完毕后，需要启动下游任务
    // todo：1. 检查上游任务是否全部完成
    // 如果没有完成，则不处理
    // 如果都完成了，则继续处理
  };

  /**
   * 检查任务的上游任务是否都完成调度
   * @param task
   */
  private checkPrevTask = (task: Task) => {
    return true;
  };

  private getPrevTaskResult = (task: Task) => {};

  private async _execute(task: Task) {
    if (this.count >= this.max) {
      this.queue.push(task);
      return;
    }
    this.count++;
    await task.runAction();
    this.count--;
    if (this.queue.length) {
      this._execute(this.queue.shift()!);
    }
  }
}
