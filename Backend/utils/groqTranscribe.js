// utils/groqTranscription.js
import fs from "fs";
import path from "path";
import FormData from "form-data";
import fetch from "node-fetch";

/**
 * Transcribe audio/video using Groq Whisper large-v3 model
 * @param {string} filePath - Local path to video or audio file
 * @returns {Promise<string>} transcript text
 */
export const generateGroqTranscript = async (filePath) => {
  console.log("\========== GROQ TRANSCRIPTION START ==========");
  console.log("File:", path.basename(filePath));
  console.log("Full path:", filePath);

  try {
    // 1. Validate file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // 2. Check file size
    const stats = fs.statSync(filePath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    // console.log(`File size: ${sizeInMB} MB`);

    if (stats.size === 0) {
      throw new Error("File is empty (0 bytes)");
    }

    if (stats.size > 25 * 1024 * 1024) {
      throw new Error(`File too large: ${sizeInMB}MB (max 25MB)`);
    }

    // 3. Verify API key
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY not found in environment");
    }
    console.log("API Key:", process.env.GROQ_API_KEY.substring(0, 15) + "...");

    // 4. Create FormData
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath), {
      filename: path.basename(filePath),
      contentType: "video/mp4",
    });
    formData.append("model", "whisper-large-v3");
    formData.append("response_format", "json");
    formData.append("language", "en");
    formData.append("temperature", "0.0");

    console.log("   Sending to Groq API...");
    console.log("   URL: https://api.groq.com/openai/v1/audio/transcriptions");
    console.log("   Model: whisper-large-v3");

    const start = Date.now();

    // 5. Make API request
    const response = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          ...formData.getHeaders(),
        },
        body: formData,
      }
    );

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`⏱️  Response time: ${duration}s`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);

    // 6. Handle errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API Error:");
      console.error("   Status:", response.status);
      console.error("   Response:", errorText);

      let errorMessage = "Groq API error";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorData.message || errorText;
      } catch (e) {
        errorMessage = errorText;
      }

      throw new Error(`Groq API (${response.status}): ${errorMessage}`);
    }

    // 7. Parse response
    const contentType = response.headers.get("content-type");
    console.log("📊 Content-Type:", contentType);

    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("   Unexpected response format:");
      console.error("   Expected: application/json");
      console.error("   Got:", contentType);
      console.error("   Body:", text.substring(0, 200));
      throw new Error("Unexpected response format from Groq");
    }

    const data = await response.json();
    // console.log("Response keys:", Object.keys(data));

    // 8. Extract transcript
    if (!data.text) {
      console.error(" No 'text' field in response:");
      console.error("   Response:", JSON.stringify(data, null, 2));
      throw new Error("No transcript text in Groq response");
    }

    const transcript = data.text.trim();

    if (transcript.length === 0) {
      console.warn("⚠️  Empty transcript returned");
      throw new Error("Groq returned empty transcript");
    }

    // console.log(`SUCCESS! Transcript: ${transcript.length} characters`);
    // console.log(`Preview: "${transcript.substring(0, 100)}..."`);
  

    return transcript;

  } catch (error) {
  
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);

    throw error;
  }
};

// Test function to verify Groq connection
export const testGroqConnection = async () => {
//   console.log("\nTesting Groq API connection...");

  if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY not found");
    return false;
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const whisperModels = data.data?.filter(m => m.id.includes("whisper")) || [];
      
    //   console.log("Groq API connection successful");
    //   console.log("Available Whisper models:");
      whisperModels.forEach(m => console.log(`   - ${m.id}`));
      return true;
    } else {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error("Connection failed:", error.message);
    return false;
  }
};