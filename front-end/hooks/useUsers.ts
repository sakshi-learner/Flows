import { useState } from "react";
import { useChat } from "./useChat";

export function useUsers() {
  const { users, loadUsers } = useChat();
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      await loadUsers();
    } finally {
      setLoading(false);
    }
  };

  return { users, refresh, loading };
}
