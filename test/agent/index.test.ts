import { Agent } from "../../src/agent";

test("create agent", () => {
  const agent = new Agent("test", ["test"], [() => {}], "这是一个测试");
  expect(agent.useTool("tool")).toBe("tool");
});
