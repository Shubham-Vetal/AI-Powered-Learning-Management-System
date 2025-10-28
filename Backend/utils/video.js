import fs from "fs";
import axios from "axios";

export const downloadVideo = async (url, destPath) => {
  const writer = fs.createWriteStream(destPath);
  const response = await axios.get(url, { responseType: "stream" });
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};
