import React from 'react';

function PromptPanel({ prompt, setPrompt, onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    const chatId = Date.now();
    onSubmit(chatId, prompt);
  };

  return (
    <div className="h-full flex flex-col justify-center items-center">
      <div className="w-full max-w-2xl p-6">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
            Build Your Website with RunCraft
          </h1>

          <p className="text-gray-300 mb-8 text-md">
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
      </div>
    </div>
  );
}

export default PromptPanel;
