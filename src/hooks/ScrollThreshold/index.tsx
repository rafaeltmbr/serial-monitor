import {
  DependencyList,
  EffectCallback,
  MutableRefObject,
  useEffect,
} from "react";
import { getScrollInfo, IScrollInfo } from "../../util/getScrollInfo";

interface IScrollThreshold {
  offset?: IScrollThresholdOffset;
  ratio?: IScrollThresholdRatio;
}

interface IScrollThresholdOffset {
  top?: IMinMax;
  right?: IMinMax;
  bottom?: IMinMax;
  left?: IMinMax;
}

interface IScrollThresholdRatio {
  x?: IMinMax;
  y?: IMinMax;
}

interface IMinMax {
  min?: number;
  max?: number;
}

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

const checkScrollThreshold = (
  element: Element,
  threshold: IScrollThreshold
) => {
  const info = getScrollInfo(element);

  return checkFiredRatio(info, threshold) || checkFiredOffset(info, threshold);
};

const checkFiredRatio = (
  scrollInfo: IScrollInfo,
  threshold: IScrollThreshold
) => {
  const info = scrollInfo.ratio;

  if (!threshold.ratio) return false;

  const { x, y } = threshold?.ratio;

  return !!(
    (x?.min && info.x < x.min) ||
    (x?.max && info.x > x.max) ||
    (y?.min && info.y < y.min) ||
    (y?.max && info.y > y.max)
  );
};

const checkFiredOffset = (
  scrollInfo: IScrollInfo,
  threshold: IScrollThreshold
) => {
  const info = scrollInfo.offset;

  if (!threshold.offset) return false;

  const { top, bottom, left, right } = threshold?.offset;

  return !!(
    (top?.min && info.top < top.min) ||
    (top?.max && info.top > top.max) ||
    (bottom?.min && info.bottom < bottom.min) ||
    (bottom?.max && info.bottom > bottom.max) ||
    (left?.min && info.left < left.min) ||
    (left?.max && info.left > left.max) ||
    (right?.min && info.right < right.min) ||
    (right?.max && info.right > right.max)
  );
};
