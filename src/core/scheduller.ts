import { Task } from "../task";

/**
 * 任务调度器的作用
 * 1. 解析调度顺序？
 * 2. 在任务结束后，让下游任务顺利加入调度开始执行
 *  2.1有时候一个任务依赖多个上游任务的产出，需要考虑上游任务的产出均完成后，再加入调度。
 * 3. 通知 graphContext 任务全部执行结束
 */
export class Scheduler {
    max: any;
    count: number;
    queue: Task[];
    constructor(max: any) {
        // 最大可并发任务数
        this.max = max;
        // 当前并发任务数
        this.count = 0;
        // 阻塞的任务队列
        this.queue = [];
    }

    async _execute(task: Task) {
        if (this.count >= this.max) {
            // 若当前正在执行的任务，达到最大容量max
            // 阻塞在此处，等待前面的任务执行完毕后将resolve弹出并执行
            this.queue.push(task)
        }
        // 当前并发任务数++
        this.count++;
        // 使用await执行此函数
        const res = await task.runAction();
        // 执行完毕，当前并发任务数--
        this.count--;
        // 若队列中有值，将其resolve弹出，并执行
        if (this.queue.length) {
            this.queue.shift()
        }
        return res;
    }
}
