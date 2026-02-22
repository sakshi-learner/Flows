// /hooks/useFlows.ts
"use client";

import { useCallback, useMemo } from "react";
import { api } from "@/lib/api";
import type { Flow } from "@/types/flow";

export function useFlows() {
  const list = useCallback(() => api<Flow[]>("/flows"), []);
  const get = useCallback((id: number) => api<Flow>(`/flows/${id}`), []);
  const create = useCallback((data: Partial<Flow>) => api<Flow>("/flows", { method: "POST", body: data }), []);
  const update = useCallback((id: number, data: Partial<Flow>) => api(`/flows/${id}`, { method: "PUT", body: data }), []);

  const setDefault = useCallback((id: number) => {
    return api(`/flows/${id}/default`, { method: "POST" });
  }, []);

  return useMemo(
    () => ({ list, get, create, update, setDefault }),
    [list, get, create, update, setDefault]
  );
}