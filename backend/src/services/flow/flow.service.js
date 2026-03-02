const FlowRepo = require('../../repositories/flow.repository');
const { Flow } = require('../../models');
const ConversationRepo = require('../../repositories/conversation.repository');
const { executeGraph } = require('./engine/executeGraph');


function unwrapText(text) {
  // already string
  if (typeof text === "string") {
    // handle wrapper string: {"content":"...","type":"text"}
    try {
      const obj = JSON.parse(text);
      if (obj && typeof obj === "object" && typeof obj.content === "string") {
        return obj.content;
      }
    } catch { }
    return text;
  }

  // object: {content, type}
  if (text && typeof text === "object") {
    if (typeof text.content === "string") return text.content;
    return JSON.stringify(text);
  }

  return String(text ?? "");
}

class FlowService {

  /* =======================
     FLOW BUILDER / CRUD
  ======================== */

  getMyFlows(userId) {
    return FlowRepo.getByUser(userId);
  }

  getFlow(flowId, userId) {
    return FlowRepo.findByIdAndUser(flowId, userId);
  }

  createFlow(userId, data) {
    console.log(data);
    return FlowRepo.create({
      ...data,
      user_id: userId,
      is_active: true
    });


  }

  updateFlow(flowId, userId, data) {
    return FlowRepo.update(flowId, {
      ...data,
      user_id: userId
    });
  }

  setDefault(flowId, userId) {
    return FlowRepo.setDefault(flowId, userId);
  }


  /* =======================
     FLOW RUNTIME / CHAT
  ======================== */

  async handleMessage({ roomId, userId, senderId, text, silent = false }) {
    try {
      let convo = await ConversationRepo.findByRoomAndUser(roomId, userId);
      // first message → create conversation
      if (!convo) {
        let flow = await FlowRepo.findDefaultForUser(userId);
        if (!flow) {
          flow = await FlowRepo.findFirstActiveForUser(userId);
        }
        if (!flow || !flow.definition) {
          return [{ type: "text", text: "⚠️ No default flow set. Please set one." }];
        }
        convo = await ConversationRepo.create({
          room_id: roomId,
          user_id: userId,
          flow_id: flow.id,
          state: {
            currentNodeId: flow.definition.start,
            waitingFor: null,
            vars: {}
          }
        });
        console.log("Input received in FlowService:", text);
      }
      const flow = await FlowRepo.findById(convo.flow_id);


      const input = unwrapText(text);
      console.log("HANDLE MESSAGE:", { roomId, userId, raw: text, input });

      const result = await executeGraph({
        flow: flow.definition,
        state: convo.state,
        userInput: input
      });



      let outputs = result?.outputs || [];
      const nextState = result?.nextState || convo.state;

      outputs = outputs.map(o => ({
        ...o,
        forUserId: senderId
      }));

      console.log("Flow Engine Outputs:", outputs);

      await ConversationRepo.updateState(roomId, userId, nextState);
      if (silent) return [];
      return outputs;
    } catch (err) {
      console.error("Error in FlowService handleMessage:", err);
      return [];
    }

  }
}

module.exports = new FlowService();
