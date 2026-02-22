export * from "./flow";
export type ID = number;

export interface User {

  id: ID;
  name?: string;
  // email?: string;
  email: string;  // ✅ Required field
  online?: boolean; // Optional


}

export type MessageType = "text" | "image" | "file" | "system"|"buttons";

export interface Message {
  id?: number;
  message_id?: string;
  room_id: number;
  sender_id: number |null;
  content: string;
  type?: MessageType;
  body?: any; 
  timestamp?: number;
  createdAt?: string;
   buttons?: {
    id: string;
    label: string;
    next: string | null;
  }[];

}

export interface Room {
  id: number;
  type?: "direct" | "group" | "channel";
  created_by?: number;
  direct_key?: string | null;
}


