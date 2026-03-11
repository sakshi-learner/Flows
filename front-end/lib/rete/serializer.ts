import type { FlowDefinition } from "@/types/flow";
type Btn = { id: string; label: string; next?: string | null };

function readTextControl(n: any): string {
  const c = n?.controls?.text;
  if (!c) return "";
  if (typeof c.getValue === "function") return String(c.getValue() ?? "");
  return String(c.value ?? "");
}

export function getNodeId(n: any) {
  return String(n?.data?.nodeId ?? n?.id);
}

export function normalizeButtons(raw: any): Btn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x) => x && typeof x === "object")
    .map((x: any) => ({
      id: String(x.reply?.id ?? x.id ?? ""),
      label: String(x.reply?.title ?? x.label ?? ""),
      next: x.next == null ? null : String(x.next),
    }))
    .filter((b) => b.id.length > 0);
}

export function exportDefinition(
  editor: any,
  area: any,
  startNodeEditorId: any
): any {
  const nodes: any[] = editor.getNodes();
  const conns: any[] = editor.getConnections();

  // editor internal id → logical nodeId
  const editorIdToNodeId = new Map<any, string>();
  for (const n of nodes) editorIdToNodeId.set(n.id, getNodeId(n));

  // start node
  let startNodeId = "";
  if (startNodeEditorId != null) {
    startNodeId = editorIdToNodeId.get(startNodeEditorId) || "";
  }
  if (!startNodeId) startNodeId = editorIdToNodeId.get(nodes[0]?.id) || "";

  // ✅ Nodes array build  — without edges 
  const nodesArray = nodes.map((n) => {
    const nodeId = editorIdToNodeId.get(n.id)!;
    const view = area.nodeViews.get(n.id);
    const position = view
      ? { x: view.position.x, y: view.position.y }
      : { x: 0, y: 0 };

    const nodeDataType = (n.data as any)?.type;


    console.log("nodetypeeeee", nodeDataType);

    // if (nodeDataType === "image") {
    //   const d = n.data as any;
    //   console.log("nodetype imagee or not", nodeDataType);
    //   return {
    //     id: nodeId,
    //     type: "imageMessageNode",
    //     nodeType: "imageMessageNode",
    //     data: {
    //       msgContent: {
    //         type: "image",
    //         image: {
    //           sourceType: d.sourceType ?? "url",
    //           url: d.url ?? "",
    //           variableName: d.variableName ?? "",
    //           caption: d.caption ?? "",
    //           fileName: d.fileName ?? "",
    //         },
    //       },
    //       keyword: [""],
    //     },
    //     position,
    //     position_absolute: position,
    //   };
    // }


    // if (nodeDataType === "image") {
    //   console.log("SAVING IMAGE NODE:", {
    //     nodeData: n.data,
    //     ctrlData: (n.controls as any)?.image?.data,
    //   });
    //   return {
    //     id: nodeId,
    //     type: "imageMessageNode",
    //     nodeType: "imageMessageNode",
    //     data: {
    //       msgContent: {
    //         type: "image",
    //         image: {
    //           link: n.data.url,
    //           caption: n.data.caption,
    //           public_id: n.data.publicId ?? null,
    //           sourceType: n.data.sourceType
    //         }
    //       },
    //       keyword: [""]
    //     },
    //     position,
    //     position_absolute: position
    //   };
    // }

    if (nodeDataType === "image") {
  const imgCtrl = (n.controls as any)?.image;
  // ✅ ctrl.data is always updated by onChange
  const d = imgCtrl?.data ?? n.data;

  return {
    id: nodeId,
    type: "imageMessageNode",
    nodeType: "imageMessageNode",
    data: {
      msgContent: {
        type: "image",
        image: {
          link: d.url ?? "",           // ✅ from ctrl.data
          caption: d.caption ?? "",
          public_id: d.publicId ?? null,
          sourceType: d.sourceType ?? "url",
          fileName: d.fileName ?? "",
        },
      },
      keyword: [""],
    },
    position,
    position_absolute: position,
  };
}

    const text = readTextControl(n);
    const btns = normalizeButtons(n.data?.buttons);
    const hasButtons = btns.length > 0;

    if (hasButtons) {
      return {
        id: nodeId,
        type: "buttonMessageNode",
        nodeType: "buttonMessageNode",
        data: {
          msgContent: {
            type: "interactive",
            interactive: {
              type: "button",
              body: { text },
              action: {
                buttons: btns.map((b) => ({
                  type: "reply",
                  reply: {
                    id: b.id,
                    title: b.label,
                  },
                })),
              },
            },
          },
          keyword: [""],
        },
        position,
        position_absolute: position,
      };
    } else {
      return {
        id: nodeId,
        type: "simpleMessageNode",
        nodeType: "simpleMessageNode",
        data: {
          msgContent: {
            type: "text",
            text: {
              preview_url: true,
              body: text,
            },
          },
          keyword: [""],
        },
        position,
        position_absolute: position,
      };
    }
  });

  // ✅ Edges array — Rete connections se build 
  const edgesArray = conns.map((c) => {
    const sourceNodeId = editorIdToNodeId.get(c.source) || c.source;
    const targetNodeId = editorIdToNodeId.get(c.target) || c.target;
    const sourceOutput = String(c.sourceOutput ?? "");

    // sourceHandle — button ID or node ID
    let sourceHandle: string;
    if (sourceOutput === "next") {
      sourceHandle = sourceNodeId;
    } else if (sourceOutput.startsWith("btn:")) {
      sourceHandle = sourceOutput.replace("btn:", ""); // button ID
    } else {
      sourceHandle = sourceNodeId;
    }

    return {
      id: c.id,
      source: sourceNodeId,
      target: targetNodeId,
      sourceHandle,
    };
  });

  return {
    start_node_id: startNodeId,
    nodes: nodesArray,
    edges: edgesArray,
  };
}