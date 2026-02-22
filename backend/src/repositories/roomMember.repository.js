const { RoomMember, User } = require('../models');

class RoomMemberRepository {
  async addMember(data) {
    return RoomMember.create(data);
  }


  async removeMember(roomId, userId) {
    return RoomMember.destroy({ where: { room_id: roomId, user_id: userId } });
  }

  async updateRole(roomId, userId, role) {
    return RoomMember.update({ role }, { where: { room_id: roomId, user_id: userId }, returning: true });
  }

  async getMembers(roomId) {
    return RoomMember.findAll({
      where: { room_id: roomId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'status'] }]
    });
  }

  async findOne(roomId, userId) {
    return RoomMember.findOne({ where: { room_id: roomId, user_id: userId } });
  }

  findAllByRoom(roomId) {
  return RoomMember.findAll({ where: { room_id: roomId } });
}
}

module.exports = new RoomMemberRepository();
