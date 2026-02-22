const MessageService = require('../services/message.service');

class MessageController {
  // POST /messages
  async sendMessage(req, res, next) {
    try {
      const message = await MessageService.sendMessage(req.user.id, req.body.room_id, req.body);
      res.status(201).json({ success: true, data: message });
    } catch (err) {
      next(err);
    }
  }

  // GET /rooms/:roomId/messages
  async getMessages(req, res, next) {
    try {
      const { roomId } = req.params;
      const { limit, offset } = req.query;
      const messages = await MessageService.getMessages(req.user.id, roomId, parseInt(limit) || 50, parseInt(offset) || 0);
      res.status(200).json({ success: true, data: messages });
    } catch (err) {
      next(err);
    }
  }

  // PUT /messages/:messageId
  async editMessage(req, res, next) {
    try {
      const updatedMessage = await MessageService.editMessage(req.user.id, req.params.messageId, req.body.content);
      res.status(200).json({ success: true, data: updatedMessage });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /messages/:messageId
  async deleteMessage(req, res, next) {
    try {
      const result = await MessageService.deleteMessage(req.user.id, req.params.messageId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  // POST /messages/:messageId/read
  async markAsRead(req, res, next) {
    try {
      const result = await MessageService.markAsRead(req.user.id, req.params.messageId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MessageController();
