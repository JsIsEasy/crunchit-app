"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// index.ts
var import_ffmpeg = __toESM(require("@ffmpeg-installer/ffmpeg"));
var import_child_process = require("child_process");
var import_node_fs = __toESM(require("fs"));
var args = [
  "-y",
  "-hide_banner",
  "-loglevel",
  "info",
  "-f",
  "mp4",
  "-i",
  "pipe:0",
  "-vn",
  "-acodec",
  "libmp3lame",
  "-b:a",
  "128k",
  "-f",
  "mp3",
  "output.mp3"
];
var ff = (0, import_child_process.spawn)(import_ffmpeg.default.path, args, { stdio: "pipe" });
var readStream = import_node_fs.default.createReadStream("./test-login.mp4");
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
