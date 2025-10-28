import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { askLectureTutor } from "../controllers/chatbot.controller.js";

const router = express.Router();

// POST /api/chatbot/course/:courseId/lecture/:lectureId/ask
router.post(
  "/course/:courseId/lecture/:lectureId/ask",
  isAuthenticated,
  askLectureTutor
);

export default router;
