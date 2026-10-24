import type { RefObject } from "react";
import { FiTable } from "react-icons/fi";
import { workflowSteps } from "./demoData";
import { ProductDemo } from "./ProductDemo";
export function WorkflowSection({
  stage,
  selectStage,
  stepsRef,
  reduced,
}: {
  stage: number;
  selectStage: (index: number) => void;
  stepsRef: RefObject<(HTMLElement | null)[]>;
  reduced: boolean;
}) {
  return (
    <section className="workflow-wrap" id="workflow">
      <div className="wrap">
        <header className="workflow-header reveal">
          <div className="section-label">The workflow</div>
          <h2>
            Your dataset,
            <br />
            three steps closer.
          </h2>
        </header>
        <div className="workflow-layout">
          <div className="steps">
            {workflowSteps.map((step, index) => (
              <article
                key={step.number}
                ref={(el) => {
                  stepsRef.current[index] = el;
                }}
                className={`story-step ${stage === index ? "active" : ""}`}
              >
                <span className="step-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <span className="step-detail">{step.detail}</span>
              </article>
            ))}
          </div>
          <div className="sticky-showcase">
            <div
              className="story-tabs"
              role="group"
              aria-label="Explore workflow"
            >
              {workflowSteps.map((step, index) => (
                <button
                  key={step.label}
                  className="story-tab"
                  aria-pressed={stage === index}
                  onClick={() => selectStage(index)}
                >
                  {step.label}
                </button>
              ))}
            </div>
            <div className="story-panel">
              <div className="glass-panel">
                <div className="panel-header">
                  <span className="od-row">
                    <FiTable aria-hidden="true" />
                    retail_sales.csv
                  </span>
                  <span className="badge">Sample</span>
                </div>
                <ProductDemo
                  view={workflowSteps[stage].view}
                  context
                  reduced={reduced}
                />
              </div>
            </div>
            <p className="story-note">
              Example screens. No file is uploaded and no AI service is called.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
