// models/quiz.model.js
import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  lecture: { type: mongoose.Schema.Types.ObjectId, ref: "Lecture", required: true },
  questions: [
    {
      question: String,
      options: [String],
      correctAnswer: String, // <-- use same as mapping in backend
      explanation: String,   // optional
    },
  ],
}, { timestamps: true });


export const Quiz = mongoose.model("Quiz", quizSchema);
