import type { WebSocket } from "@fastify/websocket";
import type { FastifyInstance, FastifyRequest } from "fastify";

function statusController(this:FastifyInstance, socket: WebSocket, req: FastifyRequest) {
  console.log("WebSocket connection established");
  
  // Send initial connection message
  socket.send("Connected to status endpoint");
  
  socket.on("message", (message) => {
    const parsedMessage = JSON.parse(message.toString());
    socket.send("Hi from server");
  });
  
  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
  
  socket.on("close", () => {
    console.log("WebSocket connection closed");
  });
}

export { statusController };
