import { type ChangeEvent, useState } from "react";
import axios from "axios";
import "../styles/Upload.css";

type UploadStatus = "idle" | "uploading" | "success" | "error";

function Upload() {
  // Either going to be a file, or it will be null, no file.
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [pct, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    // Get the first file, when we select file.
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  }

  async function handleFileDatasetUpload() {
    if (!file || status === "uploading") return;

    const userId = localStorage.getItem("dataspace_user_id");
    if (!userId) {
      setErrorMessage("Log in to upload a dataset.");
      setStatus("error");
      return;
    }

    setStatus("uploading");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:8000/dataset/upload",
        formData,
        {
          headers: { "x-user-id": userId },
          onUploadProgress: (event) => {
            if (event.total) {
              setUploadProgress(Math.round((event.loaded / event.total) * 100));
            }
          },
        },
      );

      console.log("Uploaded dataset:", response.data);
      setStatus("success");
    } catch (error) {
      const detail = axios.isAxiosError(error) ? error.response?.data?.detail : null;
      setErrorMessage(typeof detail === "string" ? detail : "File upload failed.");
      setStatus("error");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Upload dataset</h1>
      <input
        className="upload-file-input"
        aria-label="Choose a file for dataset upload"
        type="file"
        onChange={handleFileChange}
      />
      {file && (
        <div className="mb-4 text-sm">
          <p className="text-gray-500 text-lg">File Name: {file.name}</p>
          <p className="text-gray-500 text-lg">File Type: {file.type}</p>
          <p className="text-gray-500 text-lg">File Size: {file.size}</p>
        </div>
      )}
      {status === "success" && (
        <p className="text-green-500">File uploaded successfully</p>
      )}
      {status === "error" && <p className="text-red-500" role="alert">{errorMessage}</p>}
      {status === "uploading" && (
        <p className="text-yellow-500">Uploading... {pct}%</p>
      )}
      <button
        onClick={handleFileDatasetUpload}
        disabled={!file || status === "uploading"}
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Upload dataset
      </button>
    </div>
  );
}

export default Upload;
