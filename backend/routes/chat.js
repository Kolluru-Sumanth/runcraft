const express = require('express');
const { createChat, addMessage, getChatById } = require('../controllers/chat');

const router = express.Router();

router.post('/', createChat);
router.post('/:chatId/message', addMessage);
router.get('/:chatId', getChatById);

module.exports = router;
