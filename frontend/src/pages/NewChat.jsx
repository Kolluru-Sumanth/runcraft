import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../context/ChatContext";
import PromptPanel from "../components/chat/PromptPanel";
import PreviewPanel from "../components/PreviewPanel";
import ChatPanel from "../components/ChatPanel";

export default function NewChat() {
  const [prompt, setPrompt] = useState("");
  const [chatStarted, setChatStarted] = useState(false);
  const [chatId, setChatId] = useState(null);
  const { addMessage } = useChat();

  useEffect(() => {
    // Tell the parent component to collapse the sidebar
    if (window.collapseCallback) {
      window.collapseCallback();
    }
  }, []);

  const handleSubmit = (newChatId, promptText) => {
    if (addMessage) {
      setChatId(newChatId);
      addMessage(newChatId, promptText);
      setChatStarted(true);
    }
  };

  return (
    <div className="h-full flex bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {!chatStarted ? (
        // Initial Prompt Screen
        <div className="w-full">
          <div className="h-full flex flex-col">
            <div className="flex-1">
              <PromptPanel 
                prompt={prompt}
                setPrompt={setPrompt}
                onSubmit={handleSubmit}
              />
            </div>
            
            <p className="text-gray-500 text-sm text-center pb-4">
              ⚡ Powered by <span className="text-blue-500 font-semibold">RunCraft</span> & AI
            </p>
          </div>
        </div>
      ) : (
        // Chat Interface
        <>
          {/* Left: Chat Panel (35%) */}
          <div className="w-[35%] border-r border-gray-800">
            <ChatPanel chatId={chatId} />
          </div>

          {/* Right: Preview Panel (65%) */}
          <div className="w-[65%]">
            <PreviewPanel url={'https://bolt.new'} />
          </div>
        </>
      )}
    </div>
  );
}
