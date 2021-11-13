import { DependencyList, useCallback, useEffect, useMemo } from "react";

type Callback<T> = (list: T[]) => void;

type PushItem<T> = (item: T) => number;

export function useAccumulatorInterval<T>(
  callback: Callback<T>,
  deps: DependencyList,
  interval: number
): PushItem<T> {
  const list = useMemo<T[]>(() => [], []);

  useEffect(() => {
    const handleInterval = () => {
      if (list.length) callback([...list]);

      list.length = 0;
    };

    const descriptor = setInterval(handleInterval, interval);

    return () => clearInterval(descriptor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const pushList = useCallback((item: T) => list.push(item), [list]);

  return pushList;
}
