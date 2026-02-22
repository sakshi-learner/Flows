"use client";

import { AuthProvider, useAuthContext } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { ChatProvider } from "@/context/ChatContext";
import './globals.css';

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SocketWrapper>{children}</SocketWrapper>
    </AuthProvider>
  );
}

// ✅ Separate component to access auth context
function SocketWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuthContext();

  // ✅ Don't render socket provider until auth check is done
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <SocketProvider enabled={isAuthenticated}>
      <ChatProvider>{children}</ChatProvider>
    </SocketProvider>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}