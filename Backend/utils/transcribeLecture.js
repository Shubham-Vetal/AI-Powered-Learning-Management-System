// import fs from "fs";
// import path from "path";
// import { spawn } from "child_process";
// import { downloadVideo } from "../utils/video.js";
// import { Lecture } from "../models/lecture.model.js";

// export const transcribeLectureVideo = async (lecture) => {
//   if (!lecture.videoUrl) throw new Error("No video URL found in lecture");

//   // Ensure tmp folder exists
//   if (!fs.existsSync("./tmp")) fs.mkdirSync("./tmp");

//   const tempPath = path.resolve(`./tmp/${lecture._id}.mp4`);

//   // Download video from Cloudinary
//   await downloadVideo(lecture.videoUrl, tempPath);

//   // Run Python transcription
//   const transcript = await new Promise((resolve, reject) => {
//     const pythonProcess = spawn("python3", ["./utils/transcribe.py", tempPath]);

//     let output = "";
//     pythonProcess.stdout.on("data", (data) => {
//       output += data.toString();
//     });

//     pythonProcess.stderr.on("data", (data) => {
//       console.error("Python error:", data.toString());
//     });

//     pythonProcess.on("close", (code) => {
//       fs.unlinkSync(tempPath); // cleanup
//       if (code === 0) resolve(output.trim());
//       else reject(new Error(`Python process exited with code ${code}`));
//     });
//   });

//   // Save transcript in lecture
//   lecture.transcript = transcript;
//   await lecture.save();

//   return transcript;
// };


