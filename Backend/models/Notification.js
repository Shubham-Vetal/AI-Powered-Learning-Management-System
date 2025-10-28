// models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // for fast queries
    },
    type: {
      type: String,
      enum: ["purchase", "course_update", "system", "other"],
      default: "other",
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // for extra data
    },
  },
  { timestamps: true } // gives us createdAt, updatedAt
);

export default mongoose.model("Notification", notificationSchema);