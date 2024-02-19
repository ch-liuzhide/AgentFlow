export class Agent {
  protected uniqueName: string = "";
  private tags: string[] = [];
  private description: string = "";
  constructor(uniqueName: string, tags: string[], description: string) {
    this.uniqueName = uniqueName;
    this.tags = tags;
    this.description = description;
  }
}
