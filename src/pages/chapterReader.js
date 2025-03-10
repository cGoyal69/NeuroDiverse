import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function ChapterReader({ isChapterComplete, chapterName, updateStatus, chapterStatus, chapterText}) {
    const [showCompleteButton, setShowCompleteButton] = useState(false);
    const navigate=useNavigate();
    const contentRef = useRef(null);

   

    // Mark chapter as complete
    function markChapterComplete() {
        updateStatus(prevStatus => ({
            ...prevStatus,
            [chapterName]: { ...prevStatus[chapterName], chapterCompleted: true }
        }));

        isChapterComplete(true); // Notify parent that chapter is complete
        chapterStatus(null); // Reset to show list
        navigate('/adhdLearning');
    }

    return (
        <div style={{ height: "auto", overflowY: "scroll", border: "1px solid gray", padding: "20px" }} ref={contentRef}>
            <h2>{chapterName}</h2>
            <p>
                {/* Simulating long content */}
                {chapterText}
                {/* Repeat the paragraph multiple times */}
            </p>
            <p style={{ height:"auto"}}> {/* Simulated long scroll content */} </p>

            
                <button onClick={markChapterComplete} style={{ marginTop: "10px", padding: "10px", cursor: "pointer" }}>
                    ✅ Mark Chapter as Complete
                </button>
            
        </div>
    );
}

export default ChapterReader;
