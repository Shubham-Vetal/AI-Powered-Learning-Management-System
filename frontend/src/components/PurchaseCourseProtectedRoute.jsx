import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import { useParams, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const PurchaseCourseProtectedRoute = ({ children }) => {
  const { courseId } = useParams();
  const [retryCount, setRetryCount] = useState(0);
  const { data, isLoading, refetch } = useGetCourseDetailWithStatusQuery(courseId);

  useEffect(() => {
    if (!isLoading && !data?.purchased && retryCount < 5) {
      const timer = setTimeout(() => {
        console.log(`Retrying purchase verification... Attempt ${retryCount + 1}/5`); // ✅ Fixed
        refetch();
        setRetryCount((prev) => prev + 1);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [data?.purchased, isLoading, retryCount, refetch]);

  if (isLoading || (retryCount > 0 && retryCount < 5 && !data?.purchased)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            Verifying your purchase...
          </p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Attempt {retryCount} of 5
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!data?.purchased) {
    return <Navigate to={`/course-detail/${courseId}`} />; // ✅ Fixed
  }

  return children;
};

export default PurchaseCourseProtectedRoute;
