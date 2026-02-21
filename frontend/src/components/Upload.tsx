import { type ChangeEvent, useState } from 'react'
import axios from 'axios';

type UploadStatus = "idle" | "uploading" | "success" | "error";

function Upload() {

    // Either going to be a file, or it will be null, no file. 
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<UploadStatus>("idle")
    const [pct, setUploadProgress] = useState(0);


    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
      // Get the first file, when we select file.
      if (e.target.files) {
        setFile(e.target.files[0]);
      }
    }

    async function handleFileUpload() {
      // No file detected
      if (!file) return;
      // We are actually uploading the file now. 
      setStatus("uploading");

      // Now convert it to form data as we are going to be sending it to the backend server
      // Need to add authentification token here.
      const formData = new FormData();
      formData.append("file", file); 
      // axios.post(url, data, config) formData is our request body.
      try {
        const response = await axios.post("http://localhost:8000/db/upload_db", formData, {
          onUploadProgress: (e) => {
            if (e.total) {
              const set_pct = Math.round((e.loaded / e.total) * 100);
              setUploadProgress(set_pct); // e.g. 0–100
            }
          },
        });

        console.log(response.data);
        setStatus("success");
      
      } catch(e) {
        setStatus("error");
      };
    }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Upload File</h1>
      <input className="mb-4 w-full text-lg" type="file" onChange={handleFileChange} />
      {file && (
        <div className="mb-4 text-sm">
          <p className="text-gray-500 text-lg">File Name: {file.name}</p>
          <p className="text-gray-500 text-lg">File Type: {file.type}</p>
          <p className="text-gray-500 text-lg">File Size: {file.size}</p>
        </div>
      )}
      {/* Dont want to render button if we are already uploading. */}
      {file && status !== "uploading" && <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={handleFileUpload}>Upload</button>}
      {status === "success" && <p className="text-green-500">File uploaded successfully</p>}
      {status === "error" && <p className="text-red-500">File upload failed</p>}
      {status === "uploading" && <p className="text-yellow-500">Uploading... {pct}%</p>}
    </div>
    
  )
}

export default Upload;