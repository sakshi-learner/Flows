"use client";
import { ClassicPreset } from "rete";
import React, { useMemo } from "react";
import styled from "styled-components";
import { Drag } from "rete-react-plugin";
import { syncButtonOutputs, Btn as NodeBtn } from "./nodes";
import { uid } from "./id";


type Btn = { id: string; label: string; next?: string | null };



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

export function MessageNodeView(props: any) {
  const { editor } = props;
  const node = props.data;
  if (!node) return null;

  function getTargetNodeForButton(buttonId: string): any {
    const targetNodeId = buttonId; 
    return editor.getNodes().find((node: any) => node.data.nodeId === targetNodeId);
  }

  const text = String(node.controls?.text?.getValue?.() ?? node.controls?.text?.value ?? "");

  const buttons = useMemo(() => {
    return normalizeButtons(node.data?.buttons);
  }, [node.data?.buttons]);

  const rerender = () => node?.meta?.area?.update?.("node", node.id);

  const setButtons = (next: Btn[]) => {
    node.data.buttons = next;
    syncButtonOutputs(node, next);
    rerender();
  };

  const addBtn = () => {
    setButtons([...buttons, { id: uid("b"), label: `Button ${buttons.length + 1}`, next: null }]);
  };

  const updateLabel = (id: string, label: string) => {
    setButtons(buttons.map((b) => (b.id === id ? { ...b, label } : b)));
  };

  const removeBtn = (id: string) => {
    setButtons(buttons.filter((b) => b.id !== id));
  };

  const updateText = (val: string) => {
    node.controls?.text?.setValue?.(val);
    rerender();
  };

  // Handle Button Click to Trigger Connection
  const handleButtonClick = (buttonId: string) => {
    const outputKey = `btn:${buttonId}`; // Output socket key for the button
    const targetNode = getTargetNodeForButton(buttonId); // Logic to find the target node (this can be dynamic based on button configuration)

    if (targetNode) {
      // Create a connection between the button's output port and the target node's input
      editor.addConnection(new ClassicPreset.Connection(node, outputKey, targetNode, "in"));
    }
  };

  return (
    <Card>
      <Header>
        <span>Send Message</span>
        <NodeId>{node.data?.nodeId ?? ""}</NodeId>
      </Header>

      <Body>
        <Section>
          <SectionLabel>Message</SectionLabel>
          <Drag.NoDrag>
            <Textarea
              value={text}
              onChange={(e) => updateText(e.target.value)}
              placeholder="Type message..."
            />
          </Drag.NoDrag>
        </Section>

        <Section>
          <SectionLabel>Buttons</SectionLabel>
          <ButtonsList>
            {buttons.map((b) => (
              <ButtonRow key={b.id}>
                <Drag.NoDrag>
                  <BtnInput
                    value={b.label}
                    onChange={(e) => updateLabel(b.id, e.target.value)}
                    placeholder="Button label"
                  />
                </Drag.NoDrag>

                {/* Render Button Output Port */}
                <SocketContainer onClick={() => handleButtonClick(b.id)} />
                <Drag.NoDrag>
                  <RemoveButton onClick={() => removeBtn(b.id)} title="Remove">
                    ✕
                  </RemoveButton>
                </Drag.NoDrag>
              </ButtonRow>
            ))}
          </ButtonsList>

          <Drag.NoDrag>
            <AddButton onClick={addBtn}>+ Add Button</AddButton>
          </Drag.NoDrag>
        </Section>

        {/* Socket Ports for Input and Output */}
        <Sockets>
          <SocketContainer ></SocketContainer>
          <SocketContainer></SocketContainer>
        </Sockets>
      </Body>
    </Card>
  );
}

/* ---------------- styled-components ---------------- */

const Card = styled.div`
  width: 280px;
  border: 1px solid #dfe3ea;
  border-radius: 14px;
  background: white;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
`;

const Header = styled.div`
  padding: 10px 12px;
  border-bottom: 1px solid #eef1f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
`;

const NodeId = styled.span`
  font-size: 12px;
  opacity: 0.6;
`;

const Body = styled.div`
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Section = styled.div``;

const SectionLabel = styled.div`
  font-size: 12px;
  opacity: 0.65;
  margin-bottom: 6px;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 68px;
  resize: vertical;
  border-radius: 10px;
  border: 1px solid #e6e9f0;
  padding: 10px;
  outline: none;
`;

const ButtonsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 6px;
`;

const BtnInput = styled.input`
  flex: 1;
  border-radius: 10px;
  border: 1px solid #e6e9f0;
  padding: 8px 10px;
  outline: none;
`;

const RemoveButton = styled.button`
  border-radius: 10px;
  border: 1px solid #e6e9f0;
  padding: 8px 10px;
  cursor: pointer;
  background: #fff;
`;

const AddButton = styled.button`
  margin-top: 8px;
  width: 100%;
  border-radius: 10px;
  border: 1px dashed #cfd6e4;
  padding: 10px 12px;
  cursor: pointer;
  background: #fafbff;
`;

// Sockets with gray color
const Sockets = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const SocketContainer = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #e6e9f0;
  border: 1px solid #cfd6e4;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;