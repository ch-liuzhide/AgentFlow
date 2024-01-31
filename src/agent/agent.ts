export class Agent {
  protected uniqueName: string = "";
  private tags: string[] = [];
  private tools: Array<() => void> = [];
  private description: string = "";
  constructor(
    uniqueName: string,
    tags: string[],
    tools: Array<() => void>,
    description: string
  ) {
    this.uniqueName = uniqueName;
    this.tags = tags;
    this.tools = tools;
    this.description = description;
  }
  public useTool = (toolName: string) => {
    console.log(toolName);
    return toolName;
  };
}
