import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { FiArrowRight, FiPlus, FiSearch } from "react-icons/fi";
import { fetchDatasets, type Dataset } from "../shared/api";
import { datasetLabel, formatBytes, formatType } from "../shared/format";
import { errorMessage } from "../shared/http";
import { workspaceNavigation } from "../shared/workspace";
import { Button, Feedback } from "./ui";
export default function Dashboard() {
  const [datasets, setDatasets] = useState<Dataset[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0);
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const query = params.get("q") || "",
    type = params.get("type") || "all";
  useEffect(() => {
    workspaceNavigation.library = location.pathname + location.search;
  }, [location.pathname, location.search]);
  useEffect(() => {
    let active = true;
    fetchDatasets()
      .then((data) => {
        if (active) setDatasets(data);
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
  }, [attempt]);
  function retry() {
    setLoading(true);
    setError("");
    setAttempt((value) => value + 1);
  }
  function filter(key: string, value: string) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value && value !== "all") next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  }
  const matches = datasets.filter(
    (d) =>
      (type === "all" || formatType(d.upload_type) === type) &&
      [datasetLabel(d.dataset_id), d.dataset_id, ...d.tables]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <div className="view">
      <header className="page-head">
        <h1>Datasets</h1>
        <Link className="button primary" to="/upload">
          <FiPlus aria-hidden="true" />
          Upload dataset
        </Link>
      </header>
      {location.state?.uploaded && (
        <Feedback>Dataset uploaded successfully.</Feedback>
      )}
      <div className="tools">
        <label className="search">
          <FiSearch aria-hidden="true" />
          <span className="sr-only">Search datasets</span>
          <input
            type="search"
            placeholder="Search datasets"
            value={query}
            onChange={(e) => filter("q", e.target.value)}
          />
        </label>
        <label>
          <span className="sr-only">Filter by file type</span>
          <select value={type} onChange={(e) => filter("type", e.target.value)}>
            <option value="all">All types</option>
            <option value="CSV">CSV</option>
            <option value="SQLite">SQLite</option>
          </select>
        </label>
      </div>
      {loading ? (
        <Feedback>Loading datasets…</Feedback>
      ) : error ? (
        <Feedback error>
          {error} <Button onClick={retry}>Retry</Button>
        </Feedback>
      ) : !datasets.length ? (
        <section className="empty panel">
          <h2>No datasets yet</h2>
          <p>Upload a CSV or SQLite file to get started.</p>
          <Link className="button primary" to="/upload">
            Upload dataset
          </Link>
        </section>
      ) : !matches.length ? (
        <section className="empty panel">
          <h2>No matching datasets</h2>
          <p>Try a different name or file type.</p>
          <Button onClick={() => setParams({})}>Clear filters</Button>
        </section>
      ) : (
        <section className="dataset-list" aria-label="Dataset library">
          <div className="list-header" aria-hidden="true">
            <span>Name</span>
            <span>Format</span>
            <span>Tables</span>
            <span>Size</span>
            <span />
          </div>
          {matches.map((d) => (
            <Link
              className="dataset-row"
              key={d.dataset_id}
              to={`/dataset/${encodeURIComponent(d.dataset_id)}`}
            >
              <span className="dataset-identity">
                <span className="file-icon">
                  {d.upload_type === "csv" ? "CSV" : "SQL"}
                </span>
                <span className="dataset-name">
                  {datasetLabel(d.dataset_id)}
                  <span className="muted small table-names">
                    {d.tables.join(", ") || "No tables"}
                  </span>
                </span>
              </span>
              <span className="tag">{formatType(d.upload_type)}</span>
              <span
                className="row-count"
                aria-label={`${d.tables.length} tables`}
              >
                {d.tables.length}
                <span className="mobile-only"> tables</span>
              </span>
              <span className="muted small">
                {formatBytes(d.raw_byte_size)}
              </span>
              <FiArrowRight aria-hidden="true" />
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
