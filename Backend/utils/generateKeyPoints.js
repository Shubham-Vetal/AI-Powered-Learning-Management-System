// utils/generateKeyPoints.js
import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const generateKeyPointsFromTranscript = async (transcript) => {
  if (!transcript || transcript.trim().length < 20) {
    console.warn("Transcript too short to generate key points.");
    return [];
  }

  const prompt = `
You are an expert educator.

Read the following lecture transcript and generate 5-7 concise, actionable key points.

Each key point should be 1-2 sentences, capturing the main idea or takeaway.

Return ONLY a JSON array of strings, with no extra text, like:
["Key point 1", "Key point 2", "Key point 3"]

Lecture Transcript:
${transcript}
`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    let content = response.choices[0]?.message?.content?.trim() || "";

    //Clean and extract only JSON array portion
    const match = content.match(/\[[\s\S]*\]/);
    if (!match) {
      console.error("Could not extract JSON array from LLM output:", content);
      return [];
    }

    const jsonText = match[0];

    try {
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed)) {
        // console.log("Generated key points:", parsed);
        return parsed;
      } else {
        console.error("Parsed result is not an array:", parsed);
        return [];
      }
    } catch (err) {
      console.error("JSON parse failed:", err.message, "\nContent:", jsonText);
      return [];
    }
  } catch (error) {
    console.error("Failed to generate key points:", error);
    return [];
  }
};
