import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
  lectureTitle: {
    type: String,
    required: true,
  },
  videoUrl: { type: String },
  publicId: { type: String },
  isPreviewFree: { type: Boolean },
  transcript: { type: String, default: "" },
  keyPoints: { type: [String], default: [] },
},{timestamps:true});

export const Lecture = mongoose.model("Lecture", lectureSchema);