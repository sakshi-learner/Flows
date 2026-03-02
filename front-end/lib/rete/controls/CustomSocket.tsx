'use client';
import { ClassicPreset } from "rete";
import styled from "styled-components";


const Styles = styled.div<{ isconnected?: number }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid ${(p) => (p.isconnected ? "white" : "#94a3b8")};
  background: ${(p) => (p.isconnected ? "#94a3b8" : "#ffffff")};
  cursor: pointer;
  display: inline-block; 
  pointer-events: auto;
  box-sizing: border-box;
  &:hover {
   transform: scale(1.3);
    background: #6366f1;
    border-color: #4c58bf;
  }

   &::after {
    content: "";
    display: ${(p) => (p.isconnected ? "block" : "none")};
    width: 6px;
    height: 6px;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

type CustomSocketProps = {
  data: any;
  isconnected?: boolean;
  [key: string]: any; 
};

export function CustomSocket(props: CustomSocketProps) {
  const isInput = props.side === "input";
  // console.log("socket props:", props);
  // console.log("side:", props.side);
  
  return <Styles isconnected={props.isconnected ? 1 : 0}
    title={props.isconnected ? "Connected" : "Not connected"} 
    
    onPointerDown={(e) => {
        if (isInput) {
          e.stopPropagation(); // ✅ input socket pe drag/detach block
          e.preventDefault();
        }
      }}
  />;
}


