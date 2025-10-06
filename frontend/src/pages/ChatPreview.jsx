import React from "react";
import { useParams } from "react-router-dom";
import ChatPanel from "../components/ChatPanel";
import PreviewPanel from "../components/PreviewPanel";

export default function ChatPage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Left: Chat Panel (35%) */}
      <div className="w-[35%] border-r border-gray-800">
        <ChatPanel chatId={id} />
      </div>

      {/* Right: Preview Panel (65%) */}
      <div className="w-[65%]">
        <PreviewPanel url={'https://bolt.new'} />
      </div>
    </div>
  );
}
