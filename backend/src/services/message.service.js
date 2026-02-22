const MessageRepository = require('../repositories/message.repository');
const RoomMemberRepository = require('../repositories/roomMember.repository');
const MessageReadRepository = require('../repositories/messageRead.repositotry');
const FlowRepo = require('../repositories/flow.repository')

class MessageService {
  async sendMessage(userId, roomId, data) {
    // Verify user is member
    const member = await RoomMemberRepository.findOne(roomId, userId);
    if (!member) throw new Error('Not a member of this room');

    const message = await MessageRepository.create({
      room_id: roomId,
      sender_id: userId,
      type: data.type || 'text',
      content: data.content,
      body: data.body || null,
      reply_to_message_id: data.reply_to_message_id || null,
      timestamp: Date.now()
    });


    // If the message is a bot message, add buttons from flow
    if (data.body?.bot) {
      const flow = await FlowRepo.findDefaultForUser(userId); // Get the user's flow
      message.body.buttons = flow ? flow.definition.nodes.map(node => node.buttons).flat() : [];
    }

    return message;
  }

  async getMessages(userId, roomId, limit = 50, offset = 0) {
    const member = await RoomMemberRepository.findOne(roomId, userId);
    if (!member) throw new Error('Not a member of this room');

    return MessageRepository.findByRoom(roomId, limit, offset);
  }

  async markAsRead(userId, messageId) {
    return MessageReadRepository.markAsRead(messageId, userId);
  }

  async getReadStatus(messageId) {
    return MessageReadRepository.getReads(messageId);
  }

  async editMessage(userId, messageId, content) {
    const message = await MessageRepository.findById(messageId);
    if (!message || message.sender_id !== userId) throw new Error('Not authorized');

    return MessageRepository.update(messageId, { content, is_edited: true });
  }

  async deleteMessage(userId, messageId) {
    const message = await MessageRepository.findById(messageId);
    if (!message || message.sender_id !== userId) throw new Error('Not authorized');

    return MessageRepository.delete(messageId);
  }
}

module.exports = new MessageService();
