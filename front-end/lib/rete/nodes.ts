import { ClassicPreset } from "rete";
import { ButtonsControl } from "./controls/ButtonsControl";
import { TextControl } from "./controls/TextControl";
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

export async function syncButtonOutputs(node: any, buttons: any[], editor?: any) {
  if (!node) return;

  const baseHeight = 220; 
  const buttonSpacing = 60;
  node.height = baseHeight + (buttons.length * buttonSpacing);

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

