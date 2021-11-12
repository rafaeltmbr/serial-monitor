import {
  DependencyList,
  EffectCallback,
  MutableRefObject,
  useEffect,
} from "react";
import { getScrollInfo, IScrollOffsetInfo } from "../../util/getScrollInfo";

interface IScrollThreshold {
  offset?: Partial<IScrollOffsetInfo>;
  ratio?: IScrollThresholdRatio;
}

interface IScrollThresholdRatio {
  x?: IMinMax;
  y?: IMinMax;
}

interface IMinMax {
  min?: number;
  max?: number;
}

const checkScrollThreshold = (
  element: Element,
  threshold: IScrollThreshold
) => {
  const info = getScrollInfo(element);

  return (
    info.offset.top < (threshold?.offset?.top || 0) ||
    info.offset.bottom < (threshold.offset?.bottom || 0) ||
    info.offset.left < (threshold.offset?.left || 0) ||
    info.offset.right < (threshold.offset?.right || 0) ||
    info.ratio.x < (threshold.ratio?.x?.min || 0) ||
    info.ratio.x > (threshold.ratio?.x?.max || 1) ||
    info.ratio.y < (threshold.ratio?.y?.min || 0) ||
    info.ratio.y > (threshold.ratio?.y?.max || 1)
  );
};

type FuncType = (
  callback: EffectCallback,
  deps: DependencyList,
  ref: MutableRefObject<Element | undefined>,
  threshold: IScrollThreshold
) => void;

export const useScrollThreshold: FuncType = (
  callback,
  deps,
  ref,
  threshold
) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let previousFired = true;

    const scrollHandler = (e: Event) => {
      const fired = checkScrollThreshold(e.target as Element, threshold);
      if (fired && !previousFired) callback();

      previousFired = fired;
    };

    element.addEventListener("scroll", scrollHandler);

    return () => element.removeEventListener("scroll", scrollHandler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, ref]);
};
