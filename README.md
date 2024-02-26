<!-- header -->
<div align="center">
<a name="readme-top"></a>
<h1>Agent FLow</h1>
运行在 Node、Browser 的任务调度框架，可用于搭建基于任务（Task）、执行点（Action）的 Agent 引擎。

</div>

## ✨ 特性一览

- [x] **自定义 Task**：

```javascript
const task = new Task({
  taskName: "task name",
  taskContent: "return any input and end with 'miao'",
  maxRepeatCount: 3,
  inputMeta: [
    {
      propertyName: "input1",
      propertyType: "number",
      propertyDesc: "description of property",
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
          const v1 = payload?.get("input1").toString();
          resolve(v1 + "miao~");
        }, 2000);
      });
    },
  },
});
```

- [x] **关联下游任务并指定输出**：
```javascript
task1.addNextTasks([task2]);
// 将 任务2 的 input1 与 任务1 的输出进行关联
task2.bindPreOutput(task1, "input1");
```

- [x] **创建执行环境，并执行。全部任务是异步执行的**：
```javascript
  const graph = new FlowContext({
    // 开始任务
    entryTask: [task1],
    // 全部任务
    taskPool: [task1, task2],
    // 日志
    logMode: LogMode.console,
  });
  await graph.run();
```

## 🔥待支持特性
- [ ] 自动通过 entryTask 计算出全部的 task
- [ ] 任务的 action 具备自动向全局添加 task 的能力
- [ ] 任务调度的中断机制
- [ ] 在 Node 端更好的性能