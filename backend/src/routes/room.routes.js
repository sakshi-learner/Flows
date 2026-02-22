const express = require('express');
const router = express.Router();
const RoomController = require('../controllers/room.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Room CRUD
router.post('/', authMiddleware, RoomController.createRoom);
router.get('/', authMiddleware, RoomController.getUserRooms);
router.get('/:roomId', authMiddleware, RoomController.getRoomDetails);
router.put('/:roomId', authMiddleware, RoomController.updateRoom);
router.delete('/:roomId', authMiddleware, RoomController.deleteRoom);

module.exports = router;
