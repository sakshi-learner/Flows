"use client";

import { useEffect, useRef } from "react";
import { initReteEditor } from "@/lib/rete/editor";
import type { FlowDefinition } from "@/types/flow";

export default function FlowEditorCanvas({
  definition,
  onReady,
}: {
  definition: FlowDefinition;
  onReady: (api: any) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!ref.current) return;

      // ✅ destroy old instance
      apiRef.current?.destroy?.();
      apiRef.current = null;

      // ✅ hard cleanup leftover DOM (prevents duplicate minimaps)
      ref.current.innerHTML = "";

      const api = await initReteEditor({ el: ref.current, definition });

      if (!alive) {
        api.destroy?.();
        return;
      }

      apiRef.current = api;
      onReady(api);
    })().catch(console.error);

    return () => {
      alive = false;
      apiRef.current?.destroy?.();
      apiRef.current = null;

      // ✅ cleanup DOM on unmount/dep change
      if (ref.current) ref.current.innerHTML = "";
    };
  }, [definition, onReady]);

  return (
    <div
      ref={ref}
      style={{ width: "100%", height: "100vh", position: "relative" }}
    />
  );
}