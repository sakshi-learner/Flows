const { Conversation } = require("../models");

class ConversationRepository {
  async findByRoomAndUser(roomId, userId) {
    return Conversation.findOne({ where: { room_id: roomId, user_id: userId } });
  }

  async create(data) {
    return Conversation.create(data);
  }

  async updateState(roomId, userId, state) {
    return Conversation.update(
      { state },
      { where: { room_id: roomId, user_id: userId } }
    );
  }
}

module.exports = new ConversationRepository();