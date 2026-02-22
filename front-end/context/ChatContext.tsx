"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Message, Room, User } from "@/types";
import { api } from "@/lib/api";
import { useSocket } from "@/hooks/useSocket";

type SocketStatus = "disconnected" | "connected" | "error";

type ButtonMessage = {
  buttonId: string;
  label: string;
  next: string | null;
};

type ChatCtx = {
  users: User[];
  selectedUser: User | null;
  roomId: number | null;
  messages: Message[];
  socketStatus: SocketStatus;

  loadUsers: () => Promise<void>;
  openDirectChat: (other: User) => Promise<void>;
  sendMessage: (payload: string | ButtonMessage) => void;
  joinRoom: (roomId: number) => void;
};

type DirectChatResponse = {
  data?: { room?: Room; messages?: Message[] };
  room?: Room;
  messages?: Message[];
};

const ChatContext = createContext<ChatCtx | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { socket, status, connect } = useSocket();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // ✅ Listen to backend event: "new_message"
  useEffect(() => {
    const s = socket ?? connect();
    if (!s) return;

    const onNewMessage = (msg: Message) => {
      console.log("📩 new_message:", msg);

      // Only push messages for current room
      if (roomId && msg.room_id !== roomId) return;

      setMessages((prev) => [...prev, msg]);
    };

    const onError = (error: any) => {
      console.error("❌ Socket error:", error);
    };

    s.on("new_message", onNewMessage);
    s.on("error", onError);

    return () => {
      s.off("new_message", onNewMessage);
      s.off("error", onError);
    };
  }, [socket, connect, roomId]);

  const loadUsers = async () => {
    const res = await api<any>("/users");
    const list: User[] = res.data ?? res.users ?? res;
    setUsers(list);
  };

  const joinRoom = (rid: number) => {
    setRoomId(rid);
    const s = socket ?? connect();
    s.emit("join_room", { roomId: rid });
  };

  const openDirectChat = async (other: User) => {
    setSelectedUser(other);
    setMessages([]);
    setRoomId(null);

    const res = await api<DirectChatResponse>("/chat/direct", {
      method: "POST",
      body: { otherUserId: other.id },
    });

    const room = res.data?.room ?? res.room;
    const history = res.data?.messages ?? res.messages ?? [];

    if (!room?.id) throw new Error("Room id missing from /chat/direct response");

    setRoomId(room.id);
    setMessages(history);

    const s = socket ?? connect();
    s.emit("join_room", { roomId: room.id });
  };


  const sendMessage = (text: string | { buttonId: string; label: string; next: string | null }) => {
    if (!roomId) throw new Error("No room selected");

    let content: string;
    let messageType: string = "text"; // Use "text" to satisfy the DB enum for now

    if (typeof text === "object") {
      content = JSON.stringify(text);
      // Even though it's a button click, we send it as "text" 
      // so the database doesn't reject it.
      messageType = "text";
    } else {
      content = text.trim();
    }

    if (!content) return;

    const s = socket ?? connect();
    s.emit("send_message", {
      roomId,
      message: { content, type: messageType },
    });
  };
  const value = useMemo(
    () => ({
      users,
      selectedUser,
      roomId,
      messages,
      socketStatus: status,
      loadUsers,
      openDirectChat,
      sendMessage,
      joinRoom,
    }),
    [users, selectedUser, roomId, messages, status]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used inside ChatProvider");
  return ctx;
}