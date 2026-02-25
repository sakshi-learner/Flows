import styled from "styled-components";
import { Presets } from "rete-react-plugin";

const { useConnection } = Presets.classic;

const Svg = styled.svg`
  overflow: visible !important;
  position: absolute;
  pointer-events: none;
  /* 9999px ki jagah 100% try karein agar lines cut rahi hain */
  width: 9999px; 
  height: 9999px;
`;

const Path = styled.path<{ styles?: (props: any) => any }>`
  fill: none;
  stroke-width: 5px;
  stroke: black; 
  pointer-events: auto;
  ${(props) => props.styles && props.styles(props)}
`;

export function CustomConnection(props: {
  data: any; 
  styles?: (props: any) => any;
}) {
  const { path } = useConnection();
  if (!props.data) return null;

  return (
    <Svg data-testid="connection">
      <Path styles={props.styles} d={path} />
    </Svg>
  );
}