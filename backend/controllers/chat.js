const Chat = require('../models/Chat');
const axios = require('axios');


export const createChat = async (req, res) => {
  try {
    const { userId, workflow, message } = req.body;

    // Step 1: Create the chat with an initial system message
    const chat = await Chat.create({
      userId,
      workflow,
      title:'New Chat',
      messages: [{
        role: 'user',
        content: message
      }]
    });



    //should get this value from workflow document
    const n8nprompt = "this is a email summarizer workflow with POST /summarize and GET/mails endpoints"
    // Step 2: Send the initial system message to the n8n webhook
    const response = await axios.post('https://n8n.jayaprakash.space/webhook-test/chat', {
      sessionId: chat._id,
      message: message,
      n8nprompt,
      firstMessage: true        
    });
    console.log("Response from n8n:", response.data);
    // Step 3: Extract AI's initial message
    chat.url = response.data.preview_url || "";
    chat.container = response.data.container_name || "";
    const aiMessage = response.data.output;
    // Step 4: Add AI's response to the chat document
    chat.messages.push({ role: 'ai', content: aiMessage || "No response from AI" });
    await chat.save();

    // Step 5: Respond with the complete chat
    res.status(201).json(chat);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create chat', error: error.message });
  }
};


export const addMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;

    // Step 1: Find the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Step 2: Add the user's message
    chat.messages.push({
      role: 'user',
      content: message
    });
    const container = chat.container;
    // Step 3: Get workflow context or prompt (replace this with real workflow data if needed)
    const n8nprompt = "this is a email summarizer workflow with POST /summarize and GET/mails endpoints";

    // Step 4: Send the user message to the n8n webhook
    const response = await axios.post('https://n8n.jayaprakash.space/webhook-test/chat', {
      container,
      sessionId: chat._id,
      message,
      n8nprompt,
      firstMessage: false
    });

    console.log("Response from n8n:", response.data);

    // Step 5: Extract AI's message safely
    const aiMessage = response.data.Ja || response.data.text || response.data.message || "No response from AI";

    // Step 6: Add AI response to the chat
    chat.messages.push({
      role: 'ai',
      content: aiMessage
    });

    // Step 7: Save the updated chat
    await chat.save();

    // Step 8: Return updated chat
    res.status(200).json(chat);

  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({
      message: 'Failed to add message',
      error: error.message
    });
  }
};



// Get all chats for a specific user
export const getUserChats = async (req, res) => {
  try {
    const { userId } = req.params;

    const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch chats', error: error.message });
  }
};

// Get a single chat by ID
export const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId)
      .populate('userId', 'name email')
      .populate('workflow', 'name description');

    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch chat', error: error.message });
  }
};
