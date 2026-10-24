import { useEffect, useRef } from "react";
import { FiCheck, FiZap } from "react-icons/fi";
import { demoRows, demoSchema, demoInsight, type DemoView } from "./demoData";
export function ProductDemo({
  view,
  reduced,
  paused = false,
  context = false,
}: {
  view: DemoView;
  reduced: boolean;
  paused?: boolean;
  context?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null),
    animations = useRef<Animation[]>([]);
  useEffect(() => {
    if (reduced || !host.current?.animate) return;
    const targets = host.current.querySelectorAll(
      ".file-card, .drop-area>p, tbody tr, .schema-row, .context-preview, .insight-heading, .insight-card p, .insight-card li",
    );
    animations.current = [...targets].map((el, index) =>
      el.animate(
        [
          {
            opacity: 0,
            transform:
              view === "upload"
                ? "translateY(-16px) scale(.96)"
                : view === "schema" || view === "preview"
                  ? "translateX(12px)"
                  : "translateY(8px)",
          },
          { opacity: 1, transform: "none" },
        ],
        {
          duration: view === "upload" ? 400 : 300,
          delay: 60 + index * 45,
          fill: "backwards",
          easing: "cubic-bezier(.16,1,.3,1)",
        },
      ),
    );
    return () => {
      animations.current.forEach((a) => a.cancel());
      animations.current = [];
    };
  }, [view, reduced]);
  useEffect(() => {
    animations.current.forEach((a) => {
      if (a.playState !== "finished") {
        if (paused) a.pause();
        else a.play();
      }
    });
  }, [paused, view]);
  return (
    <div className="stage-host" ref={host} data-view={view}>
      {view === "upload" && (
        <div>
          <h3>Upload dataset</h3>
          <p className="intro">CSV or SQLite</p>
          <div className="drop-area">
            <div className="file-card">
              <span className="file-symbol">CSV</span>
              <div className="od-field od-fill">
                <span className="file-name">retail_sales.csv</span>
                <span className="file-meta">6 rows · 4 columns</span>
              </div>
              <FiCheck aria-hidden="true" />
            </div>
            <p>Example file ready</p>
            <div className="progress-track">
              <span className="progress-fill" />
            </div>
          </div>
        </div>
      )}
      {view === "preview" && (
        <div>
          <h3>transactions</h3>
          <p className="intro">Example table preview</p>
          <div
            className="demo-table"
            tabIndex={0}
            role="region"
            aria-label="Sample sales table; scroll for more columns"
          >
            <table>
              <thead>
                <tr>
                  {["order_id", "channel", "revenue"].map((name) => (
                    <th scope="col" key={name}>
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {demoRows.slice(0, 4).map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, i) => (
                      <td key={i}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="data-note">
            4 of 6 sample rows · Date column omitted in this compact demo
          </p>
        </div>
      )}
      {view === "schema" && (
        <div>
          <h3>transactions</h3>
          <p className="intro">4 columns</p>
          <div className="schema-list">
            <div className="schema-title">
              Column <span>Type</span>
            </div>
            {demoSchema.map(([name, type]) => (
              <div className="schema-row" key={name}>
                <span>{name}</span>
                <span>{type}</span>
              </div>
            ))}
          </div>
          <p className="data-note">Example schema · Sample dataset</p>
        </div>
      )}
      {view === "insight" && (
        <div>
          {context && (
            <div className="context-preview">
              Context: {demoInsight.context}
            </div>
          )}
          <div className="insight-card">
            <div className="insight-heading">
              <FiZap aria-hidden="true" />
              Initial insight <span className="badge">Illustrative</span>
            </div>
            <p>{demoInsight.summary}</p>
            <ul>
              {demoInsight.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
