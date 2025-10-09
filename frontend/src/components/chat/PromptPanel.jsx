import React from 'react';

function PromptPanel({ prompt, setPrompt, onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    const chatId = Date.now();
    onSubmit(chatId, prompt);
  };

  return (
    <div className="h-full flex flex-col justify-center items-center bg-white text-gray-700 rounded-2xl shadow-lg border border-gray-200" style={{width: '100%', maxWidth: '100vw', boxSizing: 'border-box'}}>
      <div className="w-full max-w-2xl p-8" style={{maxWidth: '100%', width: '100%'}}>
        <div className="text-center">
          <h1 className="text-3xl font-extrabold mb-4 text-blue-800">
            Build Your Website with RunCraft
          </h1>

          <p className="text-gray-600 mb-8 text-md">
            Build Stunning <span className="text-blue-600 font-semibold">Apps & Websites</span> for your{' '}
            <span className="text-teal-600 font-semibold">n8n workflow</span>.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type your idea and let's build it together!"
              className="w-full h-32 rounded-xl bg-gray-50 border border-gray-300 p-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none shadow"
            />

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-lg shadow-lg hover:bg-blue-700 transition-all duration-200"
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
