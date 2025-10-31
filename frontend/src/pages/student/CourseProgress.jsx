import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  useCreateLectureQuizMutation,
  useGetLectureKeyPointsQuery,
} from "@/features/api/courseApi";
import jsPDF from "jspdf";
import { useNavigate, useParams } from "react-router-dom";

import {
  useCompleteCourseMutation,
  useGetCourseProgressQuery,
  useInCompleteCourseMutation,
  useUpdateLectureProgressMutation,
} from "@/features/api/courseProgressApi";

import {
  CheckCircle,
  CheckCircle2,
  CirclePlay,
  Download,
  Loader2,
  BookOpen,
  Award,
} from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { skipToken } from "@reduxjs/toolkit/query/react";
import LectureChatbot from "./LectureChatbot";

const CourseProgress = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const { data, isLoading, isError, refetch } =
    useGetCourseProgressQuery(courseId);

  const [updateLectureProgress] = useUpdateLectureProgressMutation();
  const [
    completeCourse,
    { data: markCompleteData, isSuccess: completedSuccess },
  ] = useCompleteCourseMutation();
  const [
    inCompleteCourse,
    { data: markInCompleteData, isSuccess: inCompletedSuccess },
  ] = useInCompleteCourseMutation();

  const [createQuiz, { isLoading: isQuizLoading }] =
    useCreateLectureQuizMutation();
  const [currentLecture, setCurrentLecture] = useState(null);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  // Calculate lectureId before conditional returns - IMPORTANT for Rules of Hooks
  const initialLecture =
    currentLecture || data?.data?.courseDetails?.lectures?.[0];
  const lectureId = currentLecture?._id || initialLecture?._id;

  // Key points query - always call the hook, use skipToken when no lectureId
  const { data: keyPointsData, isLoading: isKeyPointsLoading } =
    useGetLectureKeyPointsQuery(
      lectureId ? { courseId, lectureId } : skipToken
    );

  useEffect(() => {
    refetch();
  }, [courseId, refetch]);

  useEffect(() => {
    if (completedSuccess) {
      refetch();
      toast.success(markCompleteData.message);
    }
    if (inCompletedSuccess) {
      refetch();
      toast.success(markInCompleteData.message);
    }
  }, [
    completedSuccess,
    inCompletedSuccess,
    refetch,
    markCompleteData,
    markInCompleteData,
  ]);

  // Memoize current lecture title
  const currentLectureTitle = useMemo(() => {
    return (
      currentLecture?.lectureTitle || initialLecture?.lectureTitle || "Lecture"
    );
  }, [currentLecture, initialLecture]);

  // Progress Calculation
  const progressPercentage = useMemo(() => {
    const lectures = data?.data?.courseDetails?.lectures ?? [];
    const progress = data?.data?.progress ?? [];
    if (lectures.length === 0) return 0;

    const viewed = new Set(
      progress.filter((p) => p.viewed).map((p) => p.lectureId)
    );
    const percent = Math.round((viewed.size / lectures.length) * 100);

    return Math.min(percent, 100);
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading course...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <p className="text-red-600 dark:text-red-400 text-lg mb-2">
            Failed to load course details
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  const { courseDetails, progress, completed } = data.data;
  const { courseTitle } = courseDetails;

  const isLectureCompleted = (lectureId) =>
    progress.some((prog) => prog.lectureId === lectureId && prog.viewed);

  const handleLectureProgress = async (lectureId) => {
    try {
      await updateLectureProgress({ courseId, lectureId });
      refetch();
    } catch (error) {
      toast.error("Failed to update lecture progress");
    }
  };

  const handleSelectLecture = (lecture) => {
    setCurrentLecture(lecture);
    handleLectureProgress(lecture._id);
  };

  const handleCompleteCourse = async () => {
    try {
      await completeCourse(courseId);
    } catch (error) {
      toast.error("Failed to mark course as complete");
    }
  };

  const handleInCompleteCourse = async () => {
    try {
      await inCompleteCourse(courseId);
    } catch (error) {
      toast.error("Failed to update course status");
    }
  };

  const handleGenerateQuiz = async (lectureId) => {
    try {
      await createQuiz({ courseId, lectureId }).unwrap();
      toast.success("Quiz generated successfully!");
      navigate(`/course/${courseId}/lecture/${lectureId}/quiz`);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to generate quiz.");
    }
  };

  const handleDownloadKeyPoints = async () => {
    if (!keyPointsData?.keyPoints || keyPointsData.keyPoints.length === 0) {
      toast.error("No key points available to download");
      return;
    }

    setIsDownloadingPDF(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const lineHeight = 7;
      let yPosition = 30;

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Key Points", margin, 20);

      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text(currentLectureTitle, margin, yPosition);
      yPosition += 10;

      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      doc.setFontSize(11);
      keyPointsData.keyPoints.forEach((point, index) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }

        const lines = doc.splitTextToSize(
          `${index + 1}. ${point}`,
          pageWidth - 2 * margin
        );

        lines.forEach((line, lineIndex) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, margin, yPosition);
          yPosition += lineHeight;
        });

        yPosition += 3;
      });

      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, {
          align: "center",
        });
        doc.text(
          `Generated on ${new Date().toLocaleDateString()}`,
          pageWidth - margin,
          pageHeight - 10,
          { align: "right" }
        );
      }

      const sanitizedTitle = currentLectureTitle.replace(/[^a-z0-9]/gi, "_");
      doc.save(`${sanitizedTitle}-KeyPoints.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  return (
    <div
      className="flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 dark:from-gray-950 dark:via-blue-950/20 dark:to-gray-950"
      style={{ height: "calc(100vh - 4rem)" }}
    >
      <div className="flex-shrink-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 dark:from-gray-950 dark:via-blue-950/20 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  {courseTitle}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-2 w-32 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {progressPercentage}% Complete
                  </span>
                </div>
              </div>
            </div>
            <Button
              onClick={
                completed ? handleInCompleteCourse : handleCompleteCourse
              }
              variant={completed ? "outline" : "default"}
              className={`w-full sm:w-auto flex-shrink-0 ${
                completed
                  ? "border-green-500 text-green-600 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-950/20"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all"
              }`}
              aria-label={
                completed ? "Mark as incomplete" : "Mark as completed"
              }
            >
              {completed ? (
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span className="font-medium">Completed</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Mark as completed</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left section - Video and Key Points */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Section */}
              <div className="rounded-xl shadow-xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div
                  className="relative w-full bg-black"
                  style={{ paddingBottom: "56.25%" }}
                >
                  <video
                    key={currentLecture?._id || initialLecture._id}
                    src={currentLecture?.videoUrl || initialLecture.videoUrl}
                    controls
                    className="absolute top-0 left-0 w-full h-full"
                    onPlay={() =>
                      handleLectureProgress(
                        currentLecture?._id || initialLecture._id
                      )
                    }
                    aria-label={`Video for ${currentLectureTitle}`}
                  />
                </div>

                <div className="p-4 sm:p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                          Lecture{" "}
                          {courseDetails.lectures.findIndex(
                            (lec) =>
                              lec._id ===
                              (currentLecture?._id || initialLecture._id)
                          ) + 1}
                        </Badge>
                        {isLectureCompleted(
                          currentLecture?._id || initialLecture._id
                        ) && (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                        {currentLectureTitle}
                      </h3>
                    </div>
                  </div>

                  {(currentLecture?.transcript ||
                    initialLecture.transcript) && (
                    <Button
                      onClick={() =>
                        handleGenerateQuiz(
                          currentLecture?._id || initialLecture._id
                        )
                      }
                      variant="outline"
                      className="w-full sm:w-auto border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      disabled={isQuizLoading}
                      aria-label="Generate quiz for this lecture"
                    >
                      {isQuizLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Quiz...
                        </>
                      ) : (
                        <>
                          <BookOpen className="mr-2 h-4 w-4" />
                          Generate Quiz
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Key Points Section */}
              {(keyPointsData?.keyPoints?.length > 0 || isKeyPointsLoading) && (
                <div className="rounded-xl shadow-lg p-5 sm:p-6 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20 border border-gray-200 dark:border-gray-800">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                        Key Points
                      </h3>
                    </div>
                    {!isKeyPointsLoading &&
                      keyPointsData?.keyPoints?.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadKeyPoints}
                          disabled={isDownloadingPDF}
                          className="w-full sm:w-auto border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                          aria-label="Download key points as PDF"
                        >
                          {isDownloadingPDF ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </>
                          )}
                        </Button>
                      )}
                  </div>

                  {isKeyPointsLoading ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-blue-100/50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                          Generating key points from lecture content...
                        </p>
                      </div>

                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="animate-pulse space-y-3">
                          <div className="flex gap-3">
                            <div className="w-2 h-2 bg-blue-300 dark:bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-5/6"></div>
                              {i % 2 === 0 && (
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-4/6"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {keyPointsData.keyPoints.map((point, index) => (
                        <li key={index} className="flex gap-3 group">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                            {index + 1}
                          </span>
                          <span className="flex-1 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                            {point}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Right section - Lecture Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                    Course Lectures
                  </h2>
                  <Badge variant="outline" className="text-xs">
                    {courseDetails.lectures.length} lectures
                  </Badge>
                </div>
                <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                  {courseDetails?.lectures.map((lecture, index) => (
                    <Card
                      key={lecture._id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md border ${
                        lecture._id === currentLecture?._id
                          ? "bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-300 dark:border-blue-700 shadow-md"
                          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900"
                      }`}
                      onClick={() => handleSelectLecture(lecture)}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleSelectLecture(lecture);
                        }
                      }}
                      aria-label={`${lecture.lectureTitle}, ${
                        isLectureCompleted(lecture._id)
                          ? "completed"
                          : "not completed"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                              isLectureCompleted(lecture._id)
                                ? "bg-green-100 dark:bg-green-900/30"
                                : "bg-gray-100 dark:bg-gray-800"
                            }`}
                          >
                            {isLectureCompleted(lecture._id) ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <CirclePlay className="h-5 w-5 text-gray-400 dark:text-gray-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Lecture {index + 1}
                              </span>
                            </div>
                            <CardTitle className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                              {lecture.lectureTitle}
                            </CardTitle>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chatbot - Fixed at bottom right */}
      {lectureId && (
        <LectureChatbot
          courseId={courseId}
          lectureId={lectureId}
          courseTitle={courseTitle}
          lectureTitle={currentLectureTitle}
        />
      )}
    </div>
  );
};

export default CourseProgress;
