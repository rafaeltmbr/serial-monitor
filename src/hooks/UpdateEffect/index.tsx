import { DependencyList, EffectCallback, useEffect, useMemo } from "react";

type FuncType = (callback: EffectCallback, deps?: DependencyList) => void;

/**
 * useEffect-like hook that does not fires on components first render.
 *
 * @param callback Imperative function that can return a cleanup function.
 * @param deps If present, effect will only activate if the values in the list change.
 */

export const useUpdateEffect: FuncType = (callback, deps) => {
  const firstCallTracker = useMemo(() => ({ isFirstCall: true }), []);

  useEffect(() => {
    if (firstCallTracker.isFirstCall) {
      firstCallTracker.isFirstCall = false;
      return;
    }

    return callback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
