import Groq from "groq-sdk";
import dotenv from "dotenv";
import { Lecture } from "../models/lecture.model.js";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const askLectureTutor = async (req, res) => {
  try {
    const userId = req.id; 
    const { lectureId } = req.params;
    const { question } = req.body;

    if (!lectureId || !question) {
      return res.status(400).json({
        success: false,
        message: "Lecture ID and question are required.",
      });
    }

    // Fetch lecture transcript
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found.",
      });
    }

    const transcript = lecture.transcript || "";

    const prompt = `
You are a friendly and knowledgeable teacher assisting a student in a course.

Lecture Transcript:
---
${transcript}
---

Student's question:
"${question}"

Respond as a teacher would — be clear, encouraging, and use examples when helpful.
Explain concisely and ensure your tone is supportive.
`;

    // Send to Groq LLM
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const answer = response.choices[0]?.message?.content?.trim();

    if (!answer) {
      return res.status(500).json({
        success: false,
        message: "No response received from LLM.",
      });
    }

    return res.status(200).json({
      success: true,
      user: userId, 
      answer,
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate chatbot response.",
    });
  }
};
