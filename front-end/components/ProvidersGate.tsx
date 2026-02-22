"use client";

import React from "react";
import { SocketProvider } from "@/context/SocketContext";
import { ChatProvider } from "@/context/ChatContext";
import { useAuth } from "@/hooks/useAuth";
import './globals.css'

export default function ProvidersGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const enabled = !!user;

  return (
    <SocketProvider enabled={enabled}>
      <ChatProvider>{children}</ChatProvider>
    </SocketProvider>
  );
}
