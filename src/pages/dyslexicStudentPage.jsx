import React, { useState } from "react";
import axios from "axios";
import { FaCloudUploadAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import "../styles/dyslexia.css";

const backendUrl = "http://192.168.149.239:5001";

function PdfToSummariser() {
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [output, setOutput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  
    const [file, setFile] = useState(null);
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

  const uploadFile = async (file) => {
    if (!file) {
      alert("Please upload a PDF file first");
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${backendUrl}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.fileName) {
        setUploadedFileName(response.data.fileName);
        return response.data.fileName;
      } else {
        alert("File uploaded but no file name received!");
        return null;
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file.");
      return null;
    }
  };

  // ✅ Convert PDF: Receives a Blob and allows downloading
  const handlePdfConversion = async () => {
    if (!uploadedFileName) return;
    try {
      
      // Fetching Blob response
      setLoading(true);
      const response = await axios.post(`${backendUrl}/generate-pdf`, {}, {
        responseType: "blob", // Expecting binary data
      });
  
      // Ensure we receive a valid Blob
      if (!response.data || response.data.size === 0) {
        throw new Error("Received empty PDF file.");
      }
  
      // Convert Blob to downloadable URL
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(pdfBlob);
  
      setOutput(
        <a href={blobUrl} download="dyslexic_friendly.pdf" className="link">
          Click to download PDF
        </a>
      );
      setLoading(false)
  
    } catch (error) {
      console.error("Error converting to PDF:", error);
      alert("Failed to convert to PDF!");
    }
  };

  // ✅ Convert Audio: Receives a Blob and plays it
  const handleAudioConversion = async () => {
    if (!uploadedFileName) {
      alert("No file selected!");
      return;
    }
  
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/text_to_speech?file_name=${uploadedFileName}`, {
        responseType: "blob", // Ensure correct response format
      });
  
      if (!response.data || response.data.size === 0) {
        throw new Error("Received an empty audio file.");
      }
  
      // Convert Blob to URL for playback
      const audioBlob = new Blob([response.data], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);
  
      setOutput(
        <audio controls>
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      );
      setLoading(false);
    } catch (error) {
      console.error("Error converting to audio:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleSummarization = async () => {
    try {
      setLoading(true);
      const response = await axios.post("http://192.168.149.239:5001/summarize");
      setSummary(response.data.summary);
      // console.log(summary)
      setOutput(<textarea className="output-textarea auto-expand" readOnly value={summary} />);
      setError("");
    } catch (err) {
      console.error("Summarization error:", err);
      setError("Error summarizing the text.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setUploadedFileName(null); // Reset previous upload
      await uploadFile(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setUploadedFileName(null);
      await uploadFile(file);
    } else {
      alert("Please drop a valid PDF file.");
    }
    setIsDragging(false);
  };

  return (
    <div className="container">
      <h2 className="title">PDF Summarizer</h2>
      <div className="upload-section">
        <label className="label">Upload PDF:</label>
        <div
          className={`drop-area ${isDragging ? "drag-active" : ""} flex justify-center flex-col items-center`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => document.getElementById("fileInput").click()}
        >
          <input
            id="fileInput"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden-input"
          />
          <FaCloudUploadAlt size={50} className="upload-icon" />
          <p className="drop-text">
            Drag & Drop your PDF here or <span className="highlight">click to select</span>
          </p>
        </div>
        {pdfFile && <p className="selected-file">Selected File: {pdfFile.name}</p>}
      </div>
      <div className="button-group">
        <button onClick={handlePdfConversion} className="convert-btn">Convert to PDF</button>
        <button onClick={handleAudioConversion} className="convert-btn">Convert to Audio</button>
        <button onClick={handleSummarization} className="convert-btn">Summarize</button>
      </div>
      {loading ? (
          <div className="flex justify-center items-center gap-2 h-16">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-4 h-12 bg-blue-500 rounded"
              animate={{ y: [-10, 10, -10] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
        ) : (
          output && (
            <div className="output-section">
              <h3 className="output-title">Output:</h3>
              <div className="text-blue-700 underline">{output}</div>
            </div>
          )
        )}
    </div>
  );
}

export default PdfToSummariser;
