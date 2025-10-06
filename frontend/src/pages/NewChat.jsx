// src/pages/NewChat.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../context/ChatContext";

export default function NewChat() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const { addMessage } = useChat();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    const chatId = Date.now(); // mock ID
    addMessage(chatId, prompt); // store globally
    navigate(`/chat/${chatId}`, { state: { prompt } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl w-full bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-700">
        <h1 className="text-4xl font-extrabold text-center mb-4 bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
          Build Your Website with RunCraft
        </h1>

        <p className="text-gray-300 text-center mb-8 text-md">
          Build Stunning <span className="text-blue-400 font-semibold">Apps & Websites</span> for your{" "}
          <span className="text-teal-400 font-semibold">n8n workflow</span>.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your idea and let's build it together!"
            className="w-full h-32 rounded-xl bg-gray-900/60 border border-gray-700 p-4 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold text-lg shadow-lg hover:opacity-90 transition-all duration-200"
          >
            Generate Frontend
          </button>
        </form>
      </div>

      <p className="text-gray-500 text-sm mt-6">
        ⚡ Powered by <span className="text-blue-500 font-semibold">RunCraft</span> & AI
      </p>
    </div>
  );
}
