import { useRef, useState, useCallback, useEffect } from 'react';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

type ButtonMessage = {
  type?: 'button';
  button: string;
  action: 'press' | 'release';
};

type AxisMessage = {
  type: 'axis';
  x: number;
  y: number;
};

type WSMessage = ButtonMessage | AxisMessage;

export function useWebSocket(url: string) {
  const ws = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    // Clean up any existing connection
    if (ws.current) {
      ws.current.onopen = null;
      ws.current.onclose = null;
      ws.current.onerror = null;
      ws.current.close();
    }

    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }

    setStatus('connecting');

    try {
      const socket = new WebSocket(url);

      socket.onopen = () => {
        setStatus('connected');
      };

      socket.onclose = () => {
        setStatus('disconnected');
        // Auto-reconnect after 3 seconds
        reconnectTimeout.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      socket.onerror = () => {
        setStatus('error');
      };

      ws.current = socket;
    } catch {
      setStatus('error');
    }
  }, [url]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    if (ws.current) {
      ws.current.onclose = null; // prevent auto-reconnect
      ws.current.close();
      ws.current = null;
    }
    setStatus('disconnected');
  }, []);

  const send = useCallback((msg: WSMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(msg));
    }
  }, []);

  const sendButton = useCallback(
    (button: string, action: 'press' | 'release') => {
      send({ button, action });
    },
    [send]
  );

  const sendAxis = useCallback(
    (x: number, y: number) => {
      send({ type: 'axis', x, y });
    },
    [send]
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    status,
    connect,
    disconnect,
    sendButton,
    sendAxis,
  };
}
