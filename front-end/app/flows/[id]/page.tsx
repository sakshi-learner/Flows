"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useFlows } from "@/hooks/useFlows";
import type { Flow } from "@/types/flow";
import FlowEditorCanvas from "@/components/FlowEditorCanvas";

export default function FlowEditorPage() {
  const params = useParams<{ id: string }>();
  const flowId = useMemo(() => Number(params?.id), [params?.id]);

  const { get, update, setDefault } = useFlows();
  const [flow, setFlow] = useState<Flow | null>(null);

  const editorApiRef = useRef<any>(null);

  useEffect(() => {
    if (!Number.isFinite(flowId)) return;
    get(flowId).then(setFlow).catch(console.error);
  }, [flowId, get]);

  const onReady = useCallback((api: any) => {
    editorApiRef.current = api;
  }, []);

  const onSave = async () => {
    if (!flow || !editorApiRef.current) return;
    const definition = editorApiRef.current.export();
    await update(flow.id, { name: flow.name, definition });
    alert("Saved ✅");
  };

  const onMakeDefault = async () => {
    if (!flow) return;
    await setDefault(flow.id);
    alert("Default set ✅");
  };

  const onAddNode = async () => {
    if (!editorApiRef.current) return;
    await editorApiRef.current.addNode(200, 200);
  };

  const onAddButton = async () => {
    if (!editorApiRef.current) return;
    await editorApiRef.current.addButtonToSelected();
  };

  const onDelete = async () => {
    if (!editorApiRef.current) return;
    await editorApiRef.current.deleteSelected();
  };

  const onSetStart = () => {
    if (!editorApiRef.current) return;
    editorApiRef.current.setStartSelected();
    alert("Start node updated ✅");
  };


  const onAutoArrange = async () => {
    if (!editorApiRef.current) return;

    await editorApiRef.current.layout();
  };

  if (!Number.isFinite(flowId)) return <div style={{ padding: 16 }}>Invalid flow id</div>;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: 10, borderBottom: "1px solid #ddd", display: "flex", gap: 8, alignItems: "center" }}>
        <b>{flow?.name ?? "Flow"}</b>
        <button
          onClick={onAutoArrange}
          style={{ backgroundColor: '#e1f5fe', border: '1px solid #03a9f4', cursor: 'pointer' }}
        >
          Auto Arrange 
        </button>
        <button onClick={onSave}>Save</button>
        <button onClick={onMakeDefault}>Make Default</button>
        <button onClick={onAddNode}>+ Node</button>
        <button onClick={onAddButton}>+ Button</button>
        <button onClick={onSetStart}>Set Start</button>
        <button onClick={onDelete}>Delete Selected</button>
      </div>


      {flow ? (
        <FlowEditorCanvas definition={flow.definition} onReady={onReady} />
      ) : (
        <div style={{ padding: 16 }}>Loading...</div>
      )}
    </div>
  );
}
