const logTypes = <const>["log", "warn", "error", "command", "send"];

export type LogType = typeof logTypes[number];

export interface ILog {
  id: number;
  type: LogType;
  content: string;
  timestamp: Date;
}
