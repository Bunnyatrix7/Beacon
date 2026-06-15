import { useCallback, useEffect, useRef, useState } from "react";

const WS_URL = "ws://localhost:8080/chat";

export function useChatSocket(onMessage) {
  const socketRef = useRef(null);
  const [status, setStatus] = useState("offline");

  useEffect(() => {
    let socket;

    try {
      socket = new WebSocket(WS_URL);
      socketRef.current = socket;
      setStatus("connecting");

      socket.onopen = () => setStatus("online");
      socket.onclose = () => setStatus("offline");
      socket.onerror = () => setStatus("offline");
      socket.onmessage = (event) => onMessage?.(event.data);
    } catch {
      setStatus("offline");
    }

    return () => socket?.close();
  }, [onMessage]);

  const send = useCallback((payload) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(payload);
      return true;
    }
    return false;
  }, []);

  return { send, status };
}
