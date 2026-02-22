"use client";

import { useEffect } from "react";
import { useUsers } from "@/hooks/useUsers";
import { useChat } from "@/hooks/useChat";

export default function UsersList() {
  const { users, refresh, loading } = useUsers();
  const { selectedUser, openDirectChat } = useChat();

  useEffect(() => {
    refresh();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                  <div className="mt-1 h-3 w-1/2 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <svg
          className="mb-3 h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p className="text-sm text-gray-500">No users found</p>
        <button
          onClick={refresh}
          className="mt-2 text-sm text-blue-600 hover:text-blue-700"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="divide-y gap-3">
      {users.map((user) => (
        <button
          key={user.id}
          onClick={() => openDirectChat(user)}
          className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
            selectedUser?.id === user.id ? "bg-blue-50 border-l-4 border-blue-600" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${
                selectedUser?.id === user.id ? "bg-blue-600" : "bg-gray-400"
              }`}
            >
              {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
            </div>

            {/* User Info */}
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-gray-900">
                {user.name || "Unknown User"}
              </p>
              <p className="truncate text-xs text-gray-500">{user.email}</p>
            </div>

            {/* Online Indicator (optional) */}
            {user.online && (
              <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}