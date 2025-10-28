// routes/notificationRoutes.js
import express from "express";
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notification.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.get("/", isAuthenticated, getUserNotifications);
router.patch("/:id/read", isAuthenticated, markAsRead);
router.patch("/read-all", isAuthenticated, markAllAsRead);
router.delete("/:id", isAuthenticated, deleteNotification);

export default router;