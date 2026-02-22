"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UsersList from "@/components/UserList";
import ChatWindow from "@/components/ChatWindow";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";

export default function ChatPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const { status: socketStatus } = useSocket();
  const [verifying, setVerifying] = useState(true);

  // ✅ Verify authentication
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await api("/users");
        setVerifying(false);
      } catch (error) {
        console.error("❌ Auth verification failed:", error);
        router.push("/login");
      }
    };

    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    } else if (isAuthenticated) {
      verifyAuth();
    }
  }, [router, isAuthenticated, authLoading]);

  // ✅ Loading state
  if (authLoading || verifying) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  // ✅ Not authenticated
  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Left: App Info */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
              {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {user.name || "Chat App"}
              </h1>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>

          {/* Right: Status & Logout */}
          <div className="flex items-center gap-4">
            {/* Socket Status */}
            <div className="flex items-center gap-2">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  socketStatus === "connected"
                    ? "bg-green-500"
                    : socketStatus === "error"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
              ></div>
              <span className="text-sm text-gray-600 capitalize">
                {socketStatus}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Users Sidebar */}
        <aside className="w-80 border-r bg-white overflow-hidden flex flex-col">
          <div className="border-b bg-gray-50 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Contacts
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <UsersList />
          </div>
        </aside>

        {/* Chat Window */}
        <section className="flex-1 flex flex-col bg-gray-100">
          <ChatWindow />
        </section>
      </main>
    </div>
  );
}