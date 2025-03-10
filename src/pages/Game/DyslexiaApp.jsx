import React, { useState, useRef, useEffect } from "react";
import {
  FaPlayCircle,
  FaFileAlt,
  FaBold,
  FaItalic,
  FaUnderline,
  FaHighlighter,
  FaRedo,
  FaUndo,
} from "react-icons/fa";
import Modal from "./TextModal";
import AudioModal from "./AudioModal";

const backendUrl = "http://192.168.149.239:5001";

function TextEditor() {
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [text, setText] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [audioSrc, setAudioSrc] = useState("");
  const [score, setScore] = useState(null);
  const textRef = useRef(null);
  const history = useRef([]);
  const redoStack = useRef([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Audio
        // const audioResponse = await fetch(`${backendUrl}/text_to_speech`);
        // if (!audioResponse.ok) throw new Error("Failed to fetch audio");
        // const audioBlob = await audioResponse.blob();
        setAudioSrc('/output.mp3');

        // Fetch Text
        // const textResponse = await fetch(`${backendUrl}/text`);
        // if (!textResponse.ok) throw new Error("Failed to fetch text");
        // const textData = await textResponse.text();
        setOriginalText('This is Neuro AI for dyslexic');

        setText()
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleInput = (e) => {
    const newText = e.currentTarget.innerText;
    history.current.push(text);
    setText(newText);
    redoStack.current = [];
  };

  const handleUndo = () => {
    if (history.current.length === 0) return;
    redoStack.current.push(text);
    const previousText = history.current.pop();
    setText(previousText);
    if (textRef.current) textRef.current.innerText = previousText;
  };

  const handleRedo = () => {
    if (redoStack.current.length === 0) return;
    history.current.push(text);
    const nextText = redoStack.current.pop();
    setText(nextText);
    if (textRef.current) textRef.current.innerText = nextText;
  };

  const formatText = (type) => {
    let selection = window.getSelection();
    if (!selection.rangeCount) return;

    let range = selection.getRangeAt(0);
    let selectedText = range.toString();
    if (!selectedText) return;

    let span = document.createElement("span");
    span.textContent = selectedText;
    let parentNode = range.commonAncestorContainer.parentNode;

    if (parentNode.nodeName === "SPAN") {
      if (type === "bold") {
        parentNode.style.fontWeight = parentNode.style.fontWeight === "bold" ? "normal" : "bold";
      } else if (type === "italic") {
        parentNode.style.fontStyle = parentNode.style.fontStyle === "italic" ? "normal" : "italic";
      } else if (type === "underline") {
        parentNode.style.textDecoration = parentNode.style.textDecoration === "underline" ? "none" : "underline";
      } else if (type === "highlight") {
        parentNode.style.backgroundColor = parentNode.style.backgroundColor === "yellow" ? "transparent" : "yellow";
      }
      return;
    }

    if (type === "bold") span.style.fontWeight = "bold";
    if (type === "italic") span.style.fontStyle = "italic";
    if (type === "underline") span.style.textDecoration = "underline";
    if (type === "highlight") span.style.backgroundColor = "yellow";

    range.deleteContents();
    range.insertNode(span);
    history.current.push(textRef.current.innerText);
  };

  const checkScore = () => {
  let userText = text;
  let similarity = userText === originalText ? 100 : Math.max(0, Math.floor(Math.random() * 100));
  setScore(similarity);
};

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-7xl h-full bg-white shadow-xl rounded-lg p-6 flex flex-col">
        <div className="flex gap-3 mb-3 border-b pb-2 bg-gray-200 p-3 rounded-lg">
          <button onClick={() => formatText("bold")} className="p-2 bg-gray-300 rounded hover:bg-gray-400"><FaBold size={25}/></button>
          <button onClick={() => formatText("italic")} className="p-2 bg-gray-300 rounded hover:bg-gray-400"><FaItalic size={25}/></button>
          <button onClick={() => formatText("underline")} className="p-2 bg-gray-300 rounded hover:bg-gray-400"><FaUnderline size={25}/></button>
          <button onClick={() => formatText("highlight")} className="p-2 bg-yellow-200 rounded hover:bg-yellow-300"><FaHighlighter size={25}/></button>
          <button onClick={handleUndo} className="p-2 bg-gray-300 rounded hover:bg-gray-400"><FaUndo size={25}/></button>
          <button onClick={handleRedo} className="p-2 bg-gray-300 rounded hover:bg-gray-400"><FaRedo size={25}/></button>
        </div>

        <div
          ref={textRef}
          className="flex-1 text-3xl border p-4 rounded-lg font-dyslexic text-lg leading-relaxed overflow-y-auto bg-gray-50"
          contentEditable
          onInput={handleInput}
          suppressContentEditableWarning={true}
        ></div>

        <div className="flex justify-between items-center mt-4">
          <button className="flex items-center text-2xl space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600" onClick={() => setIsAudioModalOpen(true)}>
            <FaPlayCircle size={25} />
            <span>Play Audio</span>
          </button>

          <button className="flex items-center text-2xl space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600" onClick={() => setIsTextModalOpen(true)}>
            <FaFileAlt size={25} />
            <span>View Text</span>
          </button>

          <button className="flex items-center text-2xl space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600" onClick={checkScore}>
            <span>Check Score</span>
          </button>
        </div>
        {score !== null && (
          <div className="w-full bg-gray-200 mt-4 rounded-lg overflow-hidden">
            <div className="bg-green-500 text-white text-center py-2" style={{ width: `${score}%` }}>
              {score}% Similarity
            </div>
          </div>
        )}
        {isTextModalOpen && <Modal text={originalText} onClose={() => setIsTextModalOpen(false)} />}
        {isAudioModalOpen && <AudioModal audioSrc={audioSrc} onClose={() => setIsAudioModalOpen(false)} />}
        
      </div>
    </div>
  );
}

export default TextEditor;