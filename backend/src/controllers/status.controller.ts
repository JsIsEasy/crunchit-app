import type { WebSocket } from "@fastify/websocket";
import type { FastifyRequest } from "fastify";

function statusController(socket: WebSocket, req: FastifyRequest) {
    console.log(socket)
  socket.on("message", (message) => {
    socket.send("Hi from server");
  });
}

export { statusController };
