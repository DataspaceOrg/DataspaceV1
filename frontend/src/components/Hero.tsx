import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheck,
  FiLayers,
  FiUpload,
  FiTable,
  FiZap,
} from "react-icons/fi";
import "../styles/Hero.css";

// each section of the landing/hero is a function down below
// notes for each function line:
// Hero: line 23
// LandingNavbar: line 118
// ProductDemo: line 136
// HeroSection: line 219
// FormatStrip: line 304
// WorkflowSection: line 320
// FAQSection: line 342
// LandingFooter: line 366
export default function Hero() {
  // reuse the existing sign-in marker for CTA routing; protected pages handle access
  const destination = localStorage.getItem("dataspace_user_id")
    ? "/dashboard"
    : "/signup";
  return (
    <div className="landing-v2" id="landing-top">
      <a href="#landing-main" className="skip-link">
        Skip to content
      </a>
      <LandingNavbar />
      <main id="landing-main">
        <HeroSection destination={destination} />
        <FormatStrip />
        <WorkflowSection />
        <FAQSection />
        <LandingFooter destination={destination} />
      </main>
    </div>
  );
}

// sample content
type DemoView = "upload" | "preview" | "insight";
const demoRows = [
  ["1001", "Online", "128.00"],
  ["1002", "Retail", "86.50"],
  ["1003", "Online", "249.00"],
  ["1004", "Wholesale", "480.00"],
  ["1005", "Retail", "64.00"],
  ["1006", "Online", "172.50"],
];
const demoInsight = {
  summary: "Six orders across three sales channels.",
  points: [
    "Four fields describe each order.",
    "Revenue is numeric; channel is categorical.",
    "No empty fields in the sample.",
  ],
  context:
    "Six example orders. Identify the fields and check for missing values.",
};
const workflowSteps = [
  {
    label: "Upload",
    number: "01 / UPLOAD",
    title: "A home for your files.",
    description:
      "Add a CSV or SQLite file. Find it in your dataset library and open it to explore its tables.",
    detail: "CSV · SQLite",
  },
  {
    label: "Schema",
    number: "02 / INSPECT",
    title: "Know what’s in each column.",
    description:
      "Select a table and review its column names and types. Understand the structure before analyzing the data.",
    detail: "Tables · Columns · Types",
  },
  {
    label: "Initial insight",
    number: "03 / UNDERSTAND",
    title: "Start with an initial insight.",
    description:
      "Add context about your dataset, then run an insight to identify a useful starting point for exploration.",
    detail:
      "Available on supported datasets; .sqlite insights are currently excluded.",
  },
] satisfies {
  label: string;
  number: string;
  title: string;
  description: string;
  detail: string;
}[];
const faqItems = [
  [
    "Which files can I upload?",
    "The app accepts .csv, .db, and .sqlite datasets. Select a table to inspect its column names and types.",
  ],
  [
    "What does an initial insight do?",
    "It uses the selected table and any context you provide to generate an initial analysis. It is a starting point for exploration; review its conclusions against your data.",
  ],
  [
    "Can I run insights on every file?",
    "Initial insights are available for CSV and .db datasets. Files with the .sqlite extension support schema inspection, but initial insights are currently unavailable.",
  ],
  [
    "Is this a live analysis?",
    "This landing-page walkthrough uses sample data and illustrative output. No file is sent to a backend and no AI request is made here. Get Started opens the real application.",
  ],
];


function LandingNavbar() {
  return (
    <header className="nav-area">
      <div className="nav">
        <a className="brand" href="#landing-top" aria-label="Dataspace home">
          dataspace
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href="#workflow">How it works</a>
          <a href="#faq">Questions</a>
          <Link to="/login">Log in</Link>
        </nav>
      </div>
    </header>
  );
}


function ProductDemo({ view }: { view: DemoView }) {
  return (
    <div className="stage-host" data-view={view}>
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
      {view === "insight" && (
        <div>
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


const titles = ["Upload", "Inspect", "Insight"];
const views: DemoView[] = ["upload", "preview", "insight"];
const icons = [FiUpload, FiTable, FiZap];
function HeroSection({ destination }: { destination: string }) {
  const [stage, setStage] = useState(0);
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
        <div className="hero-demo">
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
                  aria-pressed={stage === index}
                  onClick={() => setStage(index)}
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
            <ProductDemo view={views[stage]} />
            <div className="panel-bottom">
              <span>
                0{stage + 1} / 03 · {titles[stage]}
              </span>
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

// supported file formats displayed below the Hero
function FormatStrip() {
  return (
    <div className="wrap">
      <div className="format-strip">
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


function WorkflowSection() {
  return (
    <section className="workflow-wrap" id="workflow">
      <div className="wrap">
        <div className="section-label">The workflow</div>
        <h2>Your dataset, three steps closer.</h2>
        <div className="workflow-grid">
          {workflowSteps.map((step) => (
            <article className="workflow-card" key={step.number}>
              <span className="step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <span className="step-detail">{step.detail}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


function FAQSection() {
  return (
    <section className="wrap faq" id="faq">
      <div>
        <div className="section-label">Before you start</div>
        <h2>
          A few useful
          <br />
          answers.
        </h2>
      </div>
      <div className="faq-list">
        {faqItems.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

// reuse the same CTA destination at the end of the page
function LandingFooter({ destination }: { destination: string }) {
  return (
    <div className="wrap">
      <section className="endcap">
        <h2>
          Bring a dataset.
          <br />
          Find a starting point.
        </h2>
        <Link className="btn primary" to={destination}>
          Get Started
          <FiArrowRight aria-hidden="true" />
        </Link>
      </section>
      <footer className="footer">
        <a className="brand" href="#landing-top" aria-label="Dataspace home">
          dataspace
        </a>
        <nav className="footer-links" aria-label="Footer">
          <a href="#workflow">Workflow</a>
          <a href="#faq">Questions</a>
          <Link to={destination}>Workspace</Link>
          <Link to="/login">Log in</Link>
        </nav>
      </footer>

      <div className="footer-meta">
        <span>Walkthrough uses sample data and illustrative analysis</span>
        <span>Dataspace</span>
      </div>
    </div>
  );
}
