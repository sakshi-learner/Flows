const { MessageRead } = require('../models');

class MessageReadRepository {
  async markAsRead(messageId, userId) {
    return MessageRead.findOrCreate({
      where: { message_id: messageId, user_id: userId },
      defaults: { read_at: new Date() }
    });
  }

  async getReads(messageId) {
    return MessageRead.findAll({
      where: { message_id: messageId }
    });
  }
}

module.exports = new MessageReadRepository();
