"use client";

import React from "react";
import styled from "styled-components";
import { Drag } from "rete-react-plugin";
import { uid } from "../id";
import { syncButtonOutputs } from "../nodes";

export function ButtonsControlView(props: any) {
  
  const control = props.data;
  const node = control?.parent || props.node || props.parent;
  
  const [, setTick] = React.useState(0);

  const buttons = (control?.buttons && control.buttons.length > 0) 
    ? control.buttons 
    : (node?.data?.buttons || []);

  const updateNode = async (nextButtons: any[]) => {
    console.log("Updating Node with:", nextButtons);

    if (control) {
      control.buttons = nextButtons;
      if (typeof control.setButtons === 'function') {
        control.setButtons(nextButtons);
      }
    }

    if (node) {
      node.data.buttons = nextButtons;

      const editor = node.meta?.editor;
      const area = node.meta?.area;

      try {
        await syncButtonOutputs(node, nextButtons, editor);
      } catch (err) {
        console.error("syncButtonOutputs failed:", err);
      }

      if (area) {
        await area.update("node", node.id);
        const nodeView = area.nodeViews.get(node.id);
        if (nodeView) {
          nodeView.translate(nodeView.position.x, nodeView.position.y);
        }
      }
    }
    
    // React UI re-render
    setTick(t => t + 1);
  };

  const addButton = () => {
    const currentList = buttons;
    const newBtn = { 
      id: uid("b"), 
      label: `Button ${currentList.length + 1}`, 
      next: null 
    };
    
    updateNode([...currentList, newBtn]);
  };

  const removeButton = (id: string) => {
    updateNode(buttons.filter((b: any) => b.id !== id));
  };

  const updateLabel = (id: string, label: string) => {
    const next = buttons.map((b: any) => b.id === id ? { ...b, label } : b);
    updateNode(next);
  };

  if (control) {
    control.removeButton = removeButton;
    control.updateLabel = updateLabel;
  }

  return (
    <Wrap onPointerDown={e => e.stopPropagation()}>
      <Label>BUTTONS</Label>
      <Drag.NoDrag>
        {/* {buttons.map((btn: any) => (
          <BtnRow key={btn.id}>
            <Input
              value={btn.label}
              onChange={e => updateLabel(btn.id, e.target.value)}
              placeholder="Button text"
            />
            <DelBtn onClick={() => removeButton(btn.id)}>✕</DelBtn>
          </BtnRow>
        ))} */}
        <AddBtn onClick={addButton}>+ Add Button</AddBtn>
      </Drag.NoDrag>
    </Wrap>
  );
}

const Wrap = styled.div` padding: 10px; border-top: 1px solid rgba(0,0,0,0.05);`;
const Label = styled.div` font-size: 10px; font-weight: bold; opacity: 0.4; margin-bottom: 6px; letter-spacing: 0.5px; `;
const BtnRow = styled.div` display: flex; gap: 4px; margin-bottom: 5px; align-items: center; height:40px`;
const Input = styled.input` flex: 1; padding: 5px 8px; border: 1px solid rgba(0,0,0,0.1); border-radius: 4px; font-size: 12px; background: white; color: black; &:focus { outline: none; border-color: #4a90e2; } `;
const DelBtn = styled.button` background: #fff0f0; color: #ff4d4f; border: 1px solid #ffd6d6; border-radius: 4px; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 10px; &:hover { background: #ff4d4f; color: white; } `;
const AddBtn = styled.button` width: 100%; margin-top: 5px; padding: 6px; cursor: pointer; background: transparent; border: 1px dashed rgba(0,0,0,0.2); border-radius: 6px; font-size: 11px; color: #666; font-weight: 500; &:hover { background: rgba(0,0,0,0.02); border-color: #4a90e2; color: #4a90e2; } `;