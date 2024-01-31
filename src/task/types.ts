import { Agent } from "../agent";

export type TaskConfig = {
  uniqueId: string;
  taskName: string;
  taskContent: string;
  maxRepeatCount: number;
  action: LLMAction;
  nextTaskIds: string[];
  agent:Agent;
};

export type LLMAction = (
  actionDescription: string,
  /** should be multiple datasets output results */
  input?: unknown
) => Promise<ActionResultType>;

export type ActionResultType = {
  /** should be a multi state result */
  resultInfo?: unknown;
  timestamp: string;
  belongId: string;
  success: boolean;
  errMessage?: string;
};
