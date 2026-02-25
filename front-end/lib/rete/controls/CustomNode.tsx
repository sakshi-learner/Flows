import React from "react";
import { Presets } from "rete-react-plugin";
import styled from "styled-components";

const { RefSocket, RefControl } = Presets.classic;

const NodeBox = styled.div`
  background: rgba(110, 136, 255, 0.95);
  border: 2px solid #4c58bf;
  border-radius: 12px;
  min-width: 300px;
  position: relative;
  padding: 25px 15px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  overflow: visible !important;
`;

export function CustomNode(props: any) {
  const { data, emit } = props;
  const { inputs, outputs, controls } = data;
  const buttonsList = data.data.buttons || [];

  return (
    <NodeBox>

      {/* 1. IN Socket - NO style prop, only positioning wrapper */}
      {inputs.in && (
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '-9px',   // half of 18px socket width
          zIndex: 100
        }}>
          <RefSocket
            name="in"
            side="input"
            socketKey="in"
            nodeId={data.id}
            emit={emit}
            payload={inputs.in.socket}   // .socket lagao, inputs.in nahi
          />
        </div>
      )}

      {/* Node Title */}
      <div style={{
        color: 'white',
        textAlign: 'center',
        marginBottom: '15px',
        fontWeight: 'bold'
      }}>
        {data.label}
      </div>

      {/* 2. Message Textarea */}
      <div style={{ marginBottom: '10px' }}>
        <RefControl name="text" emit={emit} payload={controls.text} />
      </div>

      {/* 3. Button Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {buttonsList.map((btn: any) => {
          const outputKey = `btn:${btn.id}`;
          const output = outputs[outputKey];
          const control = controls.buttons;

          return (
            <div key={btn.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              position: 'relative'   // absolute child ke liye
            }}>

              {/* Input Field */}
              <input
                value={btn.label}
                onChange={(e) => control.updateLabel(btn.id, e.target.value)}
                onPointerDown={(e) => e.stopPropagation()}
                style={{
                  flex: 1,
                  padding: '5px 8px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '4px',
                  fontSize: '12px',
                  background: 'white',
                  color: 'black'
                }}
              />

              {/* Delete Button */}
              <button
                onClick={() => control.removeButton(btn.id)}
                onPointerDown={(e) => e.stopPropagation()}
                style={{
                  background: '#fff0f0',
                  color: '#ff4d4f',
                  border: '1px solid #ffd6d6',
                  borderRadius: '4px',
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  fontSize: '10px'
                }}
              >✕</button>

              {/* Output Socket - NO style prop */}
              {output && (
                <div style={{
                  position: 'absolute',
                  right: '-24px',    // node edge ke bahar
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}>
                  <RefSocket
                    name={outputKey}
                    side="output"
                    socketKey={outputKey}
                    nodeId={data.id}
                    emit={emit}
                    payload={output.socket}   // output.socket, sirf output nahi
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* 4. Add Button */}
        <div style={{ marginTop: '5px' }}>
          <RefControl name="buttons" emit={emit} payload={controls.buttons} />
        </div>
      </div>

      {/* 5. NEXT Socket - NO style prop */}
      {outputs.next && (
        <div style={{
          position: 'absolute',
          bottom: '5px',
          right: '-12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span style={{ color: 'white', fontSize: '11px' }}>continue</span>
          <RefSocket
            name="next"
            side="output"
            socketKey="next"
            nodeId={data.id}
            emit={emit}
            payload={outputs.next.socket}   // .socket lagao
          />
        </div>
      )}

    </NodeBox>
  );
}