import { FlowContext } from "../src/core/flowContext";
import { LogMode } from "../src/logger";
import { Task } from "../src/task";
jest.setTimeout(100000);
test("task flow test", async () => {
  const task1 = new Task({
    taskName: "t1",
    taskContent: "this is task1",
    maxRepeatCount: 3,
    outputMeta: {
      propertyName: "output",
      propertyType: "number",
      propertyDesc: "属性描述",
    },
    actionConfig: {
      action: async () => {
        return await new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(1000);
          }, 2000);
        });
      },
    },
  });
  const task2 = new Task({
    taskName: "t2",
    taskContent: "this is task2",
    maxRepeatCount: 3,
    outputMeta: {
      propertyName: "output",
      propertyType: "number",
      propertyDesc: "属性描述",
    },
    actionConfig: {
      action: async () => {
        return await new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(1000);
          }, 2000);
        });
      },
    },
  });
  const task3 = new Task({
    taskName: "t3",
    taskContent: "this is task3",
    maxRepeatCount: 3,
    inputMeta: [
      {
        propertyName: "input1",
        propertyType: "number",
        propertyDesc: "属性描述",
      },
      {
        propertyName: "input2",
        propertyType: "number",
        propertyDesc: "属性描述",
      },
    ],
    outputMeta: {
      propertyName: "output",
      propertyType: "number",
      propertyDesc: "属性描述",
    },
    actionConfig: {
      action: async (content, payload) => {
        return await new Promise((resolve, reject) => {
          setTimeout(() => {
            const v1 = payload?.get("input1") as number;
            const v2 = payload?.get("input2") as number;
            resolve(v1 + v2);
          }, 2000);
        });
      },
    },
  });
  task1.addNextTasks([task3]);
  task2.addNextTasks([task3]);
  task3.bindPreOutput(task1, "input1");
  task3.bindPreOutput(task2, "input2");
  // create graph
  const graph = new FlowContext({
    entryTask: [task1, task2],
    taskPool: [task1, task2, task3],
    logMode: LogMode.console,
  });
  await graph.run();
  const res = task3.taskOutput.get("output") as number;
  expect(res).toBe(2000);
});
