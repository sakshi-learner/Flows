import React from "react";
import { NodeEditor, ClassicPreset } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import { ConnectionPlugin, Presets as ConnectionPresets } from "rete-connection-plugin";
import { ReactPlugin, Presets as ReactPresets } from "rete-react-plugin";
import { createRoot } from "react-dom/client";
import { MinimapExtra, MinimapPlugin } from "rete-minimap-plugin";
import { AutoArrangePlugin, Presets as ArrangePresets } from "rete-auto-arrange-plugin";


import type { FlowDefinition } from "@/types/flow";
import { makeMessageNode, socket, syncButtonOutputs } from "./nodes";
import { uid } from "./id";
import { exportDefinition as exportDef } from "./serializer";

import { TextControlView } from "./controls/TextControlView";
import { ButtonsControlView } from "./controls/ButtonsControlView";


type InitArgs = { el: HTMLElement; definition: FlowDefinition };
type DefButton = { id: string; label: string; next?: string | null };
type DefNode = { text?: string; next?: string | null; buttons?: DefButton[]; position?: { x: number; y: number }; };

function normButtons(list: any): DefButton[] {
  if (!Array.isArray(list)) return [];
  return list
    .filter((x) => x && typeof x === "object")
    .map((x: any) => ({
      id: String(x.id ?? ""),
      label: String(x.label ?? ""),
      next: x.next == null ? null : String(x.next),
    }))
    .filter((b) => b.id.length > 0);
}

function hasOutput(node: any, key: string) {
  const outputs = node.outputs;
  return outputs instanceof Map ? outputs.has(key) : Boolean(outputs?.[key]);
}

function applyNodeSize(n: any) {
  const buttons = Array.isArray(n.data?.buttons) ? n.data.buttons.length : 0;
  n.width = 280;
  n.height =  280+ buttons * 60; 
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

  connection.addPreset(ConnectionPresets.classic.setup());

reactRender.addPreset(
  ReactPresets.classic.setup({
    customize: {
      control(data: any) {
        
        const control = data?.payload;
        if (!control) {
          return ReactPresets.classic.Control;
        }
        const controlId = (control as any).id;

        if (controlId === 'buttons-control') {
          return ButtonsControlView; 
        }
        
        if (controlId === 'text-control') {
          return TextControlView; 
        }

        return ReactPresets.classic.Control;
      },
    },
  })
);
  reactRender.addPreset(ReactPresets.minimap.setup({ size: 150 }));

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl(),
  });

  const AE: any = AreaExtensions as any;
  if (typeof AE.selectableConnections === "function") {
    AE.selectableConnections(area, AE.selector(), {
      accumulating: AE.accumulateOnCtrl(),
    });
  }

  let selectedNodeId: number | null = null;
  let selectedConnId: number | null = null;
  let startNodeId: number | null = null;
  let lastPointer = { x: 200, y: 200 };

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
    return context;
  });


  connection.addPipe((ctx: any) => {
    if (ctx.type === "connectioncreate") {
      const d = ctx.data;
      const source = d?.source;
      const target = d?.target;
      const sourceOutput = String(d?.sourceOutput ?? "");

      if (source != null && target != null && String(source) === String(target)) {
        return; // block
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
  const defNodes: Record<string, DefNode> = (definition?.nodes ?? {}) as any;
  const nodeIds = Object.keys(defNodes);

  const ensureOneNode = async () => {
    const firstId = uid("n");
    const node = makeMessageNode(firstId, "Hello 👋");
    console.log("Created Node: ", node);
    node.meta = node.meta || {};
    node.meta = {
      area: area,
      editor: editor
    };
    applyNodeSize(node);
    await editor.addNode(node);
    await area.translate(node.id, { x: 120, y: 120 });
    nodeIdToEditorNode.set(firstId, node);
    return node;
  };

  if (nodeIds.length === 0) {
    await ensureOneNode();
  } else {
    // 1) create all nodes first
    let i = 0;
    for (const nodeId of nodeIds) {
      const data = defNodes[nodeId] || {};
      const n = makeMessageNode(nodeId, data.text || "");

      n.meta = n.meta || {};
      n.meta = {
        area: area,
        editor: editor
      };

      const buttons = normButtons(data.buttons);
      n.data.buttons = buttons.map((b) => ({ id: b.id, label: b.label, next: b.next ?? null }));

      // outputs must reflect buttons BEFORE connections
      syncButtonOutputs(n, n.data.buttons);


      applyNodeSize(n);
      await editor.addNode(n);
      //await area.translate(n.id, { x: 120 + i * 320, y: 120 });
      nodeIdToEditorNode.set(nodeId, n);

      if (data.position) {
        await area.translate(n.id, data.position);
      } else {
        // Fallback if it's a new node with no saved position
        await area.translate(n.id, { x: 120 + i * 320, y: 120 });
      }
      i++;
    }

    // 2) create connections AFTER all nodes exist
    for (const nodeId of nodeIds) {
      const from = nodeIdToEditorNode.get(nodeId);
      const data = defNodes[nodeId] || {};

      // (A) Continue
      if (data.next && nodeIdToEditorNode.has(String(data.next))) {
        const to = nodeIdToEditorNode.get(String(data.next));
        await editor.addConnection(new ClassicPreset.Connection(from, "next", to, "in"));
        console.log(`Connection created from node ${from.id} to ${to.id}`);
      }

      // (B) Buttons
      const buttons = normButtons(data.buttons);
      for (const b of buttons) {
        if (!b.next) continue;
        const targetId = String(b.next);
        if (!nodeIdToEditorNode.has(targetId)) continue;

        const to = nodeIdToEditorNode.get(targetId);

        const outKey = `btn:${b.id}`;
        if (!hasOutput(from, outKey)) {
          // safety (should already exist due to syncButtonOutputs)
          from.addOutput(outKey, new ClassicPreset.Output(socket, b.label));
        }

        await editor.addConnection(new ClassicPreset.Connection(from, outKey, to, "in"));
      }
    }
  }

  // await triggerLayout();

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
      const hasTarget = !!d?.target;

      if (!hasTarget && d?.source && d?.sourceOutput) {
        queueMicrotask(async () => {
          try {
            const id = uid("n");
            const n = makeMessageNode(id, "New message");
            
            n.meta = {
              area: area,
              editor: editor
            };

            applyNodeSize(n);
            await editor.addNode(n);
            await area.translate(n.id, { x: lastPointer.x, y: lastPointer.y });

            const sourceNode = editor.getNodes().find((x: any) => x.id === d.source);
            if (!sourceNode) return;

            await editor.addConnection(
              new ClassicPreset.Connection(sourceNode, d.sourceOutput, n, "in")
            );


          } catch (e) {
            console.error(e);
          }
        });
      }
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

  const addButtonToSelected = async () => {
    if (!selectedNodeId) return;
    const n = editor.getNodes().find((x: any) => x.id === selectedNodeId);
    if (!n) return;

    const list = Array.isArray(n.data?.buttons) ? n.data.buttons : [];
    const newBtn = { id: uid("b"), label: `Button ${list.length + 1}`, next: null };
    const nextList = [...list, newBtn];

    n.data.buttons = nextList;
    syncButtonOutputs(n, nextList);
    area.update("node", n.id);
  };

  const deleteSelected = async () => {
    if (selectedConnId) {
      const conns = editor.getConnections();
      const c = conns.find((x: any) => x.id === selectedConnId);
      if (c) await editor.removeConnection(c.id);
      selectedConnId = null;
      return;
    }

    if (selectedNodeId) {
      const nodes = editor.getNodes();
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


  return {
    destroy,
    export: exportDefinition,
    layout: triggerLayout,
    addNode,
    addButtonToSelected,
    deleteSelected,
    setStartSelected,
    getSelected: () => ({ selectedNodeId, selectedConnId, startNodeId }),
  };
}
