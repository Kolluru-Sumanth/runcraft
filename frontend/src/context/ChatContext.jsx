// src/context/ChatContext.jsx
import React, { createContext, useContext, useState } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);

  const addMessage = (chatId, text) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), chatId, text, sender: "user", timestamp: new Date() },
    ]);
  };

  return (
    <ChatContext.Provider value={{ messages, addMessage }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
