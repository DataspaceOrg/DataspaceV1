import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
export function nextCompact(current: boolean, scroll: number) {
  return current ? scroll > 16 : scroll > 72;
}
export function workflowStage(centers: number[], readingLine: number) {
  let stage = 0;
  centers.forEach((center, index) => {
    if (center <= readingLine) stage = index;
  });
  return stage;
}
export function useLandingScroll(
  nav: RefObject<HTMLElement | null>,
  strip: RefObject<HTMLDivElement | null>,
  steps: RefObject<(HTMLElement | null)[]>,
  reduced: boolean,
) {
  const [isCompact, setCompact] = useState(false),
    [showGetStarted, setShowGetStarted] = useState(false),
    [stage, setStage] = useState(0);
  const values = useRef({ stage: 0, showGetStarted: false });
  const compact = useRef(false),
    manualScroll = useRef<number | null>(null),
    controls = useRef<DOMRect[]>([]),
    animations = useRef<Animation[]>([]);
  useEffect(() => {
    let frame = 0;
    function measure() {
      frame = 0;
      if (!nav.current || !strip.current) return;
      const next = nextCompact(compact.current, window.scrollY);
      if (next !== compact.current) {
        controls.current = [
          ...nav.current.querySelectorAll(".brand, .nav-links"),
        ].map((el) => el.getBoundingClientRect());
        animations.current.forEach((animation) => animation.cancel());
        animations.current = [];
        compact.current = next;
        setCompact(next);
      }
      const nextShow =
        next &&
        strip.current.getBoundingClientRect().bottom <=
          nav.current.getBoundingClientRect().bottom;
      if (nextShow !== values.current.showGetStarted) {
        values.current.showGetStarted = nextShow;
        setShowGetStarted(nextShow);
      }
      if (window.innerWidth < 768 || reduced) return;
      if (
        manualScroll.current !== null &&
        window.scrollY === manualScroll.current
      )
        return;
      manualScroll.current = null;
      const nextStage = workflowStage(
        steps.current
          .filter((el): el is HTMLElement => !!el)
          .map((el) => {
            const bounds = el.getBoundingClientRect();
            return bounds.top + bounds.height * 0.5;
          }),
        window.innerHeight * 0.48,
      );
      if (nextStage !== values.current.stage) {
        values.current.stage = nextStage;
        setStage(nextStage);
      }
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(measure);
    }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("pageshow", schedule);
    const observer = new ResizeObserver(schedule);
    if (strip.current) observer.observe(strip.current);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pageshow", schedule);
      animations.current.forEach((a) => a.cancel());
    };
  }, [nav, strip, steps, reduced]);
  useLayoutEffect(() => {
    if (!nav.current || reduced) {
      animations.current.forEach((a) => a.cancel());
      return;
    }
    const before = controls.current;
    if (!before.length) return;
    [
      ...nav.current.querySelectorAll<HTMLElement>(".brand, .nav-links"),
    ].forEach((el, index) => {
      const after = el.getBoundingClientRect();
      if (!before[index]?.width || !after.width || !el.animate) return;
      animations.current.push(
        el.animate(
          [
            {
              transform: `translate(${before[index].left - after.left}px, ${before[index].top - after.top}px)`,
            },
            { transform: "translate(0,0)" },
          ],
          { duration: 300, easing: "cubic-bezier(.22,1,.36,1)" },
        ),
      );
    });
    controls.current = [];
  }, [isCompact, nav, reduced]);
  return {
    isCompact,
    showGetStarted,
    stage,
    selectStage: (index: number) => {
      manualScroll.current = window.scrollY;
      values.current.stage = index;
      setStage(index);
    },
  };
}
