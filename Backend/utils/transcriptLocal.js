import { spawn } from "child_process";

export const generateLocalTranscript = async (videoPath) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python3", ["./transcribe.py", videoPath]);

    let transcript = "";

    pythonProcess.stdout.on("data", (data) => {
      transcript += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error("Python error:", data.toString());
    });

    pythonProcess.on("close", (code) => {
      if (code === 0) resolve(transcript.trim());
      else reject(new Error(`Python process exited with code ${code}`));
    });
  });
};
