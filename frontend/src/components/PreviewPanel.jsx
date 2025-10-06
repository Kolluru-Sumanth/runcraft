import React from "react";

export default function PreviewPanel({ url }) {
  return (
    <div className="h-full bg-gray-800/40 text-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800/60 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
            Website Preview
          </h2>
          <p className="text-gray-400 text-xs mt-1">Real-time frontend preview</p>
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:text-teal-400 transition"
          >
            Open in new tab ↗
          </a>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        {url ? (
          <iframe
            src={url}
            title="Website Preview"
            className="w-11/12 h-5/6 border border-gray-700 bg-gray-900/70 rounded-xl shadow-lg"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        ) : (
          <div className="border border-gray-700 bg-gray-900/70 rounded-xl shadow-lg w-11/12 h-5/6 flex items-center justify-center text-gray-500">
            <p>🔧 Your preview will be displayed here...</p>
          </div>
        )}
      </div>
    </div>
  );
}
