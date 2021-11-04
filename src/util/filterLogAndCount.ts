import {
  ILog,
  ILogCountByType,
  LogType,
  logTypes,
} from "../interfaces/Log/ILog";
import { containString } from "./containString";

type FuncType = (
  logs: ILog[],
  search: string,
  type?: LogType
) => [ILog[], ILogCountByType];

export const filterLogAndCount: FuncType = (logs, search, type) => {
  const count = {} as ILogCountByType;
  logTypes.forEach((type) => (count[type] = 0));

  const filtered = logs.filter((log) => {
    if (!containString({ source: log.content, search })) return false;

    count[log.type] += 1;

    return !type || log.type === type;
  });

  return [filtered, count];
};
