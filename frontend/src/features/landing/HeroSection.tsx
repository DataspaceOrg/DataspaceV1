import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheck,
  FiLayers,
  FiUpload,
  FiTable,
  FiZap,
  FiPause,
  FiPlay,
  FiRotateCcw,
} from "react-icons/fi";
import { ProductDemo } from "./ProductDemo";
import { useHeroPlayback } from "./useHeroPlayback";
import type { DemoView } from "./demoData";
const titles = ["Upload", "Inspect", "Insight"];
const views: DemoView[] = ["upload", "preview", "insight"];
const icons = [FiUpload, FiTable, FiZap];
export function HeroSection({
  destination,
  reduced,
}: {
  destination: string;
  reduced: boolean;
}) {
  const host = useRef<HTMLDivElement>(null),
    playback = useHeroPlayback(host, reduced);
  const playLabel = reduced
    ? "Next demo stage"
    : playback.ended
      ? "Replay demo"
      : playback.playing
        ? "Pause demo"
        : "Play demo";
  return (
    <div className="hero-scene">
      <section className="wrap hero">
        <div className="hero-copy">
          <h1>
            <span className="headline-line">Get to know</span>
            <span className="headline-line">your data.</span>
          </h1>
          <p>
            Upload your files, explore their structure, and get initial
            insights. All in one workspace.
          </p>
          <div className="hero-actions">
            <Link className="btn primary" to={destination}>
              Get Started
              <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
          <div className="hero-hints">
            <span>
              <FiCheck aria-hidden="true" />
              CSV & SQLite
            </span>
            <span>
              <FiCheck aria-hidden="true" />
              Schema explorer
            </span>
          </div>
        </div>
        <div className="hero-demo" ref={host}>
          <div
            className="floating-toolbar"
            role="group"
            aria-label="Product walkthrough stages"
          >
            <span className="toolbar-emblem" aria-hidden="true">
              <FiLayers />
            </span>
            {titles.map((title, index) => {
              const Icon = icons[index];
              return (
                <button
                  key={title}
                  className="demo-tab"
                  aria-pressed={playback.stage === index}
                  onClick={() => playback.select(index)}
                >
                  <Icon aria-hidden="true" />
                  {title}
                </button>
              );
            })}
          </div>
          <div className="glass-panel">
            <div className="panel-header">
              <span className="od-row">
                <FiTable aria-hidden="true" />
                Retail sales
              </span>
              <span className="badge">
                <i className="status-dot" aria-hidden="true" />
                Sample data
              </span>
            </div>
            <ProductDemo
              key={`${playback.stage}:${playback.sequence}`}
              view={views[playback.stage]}
              reduced={reduced}
              paused={playback.pauseAnimations}
            />
            <div className="panel-bottom">
              <span>
                0{playback.stage + 1} / 03 · {titles[playback.stage]}
              </span>
              <div className="playback">
                <button
                  className="icon-btn"
                  aria-label={playLabel}
                  title={playLabel}
                  onClick={playback.toggle}
                >
                  {reduced ? (
                    <FiArrowRight aria-hidden="true" />
                  ) : playback.playing ? (
                    <FiPause aria-hidden="true" />
                  ) : (
                    <FiPlay aria-hidden="true" />
                  )}
                </button>
                <button
                  className="icon-btn"
                  aria-label="Restart demo"
                  title="Restart demo"
                  onClick={playback.replay}
                >
                  <FiRotateCcw aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
          <div className="demo-caption">
            <span>Interactive product walkthrough</span>
            <span>Sample data · illustrative AI</span>
          </div>
        </div>
      </section>
    </div>
  );
}
