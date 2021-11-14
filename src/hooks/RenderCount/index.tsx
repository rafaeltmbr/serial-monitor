import { DependencyList, useEffect, useRef } from "react";

type FuncType = (
  callback: (count: number) => void,
  deps?: DependencyList,
  interval?: number
) => void;

/**
 * Count the number of renders in a given interval.
 * @param callback Imperative function that will be called with the renders count after a given interval.
 * @param deps List of the callback function dependencies. Defaults to an empty list (no dependencies).
 * @param interval Interval in miliseconds. Defaults to 1000 ms.
 */

export const useRenderCount: FuncType = (
  callback,
  deps = [],
  interval = 1000
) => {
  const count = useRef(0);

  count.current += 1;

  useEffect(() => {
    const descriptor = setInterval(() => {
      callback(count.current);
      count.current = 0;
    }, interval);

    return () => clearInterval(descriptor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, interval, ...deps]);
};
