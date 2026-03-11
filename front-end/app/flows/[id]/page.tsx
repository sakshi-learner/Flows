"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useFlows } from "@/hooks/useFlows";
import type { Flow } from "@/types/flow";
import FlowEditorCanvas from "@/components/FlowEditorCanvas";

const NODE_TYPES = [
  { type: "text",     label: "Text Message",   },
  { type: "button",   label: "Button Message", },
  { type: "image",    label: "Image Message",  },
  { type: "vedio",    label: "Vedio Message",  },
  { type: "Audio",    label: "Audio Message",  },
  { type: "Doc",    label: "Document Message", },
  { type: "Replay Button", label: "Replay Button",  },
 
];

export default function FlowEditorPage() {
  const params = useParams<{ id: string }>();
  const flowId = useMemo(() => Number(params?.id), [params?.id]);

  const { get, update, setDefault } = useFlows();
  const [flow, setFlow] = useState<Flow | null>(null);
  const [showNodeMenu, setShowNodeMenu] = useState(false);
  const [flowName, setFlowName] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const editorApiRef = useRef<any>(null);

  useEffect(() => {
    if (!Number.isFinite(flowId)) return;
    get(flowId).then((f) => { setFlow(f); setFlowName(f?.name ?? ""); }).catch(console.error);
  }, [flowId, get]);

  // Outside click pe menu close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowNodeMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const onReady = useCallback((api: any) => { editorApiRef.current = api; }, []);

  const onSave = async () => {
    if (!flow || !editorApiRef.current) return;
    const definition = editorApiRef.current.export();
    await update(flow.id, { name: flowName || flow.name, definition });
    alert("Saved ✅");
  };

  const onMakeDefault = async () => {
    if (!flow) return;
    await setDefault(flow.id);
    alert("Default set ✅");
  };

  // const onAddButton = async () => {
  //   if (!editorApiRef.current) return;
  //   await editorApiRef.current.addButtonToSelected();
  // };

  const onDelete = async () => {
    if (!editorApiRef.current) return;
    await editorApiRef.current.deleteSelected();
  };

 const onSetStart = () => {
    if (!editorApiRef.current) return;
    editorApiRef.current.setStartSelected();
    console.log(editorApiRef.current.setStartSelected);
    alert("Start node updated ✅");
  };

  const onAutoArrange = async () => {
    if (!editorApiRef.current) return;
    await editorApiRef.current.layout();
  };

  const handleAddNode = async (type: string) => {
    setShowNodeMenu(false);
    if (!editorApiRef.current) return;
    switch (type) {
      case "image":
        await editorApiRef.current.addImageNode?.(300, 300);
        break;
      default:
        await editorApiRef.current.addNode(300, 300);
    }
  };

  if (!Number.isFinite(flowId)) return <div style={{ padding: 16 }}>Invalid flow id</div>;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f8f9fc" }}>

      {/* ── Top Bar ── */}
      <div style={{
        padding: "8px 16px",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        gap: 8,
        alignItems: "center",
        background: "white",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        zIndex: 10,
      }}>
        {/* Back */}
        <a href="/flows" style={{ fontSize: 13, color: "#6366f1", textDecoration: "none", marginRight: 4 }}>
          ← Flow
        </a>

        {/* Flow Name */}
        <input
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
          style={{
            fontSize: 14,
            fontWeight: 600,
            border: "1px solid transparent",
            borderRadius: 6,
            padding: "4px 8px",
            background: "transparent",
            color: "#1e293b",
            outline: "none",
            minWidth: 120,
          }}
          onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
          onBlur={(e) => (e.target.style.borderColor = "transparent")}
        />

        <div style={{ flex: 1 }} />

        {/* Top action buttons */}
        <TopBtn onClick={onMakeDefault}>Make Default</TopBtn>
        <TopBtn onClick={onSetStart}>Set Start</TopBtn>
        {/* <TopBtn onClick={onAddButton}>+ Button</TopBtn> */}
        <TopBtn onClick={onDelete} danger>Delete</TopBtn>
        <TopBtn onClick={onSave} primary>Save</TopBtn>
      </div>

      {/* ── Canvas ── */}
      <div style={{ flex: 1, position: "relative" }}>
        {flow ? (
          <FlowEditorCanvas definition={flow.definition} onReady={onReady} />
        ) : (
          <div style={{ padding: 16, color: "#94a3b8" }}>Loading...</div>
        )}

        {/* ── Bottom Floating Toolbar ── */}
        <div style={{
          position: "absolute",
          bottom: 60,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "white",
          borderRadius: 16,
          padding: "7px 10px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.13)",
          border: "1px solid #e2e8f0",
          zIndex: 100,
        }}>


          {/* Zoom In */}
          <CanvasBtn onClick={() => editorApiRef.current?.zoomIn()} title="Zoom In">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </CanvasBtn>

          {/* Zoom Out */}
         <CanvasBtn onClick={() => editorApiRef.current?.zoomOut()} title="Zoom Out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </CanvasBtn>

          {/* Auto Arrange */}
          <CanvasBtn onClick={onAutoArrange} title="Auto Arrange">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </CanvasBtn>

          {/* Divider */}
          <div style={{ width: 1, height: 24, background: "#e2e8f0", margin: "0 2px" }} />

          {/* ✅ Add Node Button + Dropdown */}
          <div ref={menuRef} style={{ position: "relative" }}>
            <button
              onClick={() => setShowNodeMenu((v) => !v)}
              title="Add Node"
              style={{
                width: 36, height: 36,
                borderRadius: "50%",
                border: "none",
                background: showNodeMenu ? "#4f46e5" : "#6366f1",
                color: "white",
                fontSize: 22,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: showNodeMenu ? "0 0 0 4px rgba(99,102,241,0.25)" : "none",
                transition: "all 0.15s",
              }}
            >
              +
            </button>

            {/* Dropdown */}
            {showNodeMenu && (
              <div style={{
                position: "absolute",
                bottom: "calc(100% + 12px)",
                left: "50%",
                transform: "translateX(-50%)",
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
                minWidth: 210,
                overflow: "hidden",
                zIndex: 9999,
              }}>
                {/* Header */}
                <div style={{
                  padding: "10px 16px",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#94a3b8",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  borderBottom: "1px solid #f1f5f9",
                  background: "#fafafa",
                }}>
                  ADD NODE
                </div>

                {/* Node list */}
                {NODE_TYPES.map((item) => (
                  <div
                    key={item.type}
                    onClick={() => handleAddNode(item.type)}
                    style={{
                      padding: "9px 16px",
                      fontSize: 13,
                      color: "#1e293b",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = "transparent";
                    }}
                  >
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helper Components ──

function TopBtn({ children, onClick, primary, danger }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px",
        fontSize: 13,
        fontWeight: 500,
        borderRadius: 8,
        border: primary ? "none" : danger ? "1px solid #fecaca" : "1px solid #e2e8f0",
        background: primary ? "#6366f1" : danger ? "#fff5f5" : "white",
        color: primary ? "white" : danger ? "#ef4444" : "#475569",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        if (primary) el.style.background = "#4f46e5";
        else if (danger) el.style.background = "#fee2e2";
        else el.style.background = "#f8fafc";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        if (primary) el.style.background = "#6366f1";
        else if (danger) el.style.background = "#fff5f5";
        else el.style.background = "white";
      }}
    >
      {children}
    </button>
  );
}

function CanvasBtn({ children, onClick, title }: any) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 34, height: 34,
        borderRadius: 9,
        border: "1px solid #e2e8f0",
        background: "white",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#475569",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "white"; }}
    >
      {children}
    </button>
  );
}