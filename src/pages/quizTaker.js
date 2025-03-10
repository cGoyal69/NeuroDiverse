
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function QuizTaker({ chapterName, updateStatus, isQuizComplete, quizStatus ,quizQuestion}) {
    const navigate = useNavigate();

    

    const questions = quizQuestion || [];
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(null);
    const [showRetake, setShowRetake] = useState(false);

    const handleAnswerChange = (questionIndex, selectedOption) => {
        setAnswers(prevAnswers => ({
            ...prevAnswers,
            [questionIndex]: selectedOption
        }));
    };

    const handleSubmit = () => {
        let finalScore = 0;
        questions.forEach((q, index) => {
            if (answers[index] === q.correct_answer) {
                finalScore += 1;
            }
        });

        const percentageScore = (finalScore / questions.length) * 100;
        setScore(finalScore);

        if (percentageScore >= 50) {
            // If score is 50% or higher, update status and mark quiz as complete
            updateStatus(prevStatus => ({
                ...prevStatus,
                [chapterName]: {
                    ...prevStatus[chapterName],
                    quizCompleted: true,
                    score: finalScore
                }
            }));

            alert(`Quiz completed! Your score: ${finalScore} / ${questions.length}`);
            isQuizComplete(true);
            quizStatus(null);
            navigate('/adhdLearning');
        } else {
            // If score is less than 50%, show "Retake Quiz" button
            alert(`Your score is too low (${finalScore}/${questions.length}). Please retake the quiz.`);
            setShowRetake(true);
        }
    };

    const handleRetakeQuiz = () => {
        setAnswers({});
        setScore(null);
        setShowRetake(false);
    };

    return (
        <div>
            <h2>Quiz for {chapterName}</h2>
            {questions.map((q, index) => (
                <div key={index} style={{ marginBottom: "15px" }}>
                    <p><strong>{q.question}</strong></p>
                    {Object.entries(q.options).map(([key, option]) => (
                        <label key={key} style={{ display: "block", margin: "5px 0" }}>
                            <input
                                type="radio"
                                name={`question-${index}`}
                                value={key}
                                onChange={() => handleAnswerChange(index, key)}
                                checked={answers[index] === key}
                            />
                            {option}
                        </label>
                    ))}
                </div>
            ))}
            {!showRetake ? (
                <button onClick={handleSubmit} disabled={Object.keys(answers).length < questions.length}>
                    Submit Quiz
                </button>
            ) : (
                <button onClick={handleRetakeQuiz}>
                    Retake Quiz
                </button>
            )}
            {score !== null && <p>Your Score: {score} / {questions.length}</p>}
        </div>
    );
}

export default QuizTaker;








