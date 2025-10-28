// controllers/notificationController.js
import Notification from "../models/Notification.js";

// Get user notifications
export const getUserNotifications = async (req, res) => {
  try {
    if (!req.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const notifications = await Notification.find({ userId: req.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("courseId", "courseTitle thumbnail");

    const unreadCount = await Notification.countDocuments({
      userId: req.id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

// Mark single notification as read
export const markAsRead = async (req, res) => {
  try {
    if (!req.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error("Error marking notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark as read",
    });
  }
};

// Mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    if (!req.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    await Notification.updateMany(
      { userId: req.id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark all as read",
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    if (!req.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
};
