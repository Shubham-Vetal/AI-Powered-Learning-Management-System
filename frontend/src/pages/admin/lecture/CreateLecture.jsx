import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCreateLectureMutation,
  useGetCourseLectureQuery,
} from "@/features/api/courseApi";
import Lecture from "./Lecture";
import { Progress } from "@/components/ui/progress"; 

const CreateLecture = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { courseId } = useParams();
  const navigate = useNavigate();

  const [createLecture, { data, isLoading, isSuccess, error }] =
    useCreateLectureMutation();

  const {
    data: lectureData,
    isLoading: lectureLoading,
    isError: lectureError,
    refetch,
  } = useGetCourseLectureQuery(courseId);

  // Handle file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        toast.error("Please select a video file");
        return;
      }

      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File size must be less than 100MB");
        return;
      }

      setVideoFile(file);
    }
  };

  // Create lecture handler
  const createLectureHandler = async () => {
    if (!lectureTitle.trim()) {
      toast.error("Please enter a lecture title");
      return;
    }
    if (!videoFile) {
      toast.error("Please select a video file");
      return;
    }

    try {
      // simulate progress (if backend doesn't support it)
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev < 95 ? prev + 5 : prev));
      }, 300);

      await createLecture({ lectureTitle, courseId, file: videoFile }).unwrap();

      clearInterval(progressInterval);
      setUploadProgress(100);
    } catch (err) {
      setUploadProgress(0);
      toast.error(err?.data?.message || "Failed to create lecture");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      refetch();
      toast.success(data?.message || "Lecture created successfully!");
      setLectureTitle("");
      setVideoFile(null);
      setUploadProgress(0);
      const fileInput = document.getElementById("video-file");
      if (fileInput) fileInput.value = "";
    }

    if (error) {
      toast.error(error?.data?.message || "Failed to create lecture");
      setUploadProgress(0);
    }
  }, [isSuccess, error, data, refetch]);

  return (
    <div className="p-6 ">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold mb-1">
          Add a New Lecture
        </h1>
        <p className="text-sm text-muted-foreground">
          Upload a video — we'll automatically generate a transcript and key points.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-5 bg-white dark:bg-gray-900 rounded-xl shadow p-6">
        {/* Lecture Title */}
        <div className="space-y-2">
          <Label htmlFor="lecture-title">Lecture Title *</Label>
          <Input
            id="lecture-title"
            type="text"
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            placeholder="e.g., Introduction to CSS Basics"
            disabled={isLoading}
          />
        </div>

        {/* Video Upload */}
        <div className="space-y-2">
          <Label htmlFor="video-file">Video File *</Label>
          <Input
            id="video-file"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            disabled={isLoading}
          />
          {videoFile && (
            <p className="text-sm text-muted-foreground">
              Selected: {videoFile.name} (
              {(videoFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Supported formats: MP4, MOV, AVI • Max size: 100MB
          </p>
        </div>

        {/* Upload Progress */}
        {isLoading && (
          <div className="space-y-2">
            <p className="text-sm text-blue-600 font-medium">
              Uploading & processing your video...
            </p>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/course/${courseId}`)}
            disabled={isLoading}
          >
            Back to course
          </Button>
          <Button
            disabled={isLoading || !lectureTitle.trim() || !videoFile}
            onClick={createLectureHandler}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Create Lecture"
            )}
          </Button>
        </div>
      </div>

      {/* Lectures List */}
      <div className="mt-8">
        <h2 className="font-semibold text-lg mb-4">Course Lectures</h2>
        {lectureLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p>Loading lectures...</p>
          </div>
        ) : lectureError ? (
          <p className="text-red-500">Failed to load lectures.</p>
        ) : !lectureData?.lectures?.length ? (
          <p className="text-muted-foreground">
            No lectures yet. Create your first one above!
          </p>
        ) : (
          <div className="space-y-2">
            {lectureData.lectures.map((lecture, index) => (
              <Lecture
                key={lecture._id}
                lecture={lecture}
                courseId={courseId}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateLecture;
