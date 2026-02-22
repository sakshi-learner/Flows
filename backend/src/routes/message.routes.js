const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/message.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Message CRUD
router.post('/', authMiddleware, MessageController.sendMessage);
router.get('/rooms/:roomId', authMiddleware, MessageController.getMessages);
router.put('/:messageId', authMiddleware, MessageController.editMessage);
router.delete('/:messageId', authMiddleware, MessageController.deleteMessage);
router.post('/:messageId/read', authMiddleware, MessageController.markAsRead);

module.exports = router;
