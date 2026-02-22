"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFlows } from "@/hooks/useFlows";
import type { FlowDefinition } from "@/types/flow";

export default function NewFlowPage() {
  const router = useRouter();
  const { create } = useFlows();
  const [name, setName] = useState("");

  const createFlow = async () => {
    const def: FlowDefinition = {
      start: "n1",
      nodes: {
        n1: {
          type: "message",
          text: "Hello 👋",
          next: null,
          buttons: [
            { id: "btn1", label: "Button 1", next: null },
          ],
        },
      },
    };

    const flow = await create({
      name: name || "Untitled Flow",
      definition: def,
    });

    router.push(`/flows/${flow.id}`);
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>Create New Flow</h1>

      <input
        placeholder="Flow name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={createFlow} style={{ marginLeft: 8 }}>
        Create
      </button>
    </div>
  );
}