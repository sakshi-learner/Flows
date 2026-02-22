function buttonLabel(b) {
  return String(b?.text ?? b?.label ?? "").trim();
}

function normalizeInput(str) {
  return String(str || "").trim().toLowerCase();
}

function safeJsonParse(v) {
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
}

function parseButtonPayload(userInput) {
  let parsed = safeJsonParse(userInput);

  // wrapper object
  if (parsed && typeof parsed === "object" && typeof parsed.content === "string") {
    const inner = safeJsonParse(parsed.content);
    if (inner) return inner;
  }

  // double-stringified
  if (typeof parsed === "string") {
    const inner = safeJsonParse(parsed);
    if (inner) return inner;
  }

  return parsed;
}

function findButtonByUserText(node, userInput) {
  const parsedInput = parseButtonPayload(userInput);

  // 1) match by buttonId
  if (parsedInput?.buttonId) {
    const found = (node.buttons || []).find(
      (b) => String(b.id) === String(parsedInput.buttonId)
    );
    if (found) return found;
  }

  // 2) match by next (reliable)
  if (parsedInput?.next) {
    const found = (node.buttons || []).find(
      (b) => String(b.next) === String(parsedInput.next)
    );
    if (found) return found;
  }

  // 3) match by label/text
  const plainText = normalizeInput(parsedInput?.label || parsedInput?.text || userInput);
  return (
    (node.buttons || []).find((b) => normalizeInput(buttonLabel(b)) === plainText) || null
  );
}

function unwrapIncomingInput(userInput) {
  // Case A: already object {content,type}
  if (userInput && typeof userInput === "object") {
    if (typeof userInput.content === "string") return userInput.content;
    return JSON.stringify(userInput);
  }

  // Case B: string (often wrapper JSON string)
  const s = String(userInput ?? "");
  try {
    const maybeWrapper = JSON.parse(s);
    if (
      maybeWrapper &&
      typeof maybeWrapper === "object" &&
      typeof maybeWrapper.content === "string"
    ) {
      return maybeWrapper.content; // return inner content only
    }
  } catch {}
  return s;
}

function getNode(flow, nodeId) {
  if (!nodeId) return null;
  if (Array.isArray(flow.nodes)) return flow.nodes.find((n) => n.id === nodeId) || null;
  return flow.nodes?.[nodeId] || null;
}

async function executeGraph({ flow, state, userInput }) {
  userInput = unwrapIncomingInput(userInput);

  const outputs = [];
  let currentNodeId = state.currentNodeId || flow.start;

  // =========================================================
  // STEP 1: STICKY MENU / SUBMENU BUTTON HANDLING
  // =========================================================
  if (state.waitingFor?.type === "button" && state.waitingFor.nodeId) {
    const activeMenuId = state.waitingFor.nodeId; // node currently showing buttons
    const menuNode = getNode(flow, activeMenuId);

    if (menuNode) {
      const chosen = findButtonByUserText(menuNode, userInput);

      // invalid selection -> resend same menu buttons
      if (!chosen || !chosen.next) {
        const retryButtons = (menuNode.buttons || []).filter((b) => buttonLabel(b));
        outputs.push({
          type: "text",
          text: "Please select a valid option ✅",
          buttons: retryButtons.map((b) => ({
            id: b.id,
            label: buttonLabel(b),
            next: b.next,
          })),
        });
        return { outputs, nextState: state };
      }

      // chosen valid -> send next node output (one hop)
      const nextNode = getNode(flow, chosen.next);
      if (!nextNode) {
        // next missing -> keep same menu active
        return {
          outputs,
          nextState: {
            ...state,
            currentNodeId: activeMenuId,
            waitingFor: { type: "button", nodeId: activeMenuId },
          },
        };
      }

      const nextButtons = (nextNode.buttons || []).filter((b) => buttonLabel(b));

      outputs.push({
        type: "text",
        text: nextNode.text || "",
        buttons: nextButtons.map((b) => ({
          id: b.id,
          label: buttonLabel(b),
          next: b.next,
        })),
      });

      // submenu rule:
      // if next node has buttons -> new active menu becomes next node
      // else keep current menu as active (multi-click menu)
      const newMenuId = nextButtons.length > 0 ? chosen.next : activeMenuId;

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

  // =========================================================
  // STEP 2: INITIAL ENTRY / NORMAL WALK UNTIL FIRST BUTTONS
  // =========================================================
  while (currentNodeId) {
    const node = getNode(flow, currentNodeId);
    if (!node) break;

    const validButtons = (node.buttons || []).filter((b) => buttonLabel(b));

    outputs.push({
      type: "text",
      text: node.text || "",
      buttons: validButtons.map((b) => ({
        id: b.id,
        label: buttonLabel(b),
        next: b.next,
      })),
    });

    // Stop & wait if buttons exist (menu becomes active)
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

    if (node.next) {
      currentNodeId = node.next;
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