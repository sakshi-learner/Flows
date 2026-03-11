import { ClassicPreset } from "rete";
import { ButtonsControl } from "./controls/ButtonsControl";
import { TextControl } from "./controls/TextControl";
import { ImageControl } from "./controls/imageControl";
export const socket = new ClassicPreset.Socket("socket");

export type Btn = { id: string; label: string; next?: string | null };
export type NodeData = { nodeId: string; buttons: Btn[] };

export function makeMessageNode(nodeId: string, text = "", buttons: Btn[] = []) {
  const node: any = new ClassicPreset.Node("Send Message");
  

  node.data = { nodeId, text, buttons };
  node.addInput("in", new ClassicPreset.Input(socket, "In", true));

  const textControl = new TextControl(text);
  node.addControl("text", textControl);

  node.addOutput("next", new ClassicPreset.Output(socket, "Continue"));

  const buttonsControl = new ButtonsControl(buttons);
  buttonsControl.parent = node;
  node.addControl("buttons", buttonsControl);

  syncButtonOutputs(node, buttons);
  return node;
}

// export function makeImageNode(nodeId: string) {
//   console.log("makeImageNode is called");
//   const node = new ClassicPreset.Node("Send Image");
//   node.data = {
//     nodeId,
//     type: "image",
//     sourceType: "url",
//     url: "",
//     caption: "",
//     variableName: "",
//     fileName: "",
//   } as any;
//   node.addInput("in", new ClassicPreset.Input(socket, "in"));
//   node.addOutput("next", new ClassicPreset.Output(socket, "next"));
//   const ctrl = new ImageControl(
//     nodeId,
//     {
//       sourceType: "url",
//       url: "",
//       caption: "",
//       variableName: "",
//       fileName: "",
//     },
//     (patch) => {
//       Object.assign(node.data as any, patch);
//       Object.assign(ctrl.data, patch);
//     },
//     () => {
//       // Node height recalculate
//       const d = node.data as any;
//       const hasPreview = (d.sourceType === "url" || d.sourceType === "upload") && d.url;
//       node.height = hasPreview ? 440 : 300;
//     }
//   );
//   node.addControl("image", ctrl);
//   node.width = 280;
//   node.height = 300;
//   return node;
// }

export function makeImageNode(nodeId: string, existingData?: any ,) {
  const node = new ClassicPreset.Node("Send Image");

  // 1. Initialize data with defaults OR existing data from DB
  node.data = {
    nodeId,
    type: "image",
    sourceType: existingData?.sourceType || "url",
    url: existingData?.url || "",
    caption: existingData?.caption || "",
    publicId: existingData?.publicId || null, 
    fileName: existingData?.fileName || "",
  } as any;

  node.addInput("in", new ClassicPreset.Input(socket, "in"));
  node.addOutput("next", new ClassicPreset.Output(socket, "next"));

  // 2. Pass the ACTUAL node.data reference to the control
  const ctrl = new ImageControl(
    nodeId,
    node.data as any, // Use the reference
    (patch) => {
      // Update both references
      Object.assign(node.data as any, patch);
      // If ImageControl doesn't use the same ref, update it too
      if(ctrl.data !== node.data) Object.assign(ctrl.data, patch);
    },
    () => {
      const d = node.data as any;
      node.height = d.url ? 440 : 300;
    }
  );

  node.addControl("image", ctrl);
  return node;
}

export async function syncButtonOutputs(node: any, buttons: any[], editor?: any) {
  if (!node) return;

  const requiredKeys = new Set(buttons.map((b) => `btn:${b.id}`));
  const currentKeys = Object.keys(node.outputs).filter(k => k.startsWith("btn:"));

  for (const key of currentKeys) {
    if (!requiredKeys.has(key)) {
      if (editor) {
        const conns = editor.getConnections().filter(
          (c: any) => c.source === node.id && c.sourceOutput === key
        );
        for (const c of conns) await editor.removeConnection(c.id);
      }
      node.removeOutput(key);
    }
  }

  for (const b of buttons) {
    const key = `btn:${b.id}`;
    if (!node.outputs[key]) {
      node.addOutput(key, new ClassicPreset.Output(socket, b.label));
    } else {
      node.outputs[key].label = b.label;
    }
  }

  if (node.meta?.area) {
    const area = node.meta.area;
    await area.update("node", node.id); 
    const nodeView = area.nodeViews.get(node.id);
    if (nodeView) {
      nodeView.translate(nodeView.position.x, nodeView.position.y);
    }
  }
}

