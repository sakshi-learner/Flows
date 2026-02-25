'use client';
import { ClassicPreset } from "rete";
import styled from "styled-components";

// const Styles = styled.div`
//   display: flax;
//   cursor: pointer;
//   border: 1px solid grey;
//   width: 10px; /* Increased from 3px for usability */
//   height: 10px;
//   vertical-align: middle;
//   background: #fff;
//   z-index: 2;
//   box-sizing: border-box;
//   border-radius: 50%; /* Makes it a standard circular socket */
//   &:hover {
//     background: #ddd;
//   }
// `;

const Styles = styled.div`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #ccc;
  background: white;
  cursor: pointer;
  display: block; 
  &:hover {
    background: #ddd;
    border-color: #4c58bf;
  }
`;


export function CustomSocket(props: {
  data: InstanceType<typeof ClassicPreset.Socket>
}) {
  console.log("props fromm custom sockett component", props)
  return <Styles title={props.data.name} />;
}



// export const CustomSocket = forwardRef<HTMLDivElement, any>(
//   (props, ref) => {
//     return (
//       <div ref={ref} {...props}>
//         <Styles />
//       </div>
//     );
//   }
// );

// CustomSocket.displayName = "CustomSocket";