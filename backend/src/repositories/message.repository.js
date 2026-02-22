const { Message, User, MessageRead } = require('../models');

class MessageRepository {
  async create(data) {
    return Message.create(data);
  }

  async findByRoom(roomId, limit = 50, offset = 0) {
    return Message.findAll({
      where: { room_id: roomId, is_deleted: false },
      include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'ASC']],
      limit,
      offset
    });
  }

  async findById(messageId) {
    return Message.findByPk(messageId, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email'] },
        { model: MessageRead, as: 'reads' }
      ]
    });
  }

  async update(messageId, data) {
    return Message.update(data, { where: { id: messageId }, returning: true });
  }

  async delete(messageId) {
    return Message.update({ is_deleted: true, deleted_at: new Date() }, { where: { id: messageId } });
  }
}

module.exports = new MessageRepository();
