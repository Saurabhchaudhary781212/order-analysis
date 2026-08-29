import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUploadCloud,
  FiFile,
  FiCheckCircle,
} from "react-icons/fi";
import "./FileUpload.css";

const FileUpload = () => {
   const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const allowedExtensions = ["json", "csv", "xml"];

  const addFiles = (selectedFiles) => {
    const newFiles = Array.from(selectedFiles);

    const validFiles = newFiles.filter((file) => {
      const extension = file.name
        .split(".")
        .pop()
        .toLowerCase();

      return allowedExtensions.includes(extension);
    });

    if (validFiles.length !== newFiles.length) {
      alert("Only JSON, CSV and XML files are allowed.");
    }

    setFiles((previousFiles) => {
      const combined = [...previousFiles, ...validFiles];

      // Remove duplicate files automatically
      return combined.filter(
        (file, index, self) =>
          index ===
          self.findIndex(
            (item) =>
              item.name === file.name &&
              item.size === file.size
          )
      );
    });
  };

  const handleFileChange = (e) => {
    addFiles(e.target.files);

    // Allows selecting the same file again
    e.target.value = "";
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("Please select at least one file.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze`, {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      console.log("Backend response:", data);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Analysis failed"
        );
      }

      // Save complete backend response
      sessionStorage.setItem(
        "analysisResult",
        JSON.stringify(data)
      );

      // Save dashboard dataset
      sessionStorage.setItem(
        "dataset",
        JSON.stringify({
          files: data.results || [],

          combined_data:
            data.combined_data || {
              rows: [],
              columns: [],
            },

          summary: data.summary || {},

          analysis_results:
            data.results || [],
        })
      );

      // Go to dashboard
    navigate("/dashboard");
    } catch (error) {
      console.error("Upload error:", error);

      alert(
        error.message ||
          "Unable to connect to backend."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-container">

        {/* HEADER */}
        <div className="upload-header">
          <div className="header-icon">
            <FiUploadCloud />
          </div>

          <h1>Analyze Your Data</h1>

          <p>
            Upload JSON, CSV, or XML files
            and analyze your data
          </p>
        </div>

        {/* FILE SELECTOR */}
        <div className="drop-zone">

          <div className="upload-icon">
            <FiUploadCloud />
          </div>

          <h2>Select your files</h2>

          <p>
            Choose one or more files from
            your computer
          </p>

          <label className="choose-btn">
            Choose Files

            <input
              type="file"
              multiple
              accept=".json,.csv,.xml"
              onChange={handleFileChange}
              hidden
            />
          </label>

          <span className="file-types">
            Supported: JSON, CSV, XML
          </span>
        </div>

        {/* SELECTED FILES */}
        {files.length > 0 && (
          <div className="files-section">

            <div className="files-header">
              <h3>
                Selected Files ({files.length})
              </h3>
            </div>

            <div className="files-list">
              {files.map((file, index) => (
                <div
                  className="selected-file"
                  key={`${file.name}-${file.size}-${index}`}
                >

                  <div className="file-left">

                    <div className="file-icon">
                      <FiFile />
                    </div>

                    <div className="file-info">
                      <h4>{file.name}</h4>

                      <p>
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>

                  </div>

                  <div className="file-actions">
                    <FiCheckCircle className="success-icon" />
                  </div>
                  

                </div>
              ))}
            </div>

          </div>
        )}

        {/* UPLOAD BUTTON */}
        <button
          className="upload-btn"
          onClick={handleUpload}
          disabled={
            files.length === 0 || uploading
          }
        >
          <FiUploadCloud />

          {uploading
            ? "Analyzing..."
            : `Upload & Analyze ${
                files.length > 0
                  ? `(${files.length})`
                  : ""
              }`}
        </button>

      </div>
    </div>
  );
};

export default FileUpload;