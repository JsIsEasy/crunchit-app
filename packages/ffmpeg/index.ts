import ffmpeg from "@ffmpeg-installer/ffmpeg";
import { spawn } from "child_process";
import fs from "node:fs";

const args = [
  "-y",
  "-hide_banner",
  "-loglevel",
  "info",
  "-i",
  "pipe:0",
  "-vn",
  "-acodec",
  "libmp3lame",
  "-b:a",
  "128k",
  "-f",
  "mp3",
  "output.mp3",
];
const ff = spawn(ffmpeg.path, args, { stdio: "pipe" });

const readStream = fs.createReadStream("./test-login.mp4");

readStream.pipe(ff.stdin);

ff.on("exit", (code, signal) => {
  console.log(code, signal);
});

ff.on("error", (error) => {
  console.log(error);
});

readStream.on("end", () => {
  console.log("finished reading input file.");
});

readStream.on("error", (error) => {
  console.log("read stream error", error);
});
