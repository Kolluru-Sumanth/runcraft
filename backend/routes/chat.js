const express = require('express');
const { createChat, addMessage, getChatById, getUserWorkflowChats } = require('../controllers/chat');

const router = express.Router();

router.post('/', createChat);
router.post('/:chatId/message', addMessage);
router.get('/:chatId', getChatById);
router.get('/user/:userId/workflow/:workflowId', getUserWorkflowChats);

module.exports = router;
