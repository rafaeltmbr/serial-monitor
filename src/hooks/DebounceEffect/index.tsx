import { DependencyList, EffectCallback } from "react";
import { useUpdateEffect } from "../UpdateEffect";

type FuncType = (
  callback: EffectCallback,
  deps: DependencyList,
  time: number
) => void;

/**
 * useEffect-like hook with debounce. The callback is called once the
 * dependencies (deps) are steady (not changing) for a given amount of time.
 *
 * @param callback Imperative function that can return a cleanup function.
 *
 * @param deps List of dependencies that need to be steady before calling
 * the callback.
 *
 * @param time Amount of time to wait before call de callback function
 * once the dependencies are steady.
 */

export const useDebounceEffect: FuncType = (callback, deps, time) => {
  useUpdateEffect(() => {
    let cleanup: any;

    const d = setTimeout(() => (cleanup = callback()), time);

    return () => {
      clearTimeout(d);
      if (typeof cleanup === "function") cleanup();
    };
  }, [...deps, time]);
};
