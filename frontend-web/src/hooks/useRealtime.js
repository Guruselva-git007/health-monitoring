import { useEffect } from "react";
import { getWebSocketUrl } from "../services/api";

export default function useRealtime(onMessage) {
  useEffect(() => {
    const ws = new WebSocket(getWebSocketUrl());

    ws.onopen = () => {
      ws.send("dashboard_connected");
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        onMessage(parsed);
      } catch {
        // Ignore malformed messages.
      }
    };

    const heartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send("ping");
      }
    }, 20000);

    return () => {
      clearInterval(heartbeat);
      ws.close();
    };
  }, [onMessage]);
}
