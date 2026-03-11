import React from "react";
import { Presets } from "rete-react-plugin";
import styled from "styled-components";

const { RefSocket, RefControl } = Presets.classic;

const NodeBox = styled.div<{ selected?: boolean }>`
  background:  #ffffff;
  border: 2px solid ${(props) => (props.selected ? "#6366f1" : "#e2e8f0")};
  z-index: ${(props) => (props.selected ? 100 : 1)};
  border-radius: 12px;
  min-width: 300px;
  position: relative;
  padding: 25px 15px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  overflow: visible !important;
   &:hover, &:active {
    z-index: 9999 !important;
  }
  &:hover {
   transform: scale(1);
   border-color: ${(props) => (props.selected ? "#6366f1" : "#4c58bf")};
  }  
`;

export function CustomNode(props: any) {
  const { data, emit } = props;
  const selected = props.data.selected;
  const { inputs, outputs, controls } = data;
  const buttonsList = data.data.buttons || [];
  const nodeType = data.data?.type;

  // ✅ Image node alag render karo
  const isImageNode = nodeType === "image";

  return (
    <NodeBox selected={selected}>

      {/* IN Socket */}
      {inputs.in && (
        <div style={{ position: 'absolute', top: '15px', left: '-9px', zIndex: 100 }}
          onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
        >
          <RefSocket name="in" side="input" socketKey="in"
            nodeId={data.id} emit={emit} payload={inputs.in.socket}
          />
        </div>
      )}

      {/* Node Title */}
      <div style={{
        color: 'white', background: '#6366f1',
        textAlign: 'center', marginBottom: '15px', fontWeight: 'bold'
      }}>
        {data.label}
      </div>

      {/* ✅ Image control — only for image nodes */}
      {isImageNode && controls.image && (
        <div style={{ marginBottom: "10px" }}>
          <RefControl name="image" emit={emit} payload={controls.image} />
        </div>
      )}

      {/* ✅ Text control — only for message nodes */}
      {!isImageNode && controls.text && (
        <div style={{ marginBottom: '10px' }}>
          <RefControl name="text" emit={emit} payload={controls.text} />
        </div>
      )}

      {/* ✅ Buttons — only for message nodes that have buttons control */}
      {!isImageNode && controls.buttons && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {buttonsList.map((btn: any) => {
            const outputKey = `btn:${btn.id}`;
            const output = outputs[outputKey];
            const control = controls.buttons; // ✅ safe — we checked above

            return (
              <div key={btn.id} style={{
                display: 'flex', alignItems: 'center',
                gap: '8px', width: '100%', position: 'relative'
              }}>
                <input
                  value={btn.label}
                  onChange={(e) => control.updateLabel(btn.id, e.target.value)}
                  onPointerDown={(e) => e.stopPropagation()}
                  style={{
                    flex: 1, padding: '5px 8px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '4px', fontSize: '12px',
                    background: 'white', color: 'black'
                  }}
                />
                <button
                  onClick={() => control.removeButton(btn.id)}
                  onPointerDown={(e) => e.stopPropagation()}
                  style={{
                    background: '#fff0f0', color: '#ff4d4f',
                    border: '1px solid #ffd6d6', borderRadius: '4px',
                    width: '24px', height: '24px',
                    cursor: 'pointer', fontSize: '10px'
                  }}
                >✕</button>

                {output && (
                  <div style={{
                    position: 'absolute', right: '-24px',
                    top: '50%', transform: 'translateY(-50%)'
                  }}>
                    <RefSocket name={outputKey} side="output"
                      socketKey={outputKey} nodeId={data.id}
                      emit={emit} payload={output.socket}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Add Button */}
          <div style={{ marginTop: '5px' }}>
            <RefControl name="buttons" emit={emit} payload={controls.buttons} />
          </div>
        </div>
      )}

      {/* NEXT Socket */}
      {outputs.next && (
        <div style={{
          position: 'absolute', bottom: '5px', right: '-12px',
          display: 'flex', alignItems: 'center', gap: '4px'
        }}>
          <span style={{ color: 'white', fontSize: '11px' }}>continue</span>
          <RefSocket name="next" side="output" socketKey="next"
            nodeId={data.id} emit={emit} payload={outputs.next.socket}
          />
        </div>
      )}

    </NodeBox>
  );
}