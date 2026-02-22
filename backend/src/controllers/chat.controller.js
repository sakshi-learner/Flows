const ChatService = require('../services/chat.service');

class ChatController {
  async openDirectChat(req, res, next) {
    try {
      const { otherUserId } = req.body;
      const result = await ChatService.openDirectChat(req.user.id, otherUserId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // POST /chat/rooms
  async createRoom(req, res, next) {
    try {
      const room = await ChatService.createRoom(req.user.id, req.body);
      res.status(201).json({ success: true, data: room });
    } catch (err) {
      next(err);
    }
  }

  // POST /chat/rooms/:roomId/members
  async addMember(req, res, next) {
    try {
      const { roomId } = req.params;
      const { userId: targetUserId } = req.body;
      const member = await ChatService.addRoomMember(req.user.id, roomId, targetUserId);
      res.status(201).json({ success: true, data: member });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /chat/rooms/:roomId/members/:userId
  async removeMember(req, res, next) {
    try {
      const { roomId, userId: targetUserId } = req.params;
      const result = await ChatService.removeRoomMember(req.user.id, roomId, targetUserId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // GET /chat/rooms/:roomId/messages
  async getMessages(req, res, next) {
    try {
      const { roomId } = req.params;
      const { limit, offset } = req.query;
      const messages = await ChatService.getRoomMessages(req.user.id, roomId, parseInt(limit) || 50, parseInt(offset) || 0);
      res.status(200).json({ success: true, data: messages });
    } catch (err) {
      next(err);
    }
  }

  // POST /chat/rooms/:roomId/messages
  async sendMessage(req, res, next) {
    try {
      const { roomId } = req.params;
      const message = await ChatService.sendMessage(req.user.id, roomId, req.body);
      res.status(201).json({ success: true, data: message });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ChatController();
