import { useEffect, useRef, useState, type RefObject } from "react";
export function useHeroPlayback(
  host: RefObject<HTMLDivElement | null>,
  reduced: boolean,
) {
  const [stage, setStage] = useState(0),
    [playing, setPlaying] = useState(!reduced),
    [visible, setVisible] = useState(false),
    [hidden, setHidden] = useState(document.hidden),
    [ended, setEnded] = useState(false),
    [manual, setManual] = useState(false),
    [sequence, setSequence] = useState(0);
  const elapsed = useRef(0),
    [previousReduced, setPreviousReduced] = useState(reduced);
  // Changing the preference stops playback; switching it back does not restart it.
  if (previousReduced !== reduced) {
    setPreviousReduced(reduced);
    if (playing) setPlaying(false);
  }
  useEffect(() => {
    if (!host.current) return;
    const observer = new IntersectionObserver(
      (entries) => setVisible(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.2 },
    );
    observer.observe(host.current);
    const change = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", change);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", change);
    };
  }, [host]);
  const active = playing && visible && !hidden && !reduced;
  useEffect(() => {
    if (!active) return;
    let frame = 0,
      last: number | null = null;
    function tick(now: number) {
      if (last !== null) elapsed.current += now - last;
      last = now;
      host.current?.style.setProperty(
        "--stage-progress",
        String(Math.min(1, elapsed.current / 5000)),
      );
      host.current?.style.setProperty(
        "--upload-progress",
        String(Math.min(1, elapsed.current / 3200)),
      );
      if (elapsed.current >= 5000) {
        if (stage === 2) {
          setPlaying(false);
          setEnded(true);
          return;
        }
        elapsed.current = 0;
        setStage(stage + 1);
        return;
      }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, stage, host]);
  function select(index: number) {
    elapsed.current = 0;
    setStage(index);
    setManual(true);
    setSequence((value) => value + 1);
    setPlaying(false);
    setEnded(false);
    host.current?.style.setProperty("--stage-progress", "0");
  }
  function replay() {
    elapsed.current = 0;
    setStage(0);
    setManual(false);
    setSequence((value) => value + 1);
    host.current?.style.setProperty("--stage-progress", "0");
    host.current?.style.setProperty("--upload-progress", "0");
    setEnded(false);
    setPlaying(!reduced);
  }
  return {
    stage,
    sequence,
    pauseAnimations: !visible || hidden || (!playing && !manual && !ended),
    active,
    playing: playing && !reduced,
    ended,
    select,
    replay,
    toggle: () => {
      if (reduced) select((stage + 1) % 3);
      else if (ended) replay();
      else {
        setManual(false);
        setPlaying((value) => !value);
      }
    },
  };
}
