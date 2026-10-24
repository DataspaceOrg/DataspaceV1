import { useEffect, useRef, useState, type FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiUploadCloud, FiUpload } from "react-icons/fi";
import { API_BASE, identityHeaders, errorMessage } from "../shared/http";
import { formatBytes } from "../shared/format";
import { workspaceNavigation } from "../shared/workspace";
import { Button, Feedback, Field } from "./ui";
type CloudResult = { dataset_id: string; container: string; blob_name: string };
function UploadForm({ cloud = false }: { cloud?: boolean }) {
  const [file, setFile] = useState<File | null>(null),
    [pending, setPending] = useState(false),
    [progress, setProgress] = useState(0),
    [error, setError] = useState(""),
    [result, setResult] = useState<CloudResult | null>(null);
  const busy = useRef(false),
    navigate = useNavigate();
  const requestController = useRef<AbortController | null>(null);
  useEffect(() => () => requestController.current?.abort(), []);
  const id = cloud ? "cloud-file" : "dataset-file";
  function select(file: File | null) {
    setResult(null);
    setError("");
    setFile(file);
    if (file && !file.size)
      setError("This file is empty. Choose a file that contains data.");
    else if (file && !cloud && !/\.(csv|db|sqlite)$/i.test(file.name))
      setError("Choose a CSV or SQLite file (.csv, .db, .sqlite).");
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (
      !file ||
      busy.current ||
      result ||
      !file.size ||
      (!cloud && !/\.(csv|db|sqlite)$/i.test(file.name))
    )
      return;
    busy.current = true;
    setPending(true);
    setProgress(0);
    setError("");
    const controller = new AbortController();
    requestController.current = controller;
    const body = new FormData();
    body.append("file", file);
    try {
      const response = await axios.post(
        `${API_BASE}${cloud ? "/dataset/upload" : "/db/upload_db"}`,
        body,
        {
          headers: cloud ? {} : identityHeaders(),
          signal: controller.signal,
          onUploadProgress: (event) => {
            if (event.total)
              setProgress(
                Math.min(100, Math.round((event.loaded / event.total) * 100)),
              );
          },
        },
      );
      if (controller.signal.aborted) return;
      if (cloud) setResult(response.data);
      else navigate(workspaceNavigation.library, { state: { uploaded: true } });
    } catch (failure) {
      if (!controller.signal.aborted) setError(errorMessage(failure));
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  // A failed request remains retryable; selection validation is evaluated separately.
  const invalid =
    !file || !file.size || (!cloud && !/\.(csv|db|sqlite)$/i.test(file.name));
  return (
    <form className="upload-form" onSubmit={submit}>
      <Field
        label={cloud ? "File for cloud storage" : "Dataset file"}
        htmlFor={id}
      >
        <div className="dropzone">
          {cloud ? (
            <FiUploadCloud aria-hidden="true" />
          ) : (
            <FiUpload aria-hidden="true" />
          )}
          <p>
            {cloud
              ? "Choose a file to store in Azure"
              : "Choose a CSV or SQLite file"}
          </p>
          <input
            id={id}
            type="file"
            accept={cloud ? undefined : ".csv,.db,.sqlite"}
            disabled={pending}
            aria-invalid={invalid && !!file}
            aria-describedby={`${id}-details`}
            onChange={(e) => select(e.target.files?.[0] || null)}
          />
        </div>
      </Field>
      <p id={`${id}-details`} className="muted small file-details">
        {file
          ? `${file.name} · ${formatBytes(file.size)}`
          : cloud
            ? "Stored separately from your analyzable datasets."
            : "Supported formats: .csv, .db, .sqlite"}
      </p>
      {pending && (
        <Feedback>
          <span>
            {progress < 100 ? `Uploading… ${progress}%` : "Processing…"}
          </span>
          <progress aria-label="File transfer" max={100} value={progress} />
        </Feedback>
      )}
      {error && <Feedback error>{error}</Feedback>}
      {result && (
        <Feedback>
          <strong>File uploaded to cloud storage.</strong>
          <p>This file does not appear in the dataset library.</p>
          <dl className="cloud-result">
            <dt>Container</dt>
            <dd>{result.container}</dd>
            <dt>Blob</dt>
            <dd>{result.blob_name}</dd>
            <dt>Upload ID</dt>
            <dd>{result.dataset_id}</dd>
          </dl>
        </Feedback>
      )}
      <Button
        className={cloud ? "" : "primary"}
        type="submit"
        disabled={pending || invalid || !!result}
      >
        {pending
          ? "Uploading…"
          : error && !invalid
            ? "Retry upload"
            : cloud
              ? "Upload to cloud storage"
              : "Upload dataset"}
      </Button>
    </form>
  );
}
export default function Upload() {
  return (
    <div className="view upload-view">
      <header className="page-head">
        <h1>Upload dataset</h1>
      </header>
      <section className="panel">
        <h2 className="sr-only">Dataset upload</h2>
        <UploadForm />
      </section>
      <section className="panel cloud-section">
        <h2>Cloud storage upload</h2>
        <p className="muted">
          Store a file in Azure. Cloud uploads are separate from datasets you
          can inspect and analyze.
        </p>
        <UploadForm cloud />
      </section>
    </div>
  );
}
