import BuyCourseButton from "@/components/BuyCourseButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import { 
  BadgeInfo, 
  Lock, 
  PlayCircle, 
  Users, 
  Calendar, 
  BookOpen, 
  CheckCircle, 
  Star,
  Clock,
  Award
} from "lucide-react";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";

const CourseDetail = () => {
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();
  const { data, isLoading, isError } =
    useGetCourseDetailWithStatusQuery(courseId);

  const [videoLoading, setVideoLoading] = useState(true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-blue-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-blue-950">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
          <p className="text-red-600 dark:text-red-400 text-lg mb-2">Failed to load course details</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Please try again later</p>
        </div>
      </div>
    );
  }

  const { course, purchased } = data;

  const handleContinueCourse = () => {
    if (purchased) navigate(`/course-progress/${courseId}`);
  };

  const firstLecture = course?.lectures?.[0];
  const firstLectureVideoUrl = firstLecture
    ? firstLecture.secureUrl ||
      (firstLecture.videoUrl
        ? firstLecture.videoUrl.replace(/^http:\/\//i, "https://")
        : null)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 dark:from-gray-950 dark:via-blue-950/20 dark:to-gray-950">
      {/* Enhanced Header Section with Gradient */}
      <div className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 dark:from-black dark:via-blue-950 dark:to-black text-white overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto py-12 px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Status Badge */}
            {purchased && (
              <Badge className="mb-4 bg-green-500/90 text-white border-0 px-4 py-1">
                <CheckCircle className="w-3 h-3 mr-1" />
                Enrolled
              </Badge>
            )}

            <h1 className="font-extrabold text-3xl md:text-5xl tracking-tight mb-4 leading-tight">
              {course?.courseTitle}
            </h1>
            <p className="text-gray-200 text-lg md:text-xl max-w-3xl">
              {course?.subTitle || "Enhance your skills with this comprehensive course"}
            </p>

            {/* Course Meta Information */}
            <div className="mt-6 flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center font-bold text-white">
                  {course?.creator.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-gray-300 text-xs">Created by</p>
                  <p className="text-white font-semibold">{course?.creator.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Calendar className="w-4 h-4 text-blue-300" />
                <span className="text-gray-200">
                  Updated {new Date(course?.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Users className="w-4 h-4 text-blue-300" />
                <span className="text-gray-200">{course?.enrolledStudents.length} students</span>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <BookOpen className="w-4 h-4 text-blue-300" />
                <span className="text-gray-200">{course?.lectures?.length} lectures</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Course Details */}
          <motion.div
            className="w-full lg:w-2/3 space-y-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Description Card */}
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-900 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    What you'll learn
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div
                  className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: course.description }}
                />
              </CardContent>
            </Card>

            {/* Course Content Card */}
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-900 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-lg">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        Course Content
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        {course?.lectures?.length} lecture{course?.lectures?.length !== 1 ? "s" : ""} • 
                        Full lifetime access
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {course?.lectures?.length ? (
                  <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-200 dark:divide-gray-800 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    {course.lectures.map((lecture, idx) => (
                      <motion.div
                        key={idx}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                            purchased || lecture.isPreviewFree
                              ? "bg-blue-100 dark:bg-blue-900/30"
                              : "bg-gray-100 dark:bg-gray-800"
                          }`}>
                            {purchased || lecture.isPreviewFree ? (
                              <PlayCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <Lock className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {lecture.lectureTitle}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              Lecture {idx + 1}
                            </p>
                          </div>
                        </div>
                        {lecture.isPreviewFree && (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                            Preview
                          </Badge>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No lectures available</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Sticky Purchase Card */}
          <motion.div
            className="w-full lg:w-1/3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="sticky top-6">
              <Card className="shadow-2xl border-0 bg-white dark:bg-gray-900 overflow-hidden">
                {/* Video Preview */}
                <div className="relative">
                  {firstLectureVideoUrl ? (
                    <div className="w-full aspect-video relative bg-black">
                      {videoLoading && (
                        <div className="absolute inset-0 flex justify-center items-center bg-gradient-to-br from-blue-900/50 to-indigo-900/50 z-10">
                          <div className="text-center">
                            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-white text-sm">Loading preview...</p>
                          </div>
                        </div>
                      )}
                      <video
                        src={firstLectureVideoUrl}
                        controls
                        className="w-full h-full object-cover"
                        onLoadStart={() => setVideoLoading(true)}
                        onCanPlay={() => setVideoLoading(false)}
                        onWaiting={() => setVideoLoading(true)}
                        onPlaying={() => setVideoLoading(false)}
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                      <div className="text-center">
                        <PlayCircle className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">No preview available</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Preview Badge */}
                  {firstLecture?.isPreviewFree && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-green-500 text-white border-0 shadow-lg">
                        Free Preview
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {firstLecture?.lectureTitle || "Course Preview"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      First lecture of {course?.lectures?.length} total lectures
                    </p>
                  </div>

                  <Separator />

                  {/* Pricing Section */}
                  <div className="space-y-3">
                    {purchased ? (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <span className="font-bold text-green-700 dark:text-green-300">
                            You're enrolled!
                          </span>
                        </div>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Continue learning at your own pace
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Course Price</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-gray-900 dark:text-white">
                            ₹{course.coursePrice}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">one-time</span>
                        </div>
                      </div>
                    )}

                    {/* Features List */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Full lifetime access</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Access on mobile and desktop</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Certificate of completion</span>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0">
                  {purchased ? (
                    <Button
                      onClick={handleContinueCourse}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      <PlayCircle className="w-5 h-5 mr-2" />
                      Continue Learning
                    </Button>
                  ) : (
                    <BuyCourseButton courseId={courseId} />
                  )}
                </CardFooter>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;