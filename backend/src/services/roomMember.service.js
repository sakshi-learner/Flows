const RoomMemberRepository = require('../repositories/roomMember.repository');

class RoomMemberService {
  async addMember(roomId, userId, addedUserId) {
    const member = await RoomMemberRepository.findOne(roomId, userId);
    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      throw new Error('Not authorized to add member');
    }

    return RoomMemberRepository.addMember({
      room_id: roomId,
      user_id: addedUserId,
      role: 'member',
      joined_at: new Date()
    });
  }

  async removeMember(roomId, userId, targetUserId) {
    const member = await RoomMemberRepository.findOne(roomId, userId);
    if (!member || (member.role !== 'owner' && userId !== targetUserId)) {
      throw new Error('Not authorized to remove member');
    }

    return RoomMemberRepository.removeMember(roomId, targetUserId);
  }

  async updateRole(roomId, ownerId, targetUserId, role) {
    const owner = await RoomMemberRepository.findOne(roomId, ownerId);
    if (!owner || owner.role !== 'owner') throw new Error('Only owner can update roles');

    return RoomMemberRepository.updateRole(roomId, targetUserId, role);
  }

  async getMembers(roomId, userId) {
    const member = await RoomMemberRepository.findOne(roomId, userId);
    if (!member) throw new Error('Not a member of this room');

    return RoomMemberRepository.getMembers(roomId);
  }
}

module.exports = new RoomMemberService();
