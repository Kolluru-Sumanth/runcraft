import React, { useState } from "react";
import { useChat } from "../context/ChatContext";

export default function ChatPanel({ chatId }) {
  const { messages, addMessage } = useChat();
  const [input, setInput] = useState("");

  const chatMessages = messages.filter((m) => String(m.chatId) === String(chatId));

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    addMessage(chatId, input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-gray-900/60 border-r border-gray-700 backdrop-blur-md">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800/60 text-center">
        <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
          RunCraft Chat
        </h2>
        <p className="text-gray-500 text-xs mt-1">Chat ID: {chatId}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            No messages yet — start your prompt below 💬
          </p>
        ) : (
          chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[80%] p-3 rounded-xl ${
                msg.sender === "system"
                  ? "bg-gradient-to-r from-blue-500/30 to-teal-500/30 self-start text-gray-200"
                  : "bg-gray-800/70 border border-gray-700 self-end text-gray-100"
              }`}
            >
              {msg.text}
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t border-gray-700 bg-gray-800/60 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-xl bg-gray-900/60 border border-gray-700 p-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold shadow-md hover:opacity-90 transition-all duration-200"
        >
          Send
        </button>
      </form>
    </div>
  );
}
