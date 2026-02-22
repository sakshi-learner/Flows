"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { createSocket } from "@/lib/socket";

type SocketStatus = "disconnected" | "connected" | "error";

type SocketCtx = {
  socket: Socket | null;
  status: SocketStatus;
  connect: () => Socket;
  disconnect: () => void;
};

const SocketContext = createContext<SocketCtx | null>(null);

export function SocketProvider({
  enabled,
  children,
}: {
  enabled: boolean; // ✅ isAuthenticated pass karo
  children: React.ReactNode;
}) {
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<SocketStatus>("disconnected");

  const connect = () => {
    if (socketRef.current?.connected) {
      console.log("ℹ️ Socket already connected");
      return socketRef.current;
    }

    if (socketRef.current) {
      socketRef.current.connect();
      return socketRef.current;
    }

    const s = createSocket();
    console.log("🔌 Creating new socket connection");
    socketRef.current = s;

    // Event listeners
    s.on("connect", () => {
      setStatus("connected");
      console.log("✅ Socket connected:", s.id);
    });

    s.on("disconnect", (reason) => {
      setStatus("disconnected");
      console.log("⚠️ Socket disconnected:", reason);
    });

    s.on("connect_error", (error) => {
      setStatus("error");
      console.error("❌ Socket connect_error:", error.message);
      
      // ✅ Agar authentication error hai, disconnect kar do
      if (error.message.includes("Authentication")) {
        console.log("🚫 Authentication error - disconnecting socket");
        disconnect();
      }
    });

    // ✅ Connect karo
    s.connect();

    return s;
  };

  const disconnect = () => {
    if (!socketRef.current) return;
    
    console.log("🔌 Disconnecting socket");
    socketRef.current.disconnect();
    socketRef.current.removeAllListeners();
    socketRef.current = null;
    setStatus("disconnected");
  };

  // ✅ Auto connect/disconnect based on enabled prop
  useEffect(() => {
    if (!enabled) {
      disconnect();
      return;
    }

    // Small delay to ensure cookie is set
    const timer = setTimeout(() => {
      connect();
    }, 100);

    return () => {
      clearTimeout(timer);
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const value = useMemo(
    () => ({
      socket: socketRef.current,
      status,
      connect,
      disconnect,
    }),
    [status]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocketContext() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocketContext must be used within SocketProvider");
  return ctx;
}