import { useEffect, useRef } from "react";
import { urls } from "@config";
export function useWebSocket() {
  const socket = useRef<WebSocket>(null);

  useEffect(() => {
    if (socket.current) {
      console.log("Ws-Client: Socket connection exist!");
      return;
    }

    socket.current = new WebSocket(`${urls.wsProtocol}${urls.serverUrl}${urls.statusUrl}`);
    socket.current.onopen = onOpen;
    socket.current.onclose = onClose;
    socket.current.onmessage = onReceiveMessage;
  }, []);

  function onReceiveMessage(message: MessageEvent) {
    console.log(message);
    console.log("Ws-Client: New message arrived!");
  }

  function sendMessage() {
    console.log("Ws-Client: Sending new message!");
  }

  function onOpen() {
    console.log("Ws-Client: Connection established!");
  }

  function onClose() {
    console.log("Ws-Client: Connection Closed!");
  }

  return { sendMessage };
}
