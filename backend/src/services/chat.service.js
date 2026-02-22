const { Room, RoomMember, Message, User } = require('../models');
const FlowRepo = require('../repositories/flow.repository')
function directKey(userA, userB) {
  const [a, b] = [Number(userA), Number(userB)].sort((x, y) => x - y);
  return `${a}_${b}`;
}

class ChatService {
  async openDirectChat(myId, otherUserId) {
    if (!otherUserId) throw new Error("otherUserId is required");
    if (Number(myId) === Number(otherUserId)) throw new Error("You can't chat with yourself");

    // (optional) verify other user exists
    const otherUser = await User.findByPk(otherUserId);
    if (!otherUser) throw new Error("User not found");

    const key = directKey(myId, otherUserId);

    // 1) find existing direct room
    let room = await Room.findOne({
      where: { type: 'direct', direct_key: key }
    });

    // 2) create if not exists
    if (!room) {
      room = await Room.create({
        name: 'Direct Chat',
        type: 'direct',
        direct_key: key,
        created_by: myId,
        is_private: true
      });

      // 3) add both users to room_members
      await RoomMember.bulkCreate([
        { room_id: room.id, user_id: myId, role: 'member', joined_at: new Date() },
        { room_id: room.id, user_id: otherUserId, role: 'member', joined_at: new Date() }
      ]);
    }

    // 4) fetch last 50 messages for history
    const messages = await Message.findAll({
      where: { room_id: room.id },
      order: [['createdAt', 'ASC']],
      limit: 100
    });


    // 5) Fetch flow (if exists) for the user to include buttons
    const flow = await FlowRepo.findDefaultForUser(myId); // Fetch flow related to the user
    console.log("flow.definition.nodes is:", flow.definition.nodes);
    console.log("Is flow.definition.nodes an array?", Array.isArray(flow.definition.nodes));      // Add flow buttons to each message

    if (flow && flow.definition) {
      console.log("flow.definition:", flow.definition);

      // Convert flow.definition.nodes (which is an object) into an array
      const nodes = Object.values(flow.definition.nodes);
      console.log("nodes as array:", nodes);

      // Add flow buttons to each message
      const updatedMessages = messages.map((msg) => {
        // Assuming the message content should contain buttons
        if (msg.body?.bot) {
          // Add buttons from flow to the message
          msg.body.buttons = nodes.flatMap((node) => node.buttons || []);
        }
        return msg;
      });

      return { room, messages: updatedMessages };
    }

    return { room, messages };
  }
}

module.exports = new ChatService();

