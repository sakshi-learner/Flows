"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Drag } from "rete-react-plugin";

export function TextControlView(props: any) {
  const control = props.data;
  const node = control?.parent;

  const [localValue, setLocalValue] = useState(control?.getValue() || "");

  useEffect(() => {
    setLocalValue(control?.getValue() || "");
  }, [control]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setLocalValue(v); 

    if (control && control.setValue) {
      control.setValue(v);
    }
    
    if (node) {
      node.data.text = v;
      node.meta?.area?.update("control", control.id);
    }
  };

  if (!control) return null;

  return (
    <Wrap>
      <Label>Message</Label>
      
      <Drag.NoDrag>
        <Textarea
          value={localValue}
          onChange={handleChange}
          placeholder="Type message..."
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        />
      </Drag.NoDrag>
    </Wrap>
  );
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 8px;
`;

const Label = styled.div`
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
  opacity: 0.5;
  color: #000;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 40px;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.2);
  padding: 8px;
  font-size: 13px;
  resize: vertical;
  background: white;
  color: black;
  cursor: text; /* Cursor pointer ki jagah text cursor dikhaye */
  
  &:focus {
    outline: 2px solid #4a90e2;
    border-color: transparent;
  }
`;