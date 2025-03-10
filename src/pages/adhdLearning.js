import { useState, useEffect } from "react";
import ChapterReader from "./chapterReader.js";
import QuizTaker from "./quizTaker.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./style.css";

function AdhdLearningTool() {
    const [chapterStatus, setChapterStatus] = useState({});
    const [output, setOutput] = useState([]);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [quizComplete, setQuizComplete] = useState(false);
    const [activeChapter, setActiveChapter] = useState(null);
    const [chapterComplete, setChapterComplete] = useState(false);
    const [chapterFlag, setChapterFlag] = useState(true);
    const [quizFlag, setQuizFlag] = useState(true);
    const [chapterText, setChapterText] = useState(null);
    const [loading, setLoading] = useState(false);  // Added loading state

    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true); // Start loading
        axios
            .post("http://192.168.149.239:5001/generate-story")
            .then((res) => {
                if (res.data) {
                    const newOutput = res.data.story.map((chapter) => ({
                        title: chapter.title,
                        text: chapter.text,
                    }));

                    setOutput(newOutput);

                    const newChapterStatus = res.data.story.reduce((acc, chapter) => {
                        acc[chapter.title] = {
                            chapterCompleted: false,
                            quizCompleted: false,
                            score: 0,
                            question: chapter.questions,
                        };
                        return acc;
                    }, {});

                    setChapterStatus(newChapterStatus);
                }
            })
            .catch((err) => console.log(err))
            .finally(() => setLoading(false)); // Stop loading
    }, []);

    function handleAnotherSubmission() {
        navigate("/adhdInput");
    }

    function handleChapterClick(index) {
        if (loading) return; // Prevent clicking when loading

        for (let i = 0; i < index; i++) {
            if (!chapterStatus[output[i].title].chapterCompleted) {
                setChapterFlag(false);
                alert("To open this chapter first, complete previous chapter along with their quiz.");
                return;
            } else {
                if (!chapterStatus[output[i].title].quizCompleted) {
                    alert(`To open this chapter first, complete previous quiz of chapter number ${index + 1}.`);
                    setChapterFlag(false);
                    return;
                }
            }
        }

        if (chapterFlag) {
            setActiveChapter(output[index].title);
            setChapterText(output[index].text);
        } else setChapterFlag(true);
    }

    function handleQuizComplete(index) {
        if (loading) return; // Prevent clicking when loading

        if (index === 0) {
            if (!chapterStatus[output[index].title].chapterCompleted) {
                setQuizFlag(false);
                alert("To open this quiz first, study the chapter completely.");
                return;
            } else {
                setActiveQuiz(output[index].title);
            }
        } else {
            for (let i = 0; i < index; i++) {
                if (!chapterStatus[output[i].title].chapterCompleted) {
                    setQuizFlag(false);
                    alert("To open this quiz first, study the chapter completely.");
                    return;
                } else {
                    if (!chapterStatus[output[i].title].quizCompleted) {
                        setQuizFlag(false);
                        alert("To open this quiz first, complete the previous quiz.");
                        return;
                    }
                }
            }
            if (quizFlag) {
                setActiveQuiz(output[index].title);
            } else setQuizFlag(true);
        }
    }

    const showList = () => {
        if (loading) {
            return <div style={{ textAlign: "center", fontSize: "18px", margin: "20px" }}>⏳ Loading chapters...</div>;
        }

        return (
            <div className="adhdLearningMainTag">
                <div style={{ margin: "20px" }} className="adhdLearning">
                    <h4>SubChapters for you:</h4>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#ddd", height: "40px" }}>
                                <th style={{ border: "1px solid black", padding: "10px" }}>No</th>
                                <th style={{ border: "1px solid black", padding: "10px" }}>Name</th>
                                <th style={{ border: "1px solid black", padding: "10px" }}>Chapter Read</th>
                                <th style={{ border: "1px solid black", padding: "10px" }}>Quiz</th>
                                <th style={{ border: "1px solid black", padding: "10px" }}>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {output.map((item, index) => (
                                <tr key={index} style={{ height: "40px" }}>
                                    <td style={{ border: "1px solid black", padding: "10px" }}>{index + 1}</td>
                                    <td
                                        style={{
                                            border: "1px solid black",
                                            padding: "10px",
                                            cursor: "pointer",
                                            color: "blue",
                                            opacity: loading ? 0.5 : 1,
                                        }}
                                        onClick={() => handleChapterClick(index)}
                                    >
                                        {item.title}
                                    </td>
                                    <td style={{ border: "1px solid black", padding: "10px" }}>
                                        {chapterStatus[item.title]?.chapterCompleted ? "✅ Completed" : "⏳ In Progress"}
                                    </td>
                                    <td style={{ border: "1px solid black", padding: "10px" }}>
                                        <button
                                            onClick={() => handleQuizComplete(index)}
                                            disabled={loading}
                                            style={{
                                                cursor: chapterStatus[item.title]?.chapterCompleted ? "pointer" : "not-allowed",
                                                opacity: chapterStatus[item.title]?.chapterCompleted ? 1 : 0.5,
                                            }}
                                        >
                                            {chapterStatus[item.title]?.chapterCompleted ? "Take Quiz" : "🔒 Locked"}
                                        </button>
                                    </td>
                                    <td style={{ border: "1px solid black", padding: "10px" }}>
                                        {chapterStatus[item.title]?.quizCompleted
                                            ? `${chapterStatus[item.title]?.score}`
                                            : "❌ Not Attempted"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button onClick={handleAnotherSubmission} id="adhdlearningButton" disabled={loading}>
                    {loading ? "⏳ Uploading..." : "Upload Another Chapter"}
                </button>
            </div>
        );
    };

    return (
        <div>
            {!activeChapter && !activeQuiz && showList()}

            {activeChapter && !activeQuiz && (
                <ChapterReader
                    isChapterComplete={setChapterComplete}
                    chapterName={activeChapter}
                    updateStatus={setChapterStatus}
                    chapterStatus={setActiveChapter}
                    chapterText={chapterText}
                />
            )}

            {activeQuiz && !activeChapter && !quizComplete && (
                <QuizTaker isQuizComplete={setQuizComplete} chapterName={activeQuiz} updateStatus={setChapterStatus} quizStatus={setActiveQuiz} quizQuestion={chapterStatus[activeQuiz].question} />
            )}
        </div>
    );
}

export default AdhdLearningTool;