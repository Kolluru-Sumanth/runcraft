const Chat = require('../models/Chat');
const axios = require('axios');
const Workflow = require('../models/Workflow');


const createChat = async (req, res) => {
  try {
    const { userId, workflow, message } = req.body;

    // Step 1: Fetch the workflow document
    const workflowDoc = await Workflow.findById(workflow);
    if (!workflowDoc) {
      return res.status(404).json({ message: "Workflow not found" });
    }
    console.log("Workflow Document:", workflowDoc);
    // Step 2: Get n8n prompt from workflow doc
    const n8nprompt = workflowDoc.webhookUsageDescription;
    if (!n8nprompt) {
      return res.status(400).json({ message: "webhookUsageDescription not found in workflow document" });
    }

    // Step 3: Create the chat with an initial user message
    const chat = await Chat.create({
      userId,
      workflow,
      title: "New Chat",
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    // Step 4: Send the initial message to the n8n webhook
    const response = await axios.post("https://n8n.jayaprakash.space/webhook/chat", {
      sessionId: chat._id,
      message,
      n8nprompt,
      firstMessage: true,
    });

    console.log("Response from n8n:", response.data);

    // Step 5: Extract AI's response and update chat
    chat.url = response.data.preview_url || "";
    chat.container = response.data.container_name || "";
    const aiMessage = response.data.output;

    chat.messages.push({
      role: "ai",
      content: aiMessage || "No response from AI",
    });

    await chat.save();

    // Step 6: Send the complete chat as response
    res.status(201).json(chat);
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({
      message: "Failed to create chat",
      error: error.message,
    });
  }
};


const addMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;

    // Step 1: Find the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Step 2: Add the user's message
    chat.messages.push({
      role: "user",
      content: message,
    });

    // Step 3: Fetch workflow document to get n8nprompt
    const workflowDoc = await Workflow.findById(chat.workflow);
    if (!workflowDoc) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    const n8nprompt = workflowDoc.webhookUsageDescription;
    if (!n8nprompt) {
      return res
        .status(400)
        .json({ message: "webhookusagedescription not found in workflow document" });
    }

    // Step 4: Send the message to n8n webhook
    const container = chat.container;
    const response = await axios.post("https://n8n.jayaprakash.space/webhook/chat", {
      container,
      sessionId: chat._id,
      message,
      n8nprompt,
      firstMessage: false,
    });

    console.log("Response from n8n:", response.data);

    // Step 5: Extract AI's response safely
    const aiMessage =
      response.data.output ||
      response.data.text ||
      response.data.message ||
      "No response from AI";

    // Step 6: Add AI response to chat
    chat.messages.push({
      role: "ai",
      content: aiMessage,
    });

    // Step 7: Save and respond
    await chat.save();
    res.status(200).json(chat);
  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({
      message: "Failed to add message",
      error: error.message,
    });
  }
};



// Get all chats for a specific user
const getUserChats = async (req, res) => {
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
const getChatById = async (req, res) => {
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

const getUserWorkflowChats = async (req, res) => {
  try {
    const { userId, workflowId } = req.params;
    const chats = await Chat.find({ userId, workflow: workflowId }).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch chats', error: error.message });
  }
};

module.exports = {
  createChat,
  addMessage,
  getUserChats,
  getChatById,
  getUserWorkflowChats
};
