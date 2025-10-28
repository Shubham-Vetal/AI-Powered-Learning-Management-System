import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const generateMcqQuizFromTranscript = async (transcript) => {
  if (!transcript || transcript.trim().length < 20) {
    console.warn("Transcript too short to generate quiz.");
    return [];
  }

  const prompt = `
You are an expert educator.

Read the following lecture transcript and generate 5–10 multiple choice questions.

Each question must include:
- "question": The question text
- "options": Array of 4 options
- "answer": The correct option
- "explanation": A short explanation why that answer is correct

Lecture Transcript:
${transcript}

Return ONLY valid JSON in this format:
[
  {
    "question": "Question text",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "answer": "Option 2",
    "explanation": "Explanation"
  }
]
`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content?.trim();
    // console.log("Raw LLM output:", content);

    try {
      // Attempt direct JSON parse
      return JSON.parse(content);
    } catch {
      // Fallback: extract JSON inside brackets
      const match = content.match(/\[[\s\S]*\]/);
      if (!match) {
        console.error("Could not extract JSON array from LLM output");
        return [];
      }
      try {
        return JSON.parse(match[0]);
      } catch (err) {
        console.error("JSON parse failed:", err);
        return [];
      }
    }
  } catch (error) {
    console.error("Failed to generate quiz:", error);
    return [];
  }
};
