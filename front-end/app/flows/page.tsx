"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFlows } from "@/hooks/useFlows";
import type { Flow } from "@/types";

export default function FlowsPage() {
  const { list } = useFlows();
  const router = useRouter();
  const [flows, setFlows] = useState<Flow[]>([]);

  useEffect(() => {
    list().then(setFlows).catch(console.error);
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1>My Flows</h1>

      <button onClick={() => router.push("/flows/new")} style={{ marginBottom: 12 }}>
        ➕ Create New Flow
      </button>

      {flows.map((f) => (
        <div
          key={f.id}
          style={{
            cursor: "pointer",
            padding: 10,
            border: "1px solid #eee",
            marginBottom: 8,
            borderRadius: 8,
          }}
          onClick={() => router.push(`/flows/${f.id}`)}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{f.name}</span>
            <span style={{ fontSize: 12, opacity: 0.7 }}>
              {f.is_active || (f as any).is_default ? "✅ Default" : ""}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}