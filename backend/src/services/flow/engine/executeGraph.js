function buttonLabel(b) {
  // New format: b.reply.title, Old format: b.label or b.text
  return String(b?.reply?.title ?? b?.label ?? b?.text ?? "").trim();
}

function normalizeInput(str) {
  return String(str || "").trim().toLowerCase();
}

function safeJsonParse(v) {
  try { return JSON.parse(v); } catch { return null; }
}

function parseButtonPayload(userInput) {
  let parsed = safeJsonParse(userInput);
  if (parsed && typeof parsed === "object" && typeof parsed.content === "string") {
    const inner = safeJsonParse(parsed.content);
    if (inner) return inner;
  }
  if (typeof parsed === "string") {
    const inner = safeJsonParse(parsed);
    if (inner) return inner;
  }
  return parsed;
}

function unwrapIncomingInput(userInput) {
  if (userInput && typeof userInput === "object") {
    if (typeof userInput.content === "string") return userInput.content;
    return JSON.stringify(userInput);
  }
  const s = String(userInput ?? "");
  try {
    const maybeWrapper = JSON.parse(s);
    if (maybeWrapper && typeof maybeWrapper === "object" && typeof maybeWrapper.content === "string") {
      return maybeWrapper.content;
    }
  } catch {}
  return s;
}

// ✅ Node by ID — array se dhundo
function getNode(flow, nodeId) {
  if (!nodeId) return null;
  if (Array.isArray(flow.nodes)) {
    return flow.nodes.find((n) => n.id === nodeId) || null;
  }
  return null;
}

// ✅ Node ka text nikalo — new format se
function getNodeText(node) {
  if (!node) return "";
  const mc = node.data?.msgContent;
  if (!mc) return node.text || "";

  if (mc.type === "text") {
    return mc.text?.body ?? "";
  }
  if (mc.type === "interactive") {
    return mc.interactive?.body?.text ?? "";
  }
  return "";
}

// ✅ Node ke buttons nikalo — new format se
function getNodeButtons(node) {
  if (!node) return [];
  const mc = node.data?.msgContent;
  if (!mc) return node.buttons || [];

  if (mc.type === "interactive") {
    return mc.interactive?.action?.buttons ?? [];
  }
  return [];
}

// ✅ Edge se next node ID nikalo
// sourceHandle === nodeId → continue connection
// sourceHandle === buttonId → button connection
function getNextNodeId(flow, currentNodeId, sourceHandle) {
  if (!flow.edges || !Array.isArray(flow.edges)) return null;

  const edge = flow.edges.find(
    (e) => e.source === currentNodeId && e.sourceHandle === sourceHandle
  );
  return edge ? edge.target : null;
}

// ✅ Continue (next) socket ka target
function getContinueNext(flow, nodeId) {
  // sourceHandle === nodeId matlab continue connection
  return getNextNodeId(flow, nodeId, nodeId);
}

// ✅ Button click ka target
function getButtonNext(flow, nodeId, buttonId) {
  // sourceHandle === buttonId matlab button connection
  return getNextNodeId(flow, nodeId, buttonId);
}

// ✅ Button find karo user input se
function findButtonByUserText(buttons, userInput) {
  const parsedInput = parseButtonPayload(userInput);

  // 1) match by buttonId
  if (parsedInput?.buttonId) {
    const found = buttons.find(
      (b) => String(b.reply?.id ?? b.id) === String(parsedInput.buttonId)
    );
    if (found) return found;
  }

  // 2) match by label/text
  const plainText = normalizeInput(
    parsedInput?.label || parsedInput?.text || userInput
  );

  return buttons.find(
    (b) => normalizeInput(buttonLabel(b)) === plainText
  ) || null;
}

// async function executeGraph({ flow, state, userInput }) {
//   userInput = unwrapIncomingInput(userInput);

//   const outputs = [];
//   let currentNodeId = state.currentNodeId || flow.start_node_id || flow.start;

//   // =========================================================
//   // STEP 1: BUTTON HANDLING — user ne button click kiya
//   // =========================================================
//   if (state.waitingFor?.type === "button" && state.waitingFor.nodeId) {
//     const activeMenuId = state.waitingFor.nodeId;
//     const menuNode = getNode(flow, activeMenuId);

//     if (menuNode) {
//       const buttons = getNodeButtons(menuNode);
//       const validButtons = buttons.filter((b) => buttonLabel(b));
//       const chosen = findButtonByUserText(validButtons, userInput);

//       // Invalid selection → same menu dobara dikhao
//       if (!chosen) {
//         outputs.push({
//           type: "text",
//           text: "Please select a valid option ✅",
//           buttons: validButtons.map((b) => ({
//             id: b.reply?.id ?? b.id,
//             label: buttonLabel(b),
//           })),
//         });
//         return { outputs, nextState: state };
//       }

//       // ✅ Chosen button ka next node edges se nikalo
//       const chosenButtonId = chosen.reply?.id ?? chosen.id;
//       const nextNodeId = getButtonNext(flow, activeMenuId, chosenButtonId);

//       if (!nextNodeId) {
//         // Edge nahi mili — same menu raho
//         return {
//           outputs,
//           nextState: {
//             ...state,
//             currentNodeId: activeMenuId,
//             waitingFor: { type: "button", nodeId: activeMenuId },
//           },
//         };
//       }

//       const nextNode = getNode(flow, nextNodeId);
//       if (!nextNode) {
//         return {
//           outputs,
//           nextState: {
//             ...state,
//             currentNodeId: activeMenuId,
//             waitingFor: { type: "button", nodeId: activeMenuId },
//           },
//         };
//       }

//       const nextText = getNodeText(nextNode);
//       const nextButtons = getNodeButtons(nextNode).filter((b) => buttonLabel(b));

//       outputs.push({
//         type: "text",
//         text: nextText,
//         buttons: nextButtons.map((b) => ({
//           id: b.reply?.id ?? b.id,
//           label: buttonLabel(b),
//         })),
//       });

//       // Submenu rule
//       const newMenuId = nextButtons.length > 0 ? nextNodeId : activeMenuId;

//       return {
//         outputs,
//         nextState: {
//           ...state,
//           currentNodeId: newMenuId,
//           waitingFor: { type: "button", nodeId: newMenuId },
//         },
//       };
//     }
//   }

//   // =========================================================
//   // STEP 2: NORMAL WALK — start se chalo jab tak buttons na milein
//   // =========================================================
//   while (currentNodeId) {
//     const node = getNode(flow, currentNodeId);
//     if (!node) break;

//     const text = getNodeText(node);
//     const buttons = getNodeButtons(node);
//     const validButtons = buttons.filter((b) => buttonLabel(b));

//     outputs.push({
//       type: "text",
//       text,
//       buttons: validButtons.map((b) => ({
//         id: b.reply?.id ?? b.id,
//         label: buttonLabel(b),
//       })),
//     });

//     // Buttons hain → ruko aur wait karo
//     if (validButtons.length > 0) {
//       return {
//         outputs,
//         nextState: {
//           ...state,
//           currentNodeId,
//           waitingFor: { type: "button", nodeId: currentNodeId },
//         },
//       };
//     }

//     // ✅ Continue — edges se next node nikalo
//     const nextNodeId = getContinueNext(flow, currentNodeId);
//     if (nextNodeId) {
//       currentNodeId = nextNodeId;
//       state = { ...state, currentNodeId };
//     } else {
//       currentNodeId = null;
//     }
//   }

//   return {
//     outputs,
//     nextState: { ...state, currentNodeId: null, waitingFor: null },
//   };
// }

// ✅ Add this helper
function getNodeImage(node) {
  const mc = node?.data?.msgContent;
  if (mc?.type === "image") return mc.image ?? null;
  return null;
}

// ✅ Update buildOutput helper — use everywhere
function buildOutput(node) {
  const image = getNodeImage(node);
  const buttons = getNodeButtons(node).filter((b) => buttonLabel(b));

  if (image) {
    return {
      type: "image",
      image: {
        link: image.link ?? "",
        caption: image.caption ?? "",
      },
      buttons: buttons.map((b) => ({
        id: b.reply?.id ?? b.id,
        label: buttonLabel(b),
      })),
    };
  }

  return {
    type: "text",
    text: getNodeText(node),
    buttons: buttons.map((b) => ({
      id: b.reply?.id ?? b.id,
      label: buttonLabel(b),
    })),
  };
}

async function executeGraph({ flow, state, userInput }) {
  userInput = unwrapIncomingInput(userInput);
  const outputs = [];
  let currentNodeId = state.currentNodeId || flow.start_node_id || flow.start;

  // STEP 1: BUTTON HANDLING
  if (state.waitingFor?.type === "button" && state.waitingFor.nodeId) {
    const activeMenuId = state.waitingFor.nodeId;
    const menuNode = getNode(flow, activeMenuId);

    if (menuNode) {
      const buttons = getNodeButtons(menuNode);
      const validButtons = buttons.filter((b) => buttonLabel(b));
      const chosen = findButtonByUserText(validButtons, userInput);

      if (!chosen) {
        outputs.push({
          type: "text",
          text: "Please select a valid option ✅",
          buttons: validButtons.map((b) => ({
            id: b.reply?.id ?? b.id,
            label: buttonLabel(b),
          })),
        });
        return { outputs, nextState: state };
      }

      const chosenButtonId = chosen.reply?.id ?? chosen.id;
      const nextNodeId = getButtonNext(flow, activeMenuId, chosenButtonId);

      if (!nextNodeId) {
        return {
          outputs,
          nextState: {
            ...state,
            currentNodeId: activeMenuId,
            waitingFor: { type: "button", nodeId: activeMenuId },
          },
        };
      }

      const nextNode = getNode(flow, nextNodeId);
      if (!nextNode) {
        return {
          outputs,
          nextState: {
            ...state,
            currentNodeId: activeMenuId,
            waitingFor: { type: "button", nodeId: activeMenuId },
          },
        };
      }

      // ✅ Use buildOutput — handles both image and text
      outputs.push(buildOutput(nextNode));

      const nextButtons = getNodeButtons(nextNode).filter((b) => buttonLabel(b));
      const newMenuId = nextButtons.length > 0 ? nextNodeId : activeMenuId;

      // ✅ If image node has continue edge — walk further
      if (nextButtons.length === 0) {
        let continueId = getContinueNext(flow, nextNodeId);
        while (continueId) {
          const continueNode = getNode(flow, continueId);
          if (!continueNode) break;
          outputs.push(buildOutput(continueNode));
          const cb = getNodeButtons(continueNode).filter((b) => buttonLabel(b));
          if (cb.length > 0) {
            return {
              outputs,
              nextState: {
                ...state,
                currentNodeId: continueId,
                waitingFor: { type: "button", nodeId: continueId },
              },
            };
          }
          continueId = getContinueNext(flow, continueId);
        }
      }

      return {
        outputs,
        nextState: {
          ...state,
          currentNodeId: newMenuId,
          waitingFor: { type: "button", nodeId: newMenuId },
        },
      };
    }
  }

  // STEP 2: NORMAL WALK
  while (currentNodeId) {
    const node = getNode(flow, currentNodeId);
    if (!node) break;

    // ✅ Use buildOutput — handles both image and text
    outputs.push(buildOutput(node));

    const validButtons = getNodeButtons(node).filter((b) => buttonLabel(b));
    if (validButtons.length > 0) {
      return {
        outputs,
        nextState: {
          ...state,
          currentNodeId,
          waitingFor: { type: "button", nodeId: currentNodeId },
        },
      };
    }

    const nextNodeId = getContinueNext(flow, currentNodeId);
    if (nextNodeId) {
      currentNodeId = nextNodeId;
      state = { ...state, currentNodeId };
    } else {
      currentNodeId = null;
    }
  }

  return {
    outputs,
    nextState: { ...state, currentNodeId: null, waitingFor: null },
  };
}

module.exports = { executeGraph };