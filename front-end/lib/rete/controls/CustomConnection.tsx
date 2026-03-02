import styled from "styled-components";
import { Presets } from "rete-react-plugin";
import { Trash } from "lucide-react";

const { useConnection } = Presets.classic;

const Svg = styled.svg`
  overflow: visible !important;
  position: absolute;
  pointer-events: none;
  width: 9999px;
  height: 9999px;
`;

const Path = styled.path<{ selected?: boolean }>`
  fill: none;
  stroke-width: ${(props) => (props.selected ? "7px" : "5px")};
  stroke: ${(props) => (props.selected ? " #6366f1" : "#94a3b8")};
  pointer-events: none;
  transition: stroke 0.2s, stroke-width 0.2s;
`;

const DeleteButton = styled.div`
  width: 26px;
  height: 26px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: auto;
  color: #0f0d0d
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  &:hover { color: red; }
`;

export function CustomConnection(props: any) {
  const { path, start, end } = useConnection();
  if (!path) return null;

  const midX = start && end ? (start.x + end.x) / 2 : null;
  const midY = start && end ? (start.y + end.y) / 2 : null;

  return (
    <Svg data-testid="connection">
      {/* Invisible hit area for selection */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth="15px"
        style={{ pointerEvents: "auto", cursor: "pointer" }}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (props.click) props.click();
        }}
      />

      <Path d={path} selected={props.isSelected} />

      {props.isSelected && midX !== null && midY !== null && (
        <foreignObject x={midX - 13} y={midY - 45} width="26" height="26">
          <DeleteButton
            onPointerDown={(e) => {
              e.stopPropagation();
              e.nativeEvent?.stopImmediatePropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (props.onDelete) {
                props.onDelete(props.data.id);
              }
            }}
          >
            <Trash size={14} />
          </DeleteButton>
        </foreignObject>
      )}
    </Svg>
  );
}