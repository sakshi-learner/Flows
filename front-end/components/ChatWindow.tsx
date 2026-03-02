import React, { useMemo, useState, useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";

interface Button {
  id: string;
  label: string;
  text?: string;
  next: string | null;
  fromNodeId?: string;
}

const getMessageDisplayContent = (content: string) => {
  try {
    const data = JSON.parse(content);
    // Agar JSON mein label hai toh sirf wo dikhao
    if (data.label || data.text) {
      return data.label || data.text;
    }
  } catch (e) {
    // Normal text hai toh direct return
  }
  return content;
};

export default function ChatWindow() {
  const { user } = useAuth();
  const { selectedUser, roomId, messages, sendMessage, socketStatus } = useChat();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const title = useMemo(() => {
    if (!selectedUser) return "No user selected";
    return `Chat with ${selectedUser.name || selectedUser.email} (Room: ${roomId ?? "-"})`;
  }, [selectedUser, roomId]);

  const formatTime = (dateValue?: string | number) => {
    if (!dateValue) return "";
    const d = new Date(dateValue);
    return d.toLocaleTimeString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  const handleButtonClick = (button: Button) => {
    // We create the payload object
    const payload = {
      buttonId: button.id,
      label: button.label || button.text || "Button Clicked",
      next: button.next
    };

    // This calls the context function which already handles socket.emit
    sendMessage(payload);
    console.log("Button clicked and sent:", payload);
  };

  const onSend = () => {
    const t = text.trim();
    if (!t) return;
    try {
      sendMessage(t);
      setText("");
    } catch (e: any) {
      alert(e.message ?? "Send failed");
    }
  };

  return (
    <div>
      <h3>{title}</h3>
      <div>Socket: {socketStatus}</div>

      <div
        style={{
          marginTop: 8,
          border: "1px solid #ccc",
          height: 300,
          overflow: "auto",
          padding: 8,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {messages.length === 0 ? (
          <div>(No messages)</div>
        ) : (
          messages.map((m) => {
            console.log("Message data:", m); // Log message data
            const isMine = String(m.sender_id) === String(user?.id);
            // --- DEBUG LOGS START ---
            if (m.body?.buttons && m.body.buttons.length > 0) {
              console.log(`%c 🔍 Debugging Message ID: ${m.id}`, 'background: #222; color: #bada55');
              console.table({
                "Message Sender": m.sender_id,
                "Current User (You)": user?.id,
                "forUserId (Target)": m.body.forUserId,
                "Buttons Count": m.body.buttons.length,
                "Condition 1 (Not Mine)": String(m.sender_id) !== String(user?.id),
                "Condition 2 (Target Match)": String(m.body.forUserId) === String(user?.id)
              });
            }
            // --- DEBUG LOGS END ---
            return (
              <div
                key={m.id ?? m.message_id ?? `${m.sender_id}-${m.timestamp}`}
                style={{
                  display: "flex",
                  justifyContent: isMine ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "6px 10px",
                    borderRadius: 12,
                    backgroundColor: isMine ? "#2563eb" : "#94a4b4",
                    color: isMine ? "#fff" : "#000",
                    fontSize: 14,
                    wordBreak: "break-word",
                  }}
                >
                  <div style={{ wordBreak: "break-word" }}>
                    {getMessageDisplayContent(m.content)}
                  </div>
                  {/* Render buttons if available */}
                  {m.body?.buttons?.length > 0 && (
                    // Temporarily: Sirf sender_id null check karein taaki button dikhe
                    String(m.sender_id) === "null" || m.sender_id === null
                  ) && (<div style={{ marginTop: 8 }}>
                    {m.body.buttons.map((button: Button) => (
                      <button
                        key={button.id}
                        onClick={() => {
                          console.log("🚀 Button Clicked, Moving to Next Node...");
                          handleButtonClick(button);
                        }}
                        style={{
                          backgroundColor: "#2563eb",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          padding: "8px 12px",
                          margin: "5px",
                        }}
                      >
                        {button.label || button.text || "Click Here"}
                      </button>
                    ))}
                  </div>
                    )}
                  <div
                    style={{
                      marginTop: 2,
                      fontSize: 11,
                      textAlign: "right",
                      color: isMine ? "#dbeafe" : "#6b7280",
                    }}
                  >
                    {formatTime(m.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ marginTop: 10 }}>
        <input
          style={{ width: 320, height: 50 }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
          disabled={!roomId}
        />
        <button
          style={{ height: 50, margin: 15, backgroundColor: "#2563eb", border: 1 }}
          onClick={onSend}
          disabled={!roomId}
        >
          Send
        </button>
      </div>
    </div>
  );
}




// import React, { useMemo, useState, useEffect, useRef } from "react";
// import { useChat } from "@/hooks/useChat";
// import { useAuth } from "@/hooks/useAuth";

// interface Button {
//   id: string;
//   label: string;
//   text?: string;
//   next: string | null;
//   fromNodeId?: string;
// }

// const getMessageDisplayContent = (content: string) => {
//   try {
//     const data = JSON.parse(content);
//     if (data.label || data.text) {
//       return data.label || data.text;
//     }
//   } catch (e) { }
//   return content;
// };

// export default function ChatWindow() {
//   const { user } = useAuth();
//   const { selectedUser, roomId, messages, sendMessage, socketStatus } = useChat();
//   const [text, setText] = useState("");
//   const [clickedButtons, setClickedButtons] = useState<Set<string>>(new Set());
//   const bottomRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages.length]);

//   // Naya bot message aane pe clicked buttons reset karo
//   useEffect(() => {
//     setClickedButtons(new Set());
//   }, [messages.length]);

//   const title = useMemo(() => {
//     if (!selectedUser) return "No user selected";
//     return `Chat with ${selectedUser.name || selectedUser.email} (Room: ${roomId ?? "-"})`;
//   }, [selectedUser, roomId]);

//   const formatTime = (dateValue?: string | number) => {
//     if (!dateValue) return "";
//     const d = new Date(dateValue);
//     return d.toLocaleTimeString([], {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   // ✅ Sirf last bot message ka index find karo — jo current user ke liye hai
//   const lastBotMessageIndex = useMemo(() => {
//     let lastIndex = -1;
//     messages.forEach((m, i) => {
//       const isBotMessage = m.sender_id === null || String(m.sender_id) === "null";
//       const hasButtons = m.body?.buttons?.length > 0;
//       // forUserId === current logged in user — matlab yeh message mere liye hai
//       const isForMe = String(m.body?.forUserId) === String(user?.id);
//       if (m.sender_id === null) {
//         console.log("Bot msg forUserId:", m.body?.forUserId, "CurrentUser:", user?.id);
//       }
//       if (isBotMessage && hasButtons && isForMe) {
//         lastIndex = i;
//       }
//     });
//     return lastIndex;
//   }, [messages, user?.id]);

//   const handleButtonClick = (button: Button) => {
//     if (clickedButtons.has(button.id)) return; // already clicked

//     const payload = {
//       buttonId: button.id,
//       label: button.label || button.text || "Button Clicked",
//       next: button.next,
//     };

//     // ✅ Button disable karo
//     setClickedButtons((prev) => new Set(prev).add(button.id));
//     sendMessage(payload);
//   };

//   const onSend = () => {
//     const t = text.trim();
//     if (!t) return;
//     try {
//       sendMessage(t);
//       setText("");
//     } catch (e: any) {
//       alert(e.message ?? "Send failed");
//     }
//   };

//   return (
//     <div>
//       <h3>{title}</h3>
//       <div>Socket: {socketStatus}</div>

//       <div
//         style={{
//           marginTop: 8,
//           border: "1px solid #ccc",
//           height: 300,
//           overflow: "auto",
//           padding: 8,
//           display: "flex",
//           flexDirection: "column",
//           gap: 6,
//         }}
//       >
//         {messages.length === 0 ? (
//           <div>(No messages)</div>
//         ) : (
//           messages.map((m, index) => {
//             const isMine = String(m.sender_id) === String(user?.id);
//             const isBotMessage = m.sender_id === null || String(m.sender_id) === "null";

//             // ✅ forUserId === current user — matlab yeh bot message mere liye hai
//             const isForMe = String(m.body?.forUserId) === String(user?.id);

//             // ✅ Sirf last bot message pe buttons dikho — jo mere liye hai
//             const showButtons =
//               isBotMessage &&
//               isForMe &&
//               index === lastBotMessageIndex &&
//               m.body?.buttons?.length > 0;

//             return (
//               <div
//                 key={m.id ?? m.message_id ?? `${m.sender_id}-${m.timestamp}`}
//                 style={{
//                   display: "flex",
//                   justifyContent: isMine ? "flex-end" : "flex-start",
//                 }}
//               >
//                 <div
//                   style={{
//                     maxWidth: "70%",
//                     padding: "6px 10px",
//                     borderRadius: 12,
//                     backgroundColor: isBotMessage
//                       ? "#e5e7eb"       // Bot = light gray
//                       : isMine
//                         ? "#2563eb"       // Mine = blue
//                         : "#94a4b4",      // Other user = gray
//                     color: isMine ? "#fff" : "#000",
//                     fontSize: 14,
//                     wordBreak: "break-word",
//                   }}
//                 >
//                   {/* Message Text */}
//                   <div style={{ wordBreak: "break-word" }}>
//                     {getMessageDisplayContent(m.content)}
//                   </div>

//                   {/* ✅ Buttons — sirf last bot message pe, sirf mere liye */}
//                   {showButtons && (
//                     <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
//                       {m.body.buttons.map((button: Button) => {
//                         const isClicked = clickedButtons.has(button.id);
//                         return (
//                           <button
//                             key={button.id}
//                             disabled={isClicked}
//                             onClick={() => handleButtonClick(button)}
//                             style={{
//                               backgroundColor: isClicked ? "#93c5fd" : "#2563eb",
//                               color: "#fff",
//                               border: "none",
//                               borderRadius: "4px",
//                               padding: "8px 12px",
//                               margin: "2px",
//                               cursor: isClicked ? "not-allowed" : "pointer",
//                               opacity: isClicked ? 0.6 : 1,
//                               transition: "all 0.2s",
//                             }}
//                           >
//                             {button.label || button.text || "Click Here"}
//                           </button>
//                         );
//                       })}
//                     </div>
//                   )}

//                   {/* Timestamp */}
//                   <div
//                     style={{
//                       marginTop: 2,
//                       fontSize: 11,
//                       textAlign: "right",
//                       color: isMine ? "#dbeafe" : "#6b7280",
//                     }}
//                   >
//                     {formatTime(m.createdAt)}
//                   </div>
//                 </div>
//               </div>
//             );
//           })
//         )}
//         <div ref={bottomRef} />
//       </div>

//       <div style={{ marginTop: 10 }}>
//         <input
//           style={{ width: 320, height: 50 }}
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && onSend()}
//           placeholder="Type message..."
//           disabled={!roomId}
//         />
//         <button
//           style={{
//             height: 50,
//             margin: 15,
//             backgroundColor: "#2563eb",
//             border: "none",
//             color: "white",
//             padding: "0 16px",
//             cursor: "pointer",
//           }}
//           onClick={onSend}
//           disabled={!roomId}
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// }