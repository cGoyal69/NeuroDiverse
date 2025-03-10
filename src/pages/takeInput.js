import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import './style.css';

function UserInput() {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");
    const [state, setState] = useState(""); // Added missing state
    const [isDragging, setIsDragging] = useState(false);
    
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === "application/pdf") {
            setFile(selectedFile);
        } else {
            alert("Please upload a valid PDF file.");
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage("No file selected.");
            return;
        }

        setState("upload");
        setMessage("Uploading file...");

        const formData = new FormData();
        formData.append("file", file); // ✅ Ensure backend receives "file"

        console.log("Uploading file:", file.name);

        try {
            const response = await axios.post("http://192.168.149.239:5001/upload", formData);
            console.log("Server Response:", response.data);

            setState("success");
            setMessage("File uploaded successfully!");
            navigate("/adhdLearning"); // Redirect to ADHD Learning Module

        } catch (error) {
            console.error("Upload error:", error);
            setState("error");
            setMessage("Error uploading file.");
        }
    };

    return (
        <div className="upload-section">
            <label className="label">Upload PDF:</label>
            <div
                className={`drop-area ${isDragging ? "drag-active" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files.length > 0) {
                        setFile(e.dataTransfer.files[0]);
                    }
                }}
                onClick={() => document.getElementById("fileInput").click()}
            >
                <input
                    id="fileInput"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden-input"
                />
                <p className="drop-text">Drag & Drop your PDF here or <span className="highlight">click to select</span></p>
            </div>
            {file && <p className="selected-file">Selected File: {file.name}</p>}
            
            <button onClick={handleUpload} className="upload-btn">Upload</button>
            {message && <p className="upload-message">{message}</p>}
        </div>
    );
}

export default UserInput;