import { FlowContext } from "../src/core/flowContext";
import { LogMode } from "../src/logger";
import { Task } from "../src/task";
jest.setTimeout(100000);
test("task flow test", async () => {
  const task1 = new Task({
    taskName: "t1",
    taskContent: "this is task1",
    maxRepeatCount: 3,
    action: async (...input) => {
      return await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({ propertyName: "input1", value: 1000 });
        }, 2000);
      });
    },
  });
  const task2 = new Task({
    taskName: "t2",
    taskContent: "this is task2",
    maxRepeatCount: 3,
    action: async (...input) => {
      return await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({ propertyName: "input2", value: 1000 });
        }, 2000);
      });
    },
  });
  const task3 = new Task({
    taskName: "t2",
    taskContent: "this is task2",
    maxRepeatCount: 3,
    action: async (...args) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (!args[1]) {
            resolve({ propertyName: "input1", value: 1000 });
          }
          const taskPayload = args[1]!;
          const t1 = taskPayload.find((item) => item.propertyName === "input1");
          const t2 = taskPayload.find((item) => item.propertyName === "input2");
          resolve({
            propertyName: "input1",
            value: (t1?.value as number) + (t2?.value as number) + 1000,
          });
        }, 1000);
      });
    },
  });
  task1.addNextTasks([task3]);
  task2.addNextTasks([task3]);
  // create graph
  const graph = new FlowContext({
    entryTask: [task1, task2],
    taskPool: [task1, task2, task3],
    logMode: LogMode.console,
  });
  await graph.start();
  expect(task3.getActionResult()?.value).toBe(3000);
});
