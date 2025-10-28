// routes/course.route.js
import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { 
  createCourse, 
  createLecture, 
  createLectureQuiz, 
  editCourse, 
  editLecture, 
  getCourseById, 
  getCourseLecture, 
  getCreatorCourses, 
  getLectureById, 
  getLectureKeyPoints, 
  getLectureQuiz, 
  getPublishedCourse, 
  removeCourse, 
  removeLecture, 
  searchCourse, 
  togglePublishCourse 
} from "../controllers/course.controller.js";
import upload from "../utils/multer.js";

const router = express.Router();

// Course routes
router.route("/").post(isAuthenticated, createCourse);
router.route("/search").get(isAuthenticated, searchCourse);
router.route("/published-courses").get(getPublishedCourse);
router.route("/").get(isAuthenticated, getCreatorCourses);

// Course edit with thumbnail
router.route("/:courseId").put(isAuthenticated, upload.single("courseThumbnail"), editCourse);

router.route("/:courseId").get(isAuthenticated, getCourseById);
router.route("/:courseId").patch(isAuthenticated, togglePublishCourse);
router.route("/:courseId").delete(isAuthenticated, removeCourse);

// Lecture routes
router.route("/:courseId/lecture").post(
  isAuthenticated, 
  upload.single("file"), 
  createLecture
);
router.route("/:courseId/lecture").get(isAuthenticated, getCourseLecture);

router.route("/:courseId/lecture/:lectureId").post(isAuthenticated, editLecture);

router.route("/lecture/:lectureId").delete(isAuthenticated, removeLecture);
router.route("/lecture/:lectureId").get(isAuthenticated, getLectureById);

// Quiz routes
router.post("/:courseId/lecture/:lectureId/quiz", isAuthenticated, createLectureQuiz);
router.get("/:courseId/lecture/:lectureId/quiz", isAuthenticated, getLectureQuiz);

// Key points route
router.get("/:courseId/lecture/:lectureId/keypoints", isAuthenticated, getLectureKeyPoints);

export default router;