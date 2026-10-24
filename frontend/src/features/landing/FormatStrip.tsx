import type { RefObject } from "react";
export function FormatStrip({
  stripRef,
}: {
  stripRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="wrap">
      <div className="format-strip" ref={stripRef}>
        <span>Bring your existing datasets.</span>
        <div className="format-items">
          <span>.csv</span>
          <span>.db</span>
          <span>.sqlite</span>
        </div>
      </div>
    </div>
  );
}
