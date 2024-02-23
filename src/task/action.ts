import { ActionConfig, TaskAction, TaskPayload } from "./types";

export class Action {
  action: TaskAction;
  actionInputFormatter?: ((v: TaskPayload[]) => TaskPayload[]) | undefined;
  actionOutputFormatter?: ((v: unknown) => TaskPayload) | undefined;
  protected _result?: TaskPayload;
  constructor(config: ActionConfig) {
    this.action = config.action;
    this.actionInputFormatter = config.actionInputFormatter;
  }
  public get result() {
    return this._result;
  }

  public async run( taskContent:string,input?: TaskPayload[]) {
    try {
      const formattedInput =
        (input && this.actionInputFormatter?.(input)) ?? input;
      // the action originates from user-defined executable operation.
      // const handler = {
      //   get(target: string, property: never) {
      //     return (
      //       formattedInput?.find((item) => item.propertyName === target)?.value ??
      //       target[property]
      //     );
      //   },
      // };
      // const obj = { taskContent: taskContent }; // 创建一个空对象
      // const newFormattedInput = new Proxy(obj, handler);
      const res = await this.action(formattedInput);
      const formattedResult = (this.actionOutputFormatter?.(res) ??
        res) as TaskPayload;
      this._result = formattedResult;
      return formattedResult;
    } catch (e) {
      throw e;
    }
  }
}
