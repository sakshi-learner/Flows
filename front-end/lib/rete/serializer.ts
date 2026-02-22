import type { FlowDefinition } from "@/types/flow";

type Btn = { id: string; label: string; next?: string | null };

export function getNodeId(n: any) {
  return String(n?.data?.nodeId || n?.label || n?.id);
}

function readTextControl(n: any): string {
  const c = n?.controls?.text;
  if (!c) return "";
  if (typeof c.getValue === "function") return String(c.getValue() ?? "");
  return String(c.value ?? "");
}

function normalizeButtons(raw: any): Btn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x) => x && typeof x === "object")
    .map((x: any) => ({
      id: String(x.id ?? ""),
      label: String(x.label ?? ""),
      next: x.next == null ? null : String(x.next),
    }))
    .filter((b) => b.id.length > 0);
}

export function exportDefinition(editor: any, area: any, startNodeEditorId: number | null): FlowDefinition {
  const nodes: any[] = editor.getNodes();
  const conns: any[] = editor.getConnections();

  const editorIdToNodeId = new Map<number, string>();
  for (const n of nodes) editorIdToNodeId.set(n.id, getNodeId(n));

  let start = "";
  if (startNodeEditorId != null) start = editorIdToNodeId.get(startNodeEditorId) || "";
  if (!start) start = editorIdToNodeId.get(nodes[0]?.id) || "start";

  const out: FlowDefinition = { start, nodes: {} };

  const findTarget = (sourceEditorId: number, sourceOutputKey: string) => {
    const list = conns.filter(
      (x) => x.source === sourceEditorId && x.sourceOutput === sourceOutputKey
    );

    if (list.length > 1) {
      console.warn("Multiple connections from same output:", {
        sourceEditorId,
        sourceOutputKey,
        count: list.length
      });
    }

    const c = list[list.length - 1];
    return c ? (editorIdToNodeId.get(c.target) || null) : null;
  };

  for (const n of nodes) {
    const nodeId = editorIdToNodeId.get(n.id)!;

    const view = area.nodeViews.get(n.id);
    const position = view ? { x: view.position.x, y: view.position.y } : { x: 0, y: 0 };

    const text = readTextControl(n);
    const btns = normalizeButtons(n.data?.buttons);
    const next = findTarget(n.id, "next");

    const buttons = btns.map((b) => ({
      id: b.id,
      label: b.label,
      next: findTarget(n.id, `btn:${b.id}`), // ✅ connection lookup
    }));

out.nodes[nodeId] = {
      type: "message",
      text: readTextControl(n),
      next: findTarget(n.id, "next"),
      buttons: normalizeButtons(n.data?.buttons).map(b => ({
        id: b.id,
        label: b.label,
        next: findTarget(n.id, `btn:${b.id}`),
      })),
      position: position 
    };  }

  console.log("Node positions: ", nodes.map(n => ({ id: n.id, position: n.position })));

  return out;
}