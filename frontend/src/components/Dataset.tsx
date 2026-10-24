import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiTable } from "react-icons/fi";
import { fetchDatasetById, type Dataset as DatasetModel } from "../shared/api";
import { datasetLabel, formatBytes, formatType } from "../shared/format";
import { errorMessage } from "../shared/http";
import {
  workspaceNavigation,
  useTableState,
  restoreAnalysis,
  runAnalysis,
  setContext,
} from "../shared/workspace";
import { Button, Feedback, Field, SchemaTable } from "./ui";
function Analysis({
  id,
  table,
  supported,
}: {
  id: string;
  table: string;
  supported: boolean;
}) {
  const state = useTableState(id, table);
  useEffect(() => {
    void restoreAnalysis(id, table);
  }, [id, table]);
  return (
    <section className="panel" aria-labelledby="analysis-title">
      <h2 id="analysis-title">Analysis</h2>
      <p className="muted section-description">
        Run an initial insight for <strong>{table}</strong>.
      </p>
      {state.restoring && <Feedback>Restoring saved analysis…</Feedback>}
      {state.restoreError && (
        <Feedback error>
          {state.restoreError}{" "}
          <Button
            disabled={state.pending}
            onClick={() => void restoreAnalysis(id, table, true)}
          >
            Retry restoration
          </Button>
        </Feedback>
      )}
      <Field label="Additional context (optional)" htmlFor="table-context">
        <textarea
          id="table-context"
          value={state.context}
          disabled={state.pending}
          placeholder="Describe the fields, units, or questions you want to explore."
          onChange={(e) => setContext(id, table, e.target.value)}
        />
      </Field>
      {!supported && (
        <p className="muted small">
          Initial insight is unavailable for .sqlite files with the current
          backend. Schema inspection is available.
        </p>
      )}
      <Button
        className="primary"
        disabled={!supported || state.pending || state.restoring}
        onClick={() => void runAnalysis(id, table)}
      >
        {state.pending
          ? "Running initial insight…"
          : state.runError
            ? "Retry initial insight"
            : state.result
              ? "Run initial insight again"
              : "Run initial insight"}
      </Button>
      {state.pending && <Feedback>Analyzing {table}…</Feedback>}
      {state.runError && <Feedback error>{state.runError}</Feedback>}
      {state.result !== null && (
        <div className="analysis-result">
          <h3>Initial insight complete</h3>
          <div className="result-text">{state.result}</div>
        </div>
      )}
    </section>
  );
}
function DatasetView({ id }: { id: string }) {
  const [dataset, setDataset] = useState<DatasetModel | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [attempt, setAttempt] = useState(0);
  const [params, setParams] = useSearchParams();
  useEffect(() => {
    let active = true;
    fetchDatasetById(id)
      .then((data) => {
        if (active) setDataset(data);
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, attempt]);
  const requested = params.get("table");
  const selected =
    requested && dataset?.tables.includes(requested)
      ? requested
      : dataset?.tables[0];
  return (
    <div className="view">
      <Link className="back-link" to={workspaceNavigation.library}>
        <FiArrowLeft aria-hidden="true" />
        Datasets
      </Link>
      {loading ? (
        <Feedback>Loading dataset…</Feedback>
      ) : error ? (
        <Feedback error>
          {error}{" "}
          <Button
            onClick={() => {
              setLoading(true);
              setError("");
              setAttempt((n) => n + 1);
            }}
          >
            Retry
          </Button>
        </Feedback>
      ) : (
        dataset && (
          <>
            <header className="detail-head">
              <h1>{datasetLabel(id)}</h1>
              <p className="muted dataset-id">{id}</p>
              <div className="detail-meta">
                <span>{formatType(dataset.upload_type)}</span>
                <span>{formatBytes(dataset.raw_byte_size)}</span>
                <span>{dataset.tables.length} tables</span>
              </div>
            </header>
            {!selected ? (
              <section className="panel empty">
                <h2>No tables available</h2>
                <p>This dataset has no tables to inspect or analyze.</p>
              </section>
            ) : (
              <div className="workspace">
                <nav className="table-nav" aria-label="Dataset tables">
                  <h2>Tables</h2>
                  {dataset.tables.map((table) => (
                    <button
                      key={table}
                      className={`table-choice ${selected === table ? "selected" : ""}`}
                      aria-current={selected === table ? "true" : undefined}
                      onClick={() =>
                        setParams((previous) => {
                          const next = new URLSearchParams(previous);
                          next.set("table", table);
                          return next;
                        })
                      }
                    >
                      <FiTable aria-hidden="true" />
                      <span>{table}</span>
                    </button>
                  ))}
                </nav>
                <div className="workspace-main">
                  <section className="panel">
                    <div className="panel-heading">
                      <h2>{selected}</h2>
                      <span className="tag">Schema</span>
                    </div>
                    <SchemaTable schema={dataset.schema[selected] || {}} />
                  </section>
                  <Analysis
                    key={JSON.stringify([id, selected])}
                    id={id}
                    table={selected}
                    supported={
                      dataset.upload_type === "csv" ||
                      dataset.upload_type === "db"
                    }
                  />
                </div>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}
export default function Dataset() {
  const { dataset_id } = useParams();
  return dataset_id ? (
    <DatasetView key={dataset_id} id={dataset_id} />
  ) : (
    <Feedback error>Dataset ID is required.</Feedback>
  );
}
