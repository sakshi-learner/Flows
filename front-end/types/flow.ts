// /types/flow.ts
export type FlowDefinition = {
  start: string;
  start_node_id?: string; 
  nodes: Record<
    string,
    {
      type: "message";
      text: string;
      next?: string | null;
      buttons: Array<{
        id: string;
        label: string;
        next?: string | null;
      }>;
      position?: { x: number; y: number }; 
    }
  >;
};

export type Flow = {
  id: number;
  name: string;
  is_active: boolean;
  is_default: boolean;
  definition: FlowDefinition;
};



