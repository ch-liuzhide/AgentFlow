import { ActionConfig, TaskAction, TaskPayload } from "./types";

export class Action {
  action: TaskAction;
  actionInputFormatter?: ((v: TaskPayload) => TaskPayload) | undefined;
  actionOutputFormatter?: ((v: unknown) => unknown) | undefined;
  protected _result?: unknown;
  constructor(config: ActionConfig) {
    this.action = config.action;
    this.actionInputFormatter = config.actionInputFormatter;
  }
  public get result() {
    return this._result;
  }

  public async run(taskContent: string, input?: TaskPayload) {
    try {
      const formattedInput =
        (input && this.actionInputFormatter?.(input)) ?? input;
      // the action originates from user-defined executable operation.
      const res = await this.action(taskContent, formattedInput);
      const formattedResult = (this.actionOutputFormatter?.(res) ??
        res);
      this._result = formattedResult;
      return formattedResult;
    } catch (e) {
      throw e;
    }
  }
}
