import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetLectureQuizQuery } from "@/features/api/courseApi";
import { toast } from "sonner";
import { X } from "lucide-react";

const LectureQuiz = () => {
  const { courseId, lectureId } = useParams();
  const { data, isLoading, isError } = useGetLectureQuizQuery({ courseId, lectureId });

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);

  if (isLoading) return <p className="text-center mt-10">Loading quiz...</p>;

  if (isError) {
    toast.error("Failed to load quiz.");
    return <p className="text-center mt-10 text-red-600">Failed to load quiz.</p>;
  }

  const quiz = data?.quiz?.questions || [];

  if (!quiz.length)
    return <p className="text-center mt-10">No quiz available for this lecture.</p>;

  const handleSelectOption = (questionIndex, option) => {
    if (selectedAnswers[questionIndex] !== undefined) return; // prevent change

    setSelectedAnswers((prev) => {
      const newAnswers = { ...prev, [questionIndex]: option };

      // If all questions answered, calculate score
      if (Object.keys(newAnswers).length === quiz.length) {
        let correctCount = 0;
        quiz.forEach((q, idx) => {
          if (newAnswers[idx] === q.correctAnswer) correctCount += 1;
        });
        setScore(correctCount);
        setShowScoreModal(true); // Show modal when all questions are answered
      }

      return newAnswers;
    });
  };

  const percentage = score !== null ? Math.round((score / quiz.length) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto mt-6 p-4">
      <h2 className="text-2xl font-semibold mb-4">Lecture Quiz</h2>

      {quiz.map((q, index) => {
        const userAnswer = selectedAnswers[index];
        const hasAnswered = userAnswer !== undefined;

        return (
          <Card key={index} className="mb-4">
            <CardContent className="pt-6">
              <CardTitle className="text-lg font-medium mb-3">
                {index + 1}. {q.question}
              </CardTitle>

              <ul className="space-y-2">
                {q.options.map((opt, i) => {
                  const isSelected = userAnswer === opt;
                  const isCorrectOption = opt === q.correctAnswer;

                  let optionClasses = "cursor-pointer p-3 rounded-md border-2 transition-all ";

                  if (hasAnswered) {
                    if (isCorrectOption) {
                      optionClasses +=
                        "bg-green-50 border-green-500 text-green-900 dark:bg-green-900 dark:border-green-400 dark:text-green-100";
                    } else if (isSelected && !isCorrectOption) {
                      optionClasses +=
                        "bg-red-50 border-red-500 text-red-900 dark:bg-red-900 dark:border-red-400 dark:text-red-100";
                    } else {
                      optionClasses += "bg-gray-50 border-gray-300 text-gray-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300";
                    }
                  } else {
                    optionClasses +=
                      "border-gray-300 hover:bg-blue-50 hover:border-blue-400 dark:border-gray-600 dark:hover:bg-blue-900 dark:hover:border-blue-500";
                  }

                  return (
                    <li
                      key={i}
                      className={optionClasses}
                      onClick={() => handleSelectOption(index, opt)}
                    >
                      <div className="flex items-center justify-between">
                        <span>{opt}</span>
                        {hasAnswered && isCorrectOption && (
                          <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                        )}
                        {hasAnswered && isSelected && !isCorrectOption && (
                          <span className="text-red-600 dark:text-red-400 font-bold">✗</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              {hasAnswered && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900 dark:border-blue-700">
                  <p className="text-sm font-medium">
                    {userAnswer === q.correctAnswer ? (
                      <span className="text-green-700 dark:text-green-400">✓ Correct!</span>
                    ) : (
                      <>
                        <span className="text-red-700 dark:text-red-400">✗ Incorrect. </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          Correct answer:{" "}
                          <span className="font-semibold">{q.correctAnswer}</span>
                        </span>
                      </>
                    )}
                  </p>

                  {q.explanation && (
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Explanation:</span> {q.explanation}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Score Modal - Pops up when all questions are answered */}
      {showScoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="relative bg-gray-100 dark:bg-gray-800 p-6 text-gray-900 dark:text-white">
              <button
                onClick={() => setShowScoreModal(false)}
                className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full p-1 transition"
              >
                <X size={20} />
              </button>
              <h2 className="text-2xl font-bold text-center">🎉 Quiz Completed!</h2>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Score Display */}
              <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg text-center">
                <p className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                  {percentage}%
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  {score} out of {quiz.length} correct
                </p>
              </div>

              {/* Performance Message */}
              <div className="space-y-3">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {percentage >= 80
                    ? "🌟 Excellent work!"
                    : percentage >= 60
                    ? "👍 Good effort!"
                    : "💪 Keep practicing!"}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  {percentage >= 80
                    ? "You've mastered this topic!"
                    : percentage >= 60
                    ? "You're on the right track. Review the explanations to improve."
                    : "Take some time to review the material and try again."}
                </p>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => setShowScoreModal(false)}
                className="w-full bg-gray-700 text-white hover:bg-gray-600"
              >
                View Answers
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LectureQuiz;