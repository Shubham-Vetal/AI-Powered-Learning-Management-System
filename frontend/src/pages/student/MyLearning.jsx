import React from "react";
import Course from "./Course";
import { useLoadUserQuery } from "@/features/api/authApi";
import { motion } from "framer-motion";

const MyLearning = () => {
  const { data, isLoading } = useLoadUserQuery();
  const myLearning = data?.user.enrolledCourses || [];
  
  //Filter out null/invalid courses
  const validCourses = myLearning.filter(course => course !== null && course?.courseTitle);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-0 mt-5">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="font-extrabold text-3xl md:text-4xl bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
          My Learning
        </h1>
        <div className="w-20 h-1 mx-auto mt-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
        <p className="text-gray-500 mt-2 text-sm md:text-base">
          Continue where you left off or explore your enrolled courses.
        </p>
      </div>

      {/* Course Grid */}
      <div className="my-5">
        {isLoading ? (
          <MyLearningSkeleton />
        ) : validCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <img
              src="https://illustrations.popsy.co/violet/student.svg"
              alt="No Courses"
              className="w-56 mb-6"
            />
            <p className="text-gray-600 text-lg">
              You're not enrolled in any courses yet.
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {validCourses.map((course, index) => (
              <motion.div
                key={course._id || index} // Use _id if available
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Course course={course} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyLearning;

// Skeleton Loader
const MyLearningSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    {[...Array(3)].map((_, index) => (
      <div
        key={index}
        className="bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-xl h-48 animate-pulse shadow-sm"
      ></div>
    ))}
  </div>
);
