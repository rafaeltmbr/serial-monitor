import { DependencyList, MutableRefObject, useEffect, useMemo } from "react";

export interface IScrollDirection {
  x: number;
  y: number;
}

export const useScrollDirection = (
  callback: (direction: IScrollDirection) => void,
  deps: DependencyList,
  ref: MutableRefObject<Element | undefined>
) => {
  const element = ref.current;

  const lastScroll = useMemo(
    () => ({
      scrollTop: element ? element.scrollTop : 0,
      scrollLeft: element ? element.scrollLeft : 0,
      diffTop: 0,
      diffLeft: 0,
    }),
    [element]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const diffTop = element.scrollTop - lastScroll.scrollTop;
      const diffLeft = element.scrollLeft - lastScroll.scrollLeft;

      const changedYDirection = isOppositeDirection(
        diffTop,
        lastScroll.diffTop
      );
      const changedXDirection = isOppositeDirection(
        diffLeft,
        lastScroll.diffLeft
      );

      lastScroll.scrollTop = element.scrollTop;
      lastScroll.scrollLeft = element.scrollLeft;
      lastScroll.diffTop = diffTop;
      lastScroll.diffLeft = diffLeft;

      if (changedYDirection || changedXDirection)
        callback({ x: diffLeft, y: diffTop });
    };

    element.addEventListener("scroll", handleScroll);

    return () => element.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element, lastScroll, ...deps]);
};

export const isOppositeDirection = (a: number, b: number) => a * b < 0;
