"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function SuccessPage() {
  const router = useRouter();
  const { verifyAuth } = useAuth();

  useEffect(() => {
    (async () => {
      await verifyAuth();
      router.replace("/chat");
    })();
  }, [verifyAuth, router]);

  return <p>Login successful…</p>;
}
