import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import { spawn } from "child_process";
import fs from "node:fs";
import { pipeline } from "stream/promises";

export default class FFmpeg {
  private _path: string;
  private _readStream: ReadableStream;
  private _input: string;
  private _outputs: { video: string[]; audio: string[] } = {
    video: [],
    audio: [],
  };

  private _format: string = "mp4";
  private _finalArgs: string[] = [];

  constructor(input: string);
  constructor(input: ReadableStream);
  constructor(input: ReadableStream | string) {
    if (!this._path) {
      this._path = ffmpegPath;
    }

    if (typeof input == "string") {
      this._input = input;
      return;
    }

    this._readStream = input;
  }

  videoCodec(codec: string) {
    this._outputs.video = [];
    this._outputs.video.push("-vcodec", codec);
    return this;
  }

  audioCodec(codec: string) {
    this._outputs.audio = [];
    this._outputs.audio.push("-acodec", codec);
    return this;
  }

  audioBitrate(bitrate: string) {
    this._outputs.audio = [];
    this._outputs.audio.push("-b:a", bitrate);
    return this;
  }

  prepareArgs() {
    this._finalArgs.push("-i", "pipe:0");

    for (let key of Object.keys(this._outputs) as (keyof typeof this._outputs)[]) {
      this._finalArgs.push(...this._outputs[key]);
    }

    this._finalArgs.push("-f", this._format);
    this._finalArgs.push("output.mp4");
  }

  run() {
    this.prepareArgs();

    const readStream = fs.createReadStream(this._input, { autoClose: true });

    const process = spawn(this._path, this._finalArgs);

    console.log(this._finalArgs);

    readStream.pipe(process.stdin);

    process.stdin.on("error", () => {
      console.log("faced error");
    });

    process.stdin.on("finish", () => {
      console.log("finished writing to");
      readStream.close();
    });

    process.stdout.on("close", () => {
      console.log("write stream closed");
    });

    process.stdout.on("error", () => {
      console.log("faced some error");
    });

    process.stdout.on("data", (data) => {
      console.log("data passing");
    });
  }
}
