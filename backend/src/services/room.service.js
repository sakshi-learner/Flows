const RoomRepository = require('../repositories/room.repositotry');
const RoomMemberRepository = require('../repositories/roomMember.repository');

class RoomService {
  // Create room + add creator as owner
  async createRoom(creatorId,data) {
    const room = await RoomRepository.create({
      ...data,
      created_by: creatorId
    });

    // Add creator as owner
    await RoomMemberRepository.addMember({
      room_id: room.id,
      user_id: creatorId,
      role: 'owner',
      joined_at: new Date()
    });

    return room;
  }

  async getUserRooms(userId) {
    return RoomRepository.findAllByUser(userId);
  }

  async getRoomDetails(roomId) {
    return RoomRepository.findById(roomId);
  }

  async updateRoom(roomId, userId, data) {
    // Verify owner/admin
    const member = await RoomMemberRepository.findOne(roomId, userId);
    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      throw new Error('Not authorized to update room');
    }

    const [rows, [updatedRoom]] = await RoomRepository.update(roomId, data);
    return updatedRoom;
  }

  async deleteRoom(roomId, userId) {
    const member = await RoomMemberRepository.findOne(roomId, userId);
    if (!member || member.role !== 'owner') throw new Error('Only owner can delete room');

    await RoomRepository.delete(roomId);
    return { success: true };
  }
}

module.exports = new RoomService();
