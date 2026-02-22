const { Room, RoomMember, User, Message } = require('../models');

class RoomRepository {
  // Create new room
  async create(data, transaction = null) {
    return Room.create(data, { transaction });
  }

  // Get all rooms for a user
  async findAllByUser(userId) {
    return Room.findAll({
      include: [
        {
          model: RoomMember,
          as: 'members',
          where: { user_id: userId },
          attributes: []
        },
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['createdAt', 'DESC']]
        }
      ],
      order: [[{ model: Message, as: 'messages' }, 'createdAt', 'DESC']]
    });
  }

  // Get single room with members
  async findById(roomId) {
    return Room.findByPk(roomId, {
      include: [
        {
          model: RoomMember,
          as: 'members',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
        },
        {
          model: Message,
          as: 'messages',
          limit: 20,
          order: [['createdAt', 'DESC']]
        }
      ]
    });
  }

  // Update room
  async update(roomId, data) {
    return Room.update(data, { where: { id: roomId }, returning: true });
  }

  // Soft delete room
  async delete(roomId) {
    return Room.update({ is_deleted: true }, { where: { id: roomId } });
  }
}

module.exports = new RoomRepository();
