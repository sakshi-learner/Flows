import { NodeEditor, ClassicPreset } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import { ConnectionPlugin, Presets as ConnectionPresets } from "rete-connection-plugin";
import { ReactPlugin, Presets as ReactPresets } from "rete-react-plugin";
import { createRoot } from "react-dom/client";
import { MinimapPlugin } from "rete-minimap-plugin";
import { AutoArrangePlugin, Presets as ArrangePresets } from "rete-auto-arrange-plugin";
import { CustomNode } from "./controls/CustomNode";
import type { FlowDefinition } from "@/types/flow";
import { makeMessageNode, socket, syncButtonOutputs , makeImageNode} from "./nodes";
import { uid } from "./id";
import { exportDefinition as exportDef } from "./serializer";
import { TextControlView } from "./controls/TextControlView";
import { ButtonsControlView } from "./controls/ButtonsControlView";
import { CustomSocket } from "./controls/CustomSocket";
import { CustomConnection } from "./controls/CustomConnection";
import { addCustomBackground } from "./controls/CustomBackground";
import { normalizeButtons } from "./serializer";
import { ImageControlView } from "./controls/imageControlView";


type InitArgs = { el: HTMLElement; definition: FlowDefinition };
type DefButton = { id: string; label: string; next?: string | null };
type DefNode = { text?: string; next?: string | null; buttons?: DefButton[]; position?: { x: number; y: number }; };



function hasOutput(node: any, key: string) {
  const outputs = node.outputs;
  return outputs instanceof Map ? outputs.has(key) : Boolean(outputs?.[key]);
}

function applyNodeSize(n: any) {
  const buttons = Array.isArray(n.data?.buttons) ? n.data.buttons.length : 0;
  n.width = 280;
  n.height = 280 + buttons * 40;
}

export async function initReteEditor({ el, definition }: InitArgs) {
  const editor: any = new NodeEditor();
  const area: any = new AreaPlugin(el);
  const connection: any = new ConnectionPlugin();
  const reactRender: any = new ReactPlugin({ createRoot });
  const minimap = new MinimapPlugin<any>({
    boundViewport: true
  });
  const arrange = new AutoArrangePlugin<any, any>();

  arrange.addPreset(ArrangePresets.classic.setup());

  addCustomBackground(area);

  editor.use(area);
  area.use(connection);
  area.use(reactRender);
  area.use(minimap);
  area.use(arrange);

  const triggerLayout = async () => {
    await arrange.layout();
    const nodes = editor.getNodes();
    if (nodes.length > 0) {
      await AreaExtensions.zoomAt(area, nodes, {
        margin: 100,
        maxScale: 0.6,
      });
    }
  };


  const selectedConnIds = new Set<string>();
  function createSelectableConnection(
    selector: any,
    accumulating: any,
    area: any,
    editor: any
  ) {
    return function SelectableConnection(props: any) {
      return (
        <CustomConnection
          {...props}
          isSelected={selectedConnIds.has(props.data.id)}
          onDelete={async (id: string) => {
            await editor.removeConnection(id);
            selectedConnIds.delete(id);

          }}
          click={() => {
            selector.add(
              {
                id: props.data.id,
                label: "connection",
                translate() { },
                unselect() {
                  selectedConnIds.delete(props.data.id);
                  area.update("connection", props.data.id);
                },
              },
              accumulating.active()
            );
            selectedConnIds.add(props.data.id);
            area.update("connection", props.data.id);
          }}
        />
      );
    };
  }


  const selector = AreaExtensions.selector();
  const accumulating = AreaExtensions.accumulateOnCtrl();
  AreaExtensions.selectableNodes(area, selector, { accumulating });

  const SelectableConnection = createSelectableConnection(selector, accumulating, area, editor);

  connection.addPreset(ConnectionPresets.classic.setup());
  reactRender.addPreset(
    ReactPresets.classic.setup({
      customize: {
        node(context: any) {
          if (context.payload.label === "Send Message") {
            return CustomNode;
          }
          if (context.payload.label === "Send Image"){
            console.log("send Image node custom node");
            return CustomNode;
          }
          return ReactPresets.classic.Node;
        },
        socket(context: any) {
          // console.log("socket context", context);
          const nodeId = context.nodeId;
          const key = context.key;
          const socketKey = nodeId && key ? getSocketKey(nodeId, key) : null;
          const isconnected = socketKey ? connectedSockets.has(socketKey) : false;
          const side = context.side;
          return function BoundSocket(props: any) {
            return <CustomSocket {...props} isconnected={isconnected} side={side} />;
          };
        },
        connection(context: any) {
          return SelectableConnection;
        },
        control(data: any) {
          const control = data.payload;
          console.log("data for control",data);
          if (control.id === 'buttons-control') {
            console.log("button control render")
            return ButtonsControlView;
          }
          if (control.id === 'text-control'){
            console.log("textControl render!")
            return TextControlView;
          }
          if (control.id === "image-control") {
            console.log("image control data",control.id)
            console.log("image control view !!!");
            return ImageControlView;
          }
          return ReactPresets.classic.Control;
        }
      }
    })
  );
  reactRender.addPreset(ReactPresets.minimap.setup({ size: 150 }));
  AreaExtensions.simpleNodesOrder(area);

  let selectedNodeId: number | null = null;
  let selectedConnId: number | null = null;
  let startNodeId: number | null = null;
  let lastPointer = { x: 200, y: 200 };

  const connectedSockets = new Set<string>();

  function getSocketKey(nodeId: string, portKey: string) {
    return `${nodeId}:${portKey}`;
  }


  // Connections track 
  editor.addPipe((context: any) => {
    if (context.type === "connectioncreated") {
      const c = context.data;
      connectedSockets.add(getSocketKey(c.source, c.sourceOutput));
      connectedSockets.add(getSocketKey(c.target, c.targetInput));
      // Re-render affected nodes
      area.update("node", c.source);
      area.update("node", c.target);
    }
    if (context.type === "connectionremoved") {
      const c = context.data;
      // Check karo koi aur connection toh nahi us socket pe
      const remaining = editor.getConnections();
      const srcStillConnected = remaining.some(
        (x: any) => x.source === c.source && x.sourceOutput === c.sourceOutput
      );
      const tgtStillConnected = remaining.some(
        (x: any) => x.target === c.target && x.targetInput === c.targetInput
      );
      if (!srcStillConnected) connectedSockets.delete(getSocketKey(c.source, c.sourceOutput));
      if (!tgtStillConnected) connectedSockets.delete(getSocketKey(c.target, c.targetInput));
      area.update("node", c.source);
      area.update("node", c.target);
    }
    return context;
  });

  area.addPipe((context: any) => {
    if (context.type === "nodepicked") {
      selectedNodeId = context.data?.id ?? null;
      selectedConnId = null;
    }
    if (context.type === "connectionpicked") {
      selectedConnId = context.data?.id ?? null;
      selectedNodeId = null;
    }
    if (context.type === "pointermove") {
      const p = context.data?.position;
      if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) lastPointer = p;
    }

    if (context.type === "pointerdown") {
      if (context.data.type === "render") {
        selectedConnId = null;
        selectedNodeId = null;
        selectedConnIds.clear();
        editor.getConnections().forEach((c: any) => area.update("connection", c.id));
      }
    }
    return context;
  });

  connection.addPipe((ctx: any) => {
    if (ctx.type === "connectioncreate") {
      const d = ctx.data;
      const source = d?.source;
      const target = d?.target;
      const sourceOutput = String(d?.sourceOutput ?? "");
      if (source != null && target != null && String(source) === String(target)) {
        return;
      }

      const restrict = sourceOutput === "next" || sourceOutput.startsWith("btn:");
      if (!restrict) return ctx;

      const existing = editor.getConnections().filter((c: any) =>
        c.source === source && String(c.sourceOutput) === sourceOutput
      );

      if (existing.length) {
        queueMicrotask(async () => {
          for (const c of existing) await editor.removeConnection(c.id);
        });
      }

    }
    return ctx;
  });
  
  // ---------- LOAD ----------
  const nodeIdToEditorNode = new Map<string, any>();

  const rawNodes = definition?.nodes ?? [];
  const rawEdges = (definition as any)?.edges ?? [];

  function extractNodeData(defNode: any) {
    if (defNode.data?.msgContent) {
      const mc = defNode.data.msgContent;

      if (mc.type === "text") {
        return {
          text: mc.text?.body ?? "",
          buttons: [],
          position: defNode.position ?? null,
        };
      }

      if (mc.type === "interactive") {
        const rawBtns = mc.interactive?.action?.buttons ?? [];
        const buttons = rawBtns.map((b: any) => ({
          id: b.reply?.id ?? b.id,
          label: b.reply?.title ?? b.label,
        }));
        return {
          text: mc.interactive?.body?.text ?? "",
          buttons,
          position: defNode.position ?? null,
        };
      }
    }
    return { text: "", buttons: [], position: defNode.position ?? null };
  }

  const ensureOneNode = async () => {
    const firstId = uid("n");
    const node = makeMessageNode(firstId, "Hello 👋");
    node.meta = { area, editor };
    applyNodeSize(node);
    await editor.addNode(node);
    await area.translate(node.id, { x: 120, y: 120 });
    nodeIdToEditorNode.set(firstId, node);
    return node;
  };

  if (!Array.isArray(rawNodes) || rawNodes.length === 0) {
    await ensureOneNode();
  } else {
    // 1) Saare nodes banao
    let i = 0;
    for (const defNode of rawNodes) {
  const nodeId = String(defNode.id);
  const { text, buttons, position } = extractNodeData(defNode);
  const nodeType = defNode.nodeType ?? defNode.type;

  console.log("node typeeeeessss", defNode,",,,,,,,,,,,,,,",nodeType)
  let n: any;

  // ✅ nodeType se sahi node banao
  if (nodeType === "imageMessageNode") {
    n = makeImageNode(nodeId);
    // Image data restore karo
    const img = defNode.data?.msgContent?.image;
     if (img) {
    const restored = {
      sourceType: img.sourceType ?? "url",
      url: img.link ?? "",        
      caption: img.caption ?? "",
      publicId: img.public_id ?? null,
      fileName: img.fileName ?? "",
      variableName: "",
    };
    Object.assign(n.data, restored);
    const ctrl = (n.controls as any)?.image;
    if (ctrl) Object.assign(ctrl.data, restored);
  }
  } else if (nodeType === "buttonMessageNode") {
    n = makeMessageNode(nodeId, text, []);
    const normBtns = normalizeButtons(buttons);
    n.data.buttons = normBtns.map((b: any) => ({
      id: b.id, label: b.label, next: null,
    }));
    syncButtonOutputs(n, n.data.buttons);
  } else {
    // simpleMessageNode / default
    n = makeMessageNode(nodeId, text, []);
  }

  n.meta = { area, editor };
  applyNodeSize(n);
  await editor.addNode(n);
  nodeIdToEditorNode.set(nodeId, n);

  if (position) {
    await area.translate(n.id, position);
  } else {
    await area.translate(n.id, { x: 120 + i * 320, y: 120 });
  }
  i++;
}
    // 2) Edges se connections banao
    for (const edge of rawEdges) {
      const sourceNodeId = String(edge.source);
      const targetNodeId = String(edge.target);
      const sourceHandle = String(edge.sourceHandle ?? "");

      const from = nodeIdToEditorNode.get(sourceNodeId);
      const to = nodeIdToEditorNode.get(targetNodeId);

      if (!from || !to) continue;

      // sourceHandle === sourceNodeId → continue/next connection
      // sourceHandle === button ID → button connection
      if (sourceHandle === sourceNodeId) {
        // ✅ Continue connection
        await editor.addConnection(
          new ClassicPreset.Connection(from, "next", to, "in")
        );
      } else {
        // ✅ Button connection — sourceHandle is button ID
        const outKey = `btn:${sourceHandle}`;
        if (!hasOutput(from, outKey)) {
          // Button output already hona chahiye syncButtonOutputs se
          // Safety ke liye add karo
          const btn = from.data?.buttons?.find((b: any) => b.id === sourceHandle);
          from.addOutput(outKey, new ClassicPreset.Output(socket, btn?.label ?? ""));
        }
        await editor.addConnection(
          new ClassicPreset.Connection(from, outKey, to, "in")
        );
      }
    }
  }

  // Start node
  const def = definition as any;
  const startId = def?.start_node_id ?? def?.start;
  if (startId) {
    const startN = editor.getNodes().find(
      (n: any) => String(n.data?.nodeId) === String(startId)
    );
    if (startN) startNodeId = startN.id;
  }
  if (startNodeId == null) startNodeId = editor.getNodes()[0]?.id ?? null;

  // ---------- start node ----------
  if (definition?.start) {
    const startN = editor.getNodes().find((n: any) => String(n.data?.nodeId) === String(definition.start));
    if (startN) startNodeId = startN.id;
  }
  if (startNodeId == null) startNodeId = editor.getNodes()[0]?.id ?? null;

  // ---------- Drop create node ----------
  connection.addPipe((context: any) => {
    if (context.type === "connectiondrop") {
      const d = context.data;

      // Socket pe successfully connected 
      if (d?.created) return context;

      if (!d?.initial?.nodeId || !d?.initial?.key) return context;

      const sourceNodeId = d.initial.nodeId;
      const sourceOutput = d.initial.key;

      // ✅ lastPointer se check karo koi node hai kya wahan
      const targetNode = editor.getNodes().find((node: any) => {
        if (node.id === sourceNodeId) return false; // self loop skip
        const view = area.nodeViews.get(node.id);
        if (!view) return false;
        const pos = view.position;
        return (
          lastPointer.x >= pos.x &&
          lastPointer.x <= pos.x + (node.width ?? 280) &&
          lastPointer.y >= pos.y &&
          lastPointer.y <= pos.y + (node.height ?? 300)
        );
      });

      queueMicrotask(async () => {
        try {
          const sourceNode = editor.getNodes().find((x: any) => x.id === sourceNodeId);
          if (!sourceNode) return;

          // Existing connection hatao
          const existingConns = editor.getConnections().filter(
            (c: any) => c.source === sourceNodeId && c.sourceOutput === sourceOutput
          );
          for (const c of existingConns) await editor.removeConnection(c.id);

          if (targetNode) {
            // ✅ Node pe drop hua — us node se connect karo
            await editor.addConnection(
              new ClassicPreset.Connection(sourceNode, sourceOutput, targetNode, "in")
            );
          } else {
            // ✅ Empty canvas pe drop — naya node banao
            const id = uid("n");
            const n = makeMessageNode(id, "New message");
            n.meta = { area, editor };
            applyNodeSize(n);
            await editor.addNode(n);
            await area.translate(n.id, {
              x: lastPointer.x - 140,
              y: lastPointer.y - 20,
            });
            await editor.addConnection(
              new ClassicPreset.Connection(sourceNode, sourceOutput, n, "in")
            );
          }
        } catch (e) {
          console.error(e);
        }
      });
    }
    return context;
  });
  // ---------------- API ----------------
  const addNode = async (x = 200, y = 200) => {
    const id = uid("n");
    const n = makeMessageNode(id, "New message");
    n.meta = {
      area: area,
      editor: editor
    };

    applyNodeSize(n);
    await editor.addNode(n);
    await area.translate(n.id, { x, y });
    await AreaExtensions.zoomAt(area, editor.getNodes(), {
      margin: 150,
      maxScale: 0.6
    });
    return n;
  };

  const addImageNode = async (x = 200, y = 200) => {
  const id = uid("n");
  const n = makeImageNode(id);
  n.meta = { area, editor } as any;
  await editor.addNode(n);
  await area.translate(n.id, { x, y });
  await AreaExtensions.zoomAt(area, editor.getNodes(), {
    margin: 150, maxScale: 0.6,
  });
  return n;
};


  // const addButtonToSelected = async () => {
  //   if (!selectedNodeId) return;
  //   const n = editor.getNodes().find((x: any) => x.id === selectedNodeId);
  //   if (!n) return;

  //   const list = Array.isArray(n.data?.buttons) ? n.data.buttons : [];
  //   const newBtn = { id: uid("b"), label: `Button ${list.length + 1}`, next: null };
  //   const nextList = [...list, newBtn];

  //   n.data.buttons = nextList;
  //   syncButtonOutputs(n, nextList);
  //   area.update("node", n.id);
  // };

  const deleteSelected = async () => {
    if (selectedConnIds.size > 0) {
      for (const id of selectedConnIds) {
        await editor.removeConnection(id);
      }
      selectedConnIds.clear();
      return;
    }
    if (selectedConnId) {
      const c = editor.getConnections().find((x: any) => x.id === selectedConnId);
      if (c) await editor.removeConnection(c.id);
      selectedConnId = null;
      return;
    }

    if (selectedNodeId) {
      const relatedConns = editor.getConnections().filter(
        (c: any) => c.source === selectedNodeId || c.target === selectedNodeId
      );
      for (const c of relatedConns) {
        await editor.removeConnection(c.id);
      }

      console.log("selected Node", selectedNodeId);
      const nodes = editor.getNodes();
      console.log("nodes", nodes);
      const n = nodes.find((x: any) => x.id === selectedNodeId);
      if (n) await editor.removeNode(n.id);
      if (startNodeId === selectedNodeId) startNodeId = editor.getNodes()[0]?.id ?? null;
      selectedNodeId = null;
    }
  };

  const setStartSelected = () => {
    if (!selectedNodeId) return;
    startNodeId = selectedNodeId;
  };

  const exportDefinition = () => exportDef(editor, area, startNodeId);

  const destroy = () => {
    area.destroy();
  };

  setTimeout(async () => {
    const nodes = editor.getNodes();
    if (nodes.length > 0) {
      await AreaExtensions.zoomAt(area, nodes, {
        margin: 100,
        maxScale: 0.6,
      });
    }
  }, 100);

  const zoomIn = async () => {
    const currentZoom = area.area.transform.k;
    await area.area.zoom(currentZoom * 1.2, 0, 0);
  };

  const zoomOut = async () => {
    const currentZoom = area.area.transform.k;
    await area.area.zoom(currentZoom * 0.8, 0, 0);
  };

  return {
    destroy,
    export: exportDefinition,
    zoomOut,
    zoomIn,
    layout: triggerLayout,
    addNode,
    addImageNode,
    // addButtonToSelected,
    deleteSelected,
    setStartSelected,
    getSelected: () => ({ selectedNodeId, selectedConnId, startNodeId }),
  };
}
