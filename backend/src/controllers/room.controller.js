const RoomService = require('../services/room.service');
const RoomMemberService = require('../services/roomMember.service');

class RoomController {
  // POST /rooms
  async createRoom(req, res, next) {
    try {
      const room = await RoomService.createRoom(req.user.id, req.body);
      res.status(201).json({ success: true, data: room });
    } catch (err) {
      next(err);
    }
  }

  // GET /rooms
  async getUserRooms(req, res, next) {
    try {
      const rooms = await RoomService.getUserRooms(req.user.id);
      res.status(200).json({ success: true, data: rooms });
    } catch (err) {
      next(err);
    }
  }

  // GET /rooms/:roomId
  async getRoomDetails(req, res, next) {
    try {
      const room = await RoomService.getRoomDetails(req.params.roomId);
      res.status(200).json({ success: true, data: room });
    } catch (err) {
      next(err);
    }
  }

  // PUT /rooms/:roomId
  async updateRoom(req, res, next) {
    try {
      const updatedRoom = await RoomService.updateRoom(req.params.roomId, req.user.id, req.body);
      res.status(200).json({ success: true, data: updatedRoom });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /rooms/:roomId
  async deleteRoom(req, res, next) {
    try {
      const result = await RoomService.deleteRoom(req.params.roomId, req.user.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new RoomController();
