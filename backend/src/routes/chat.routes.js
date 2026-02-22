const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chat.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Chat-specific routes
router.post('/rooms', authMiddleware, ChatController.createRoom);
router.post('/rooms/:roomId/members', authMiddleware, ChatController.addMember);
router.delete('/rooms/:roomId/members/:userId', authMiddleware, ChatController.removeMember);
router.get('/rooms/:roomId/messages', authMiddleware, ChatController.getMessages);
router.post('/rooms/:roomId/messages', authMiddleware, ChatController.sendMessage);
router.post('/direct', authMiddleware, ChatController.openDirectChat);

module.exports = router;
