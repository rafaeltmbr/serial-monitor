import {
  ILog,
  ILogCountByType,
  LogType,
  logTypes,
} from "../../../interfaces/Log/ILog";
import { containString } from "../../../util/containString";

type FuncType = (params: IParams) => IResponse;

interface IParams {
  logs: ILog[];
  search: string;
  type?: LogType;
  startIndex: number;
  maxCharCount: number;
}

interface IResponse {
  filtered: ILog[];
  count: ILogCountByType;
  endIndex: number;
}

export const filterLogAndCount: FuncType = ({
  logs,
  search,
  type,
  startIndex,
  maxCharCount,
}) => {
  const count = {} as ILogCountByType;
  logTypes.forEach((type) => (count[type] = 0));

  const filtered = [] as ILog[];

  let i = startIndex;

  for (
    let len = logs.length, charCount = 0;
    i < len && charCount < maxCharCount;
    i += 1
  ) {
    const log = logs[i];

    if (type && type !== log.type) continue;

    if (search && !containString({ source: log.content, search })) continue;

    filtered.push(log);
    count[log.type] += 1;
    charCount += log.content.length;
  }

  return { filtered, count, endIndex: i };
};
