import React from "react";
import WorkflowUpload from "./WorkflowUpload";
import WorkflowInfo from "./WorkflowInfo";

function LeftPanel({ 
  workflow, 
  onFileUpload, 
  onGenerateUI, 
  isGenerating, 
  isOpen = true, 
  onClose 
}) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl">
            <MobilePanelContent 
              workflow={workflow}
              onFileUpload={onFileUpload}
              onGenerateUI={onGenerateUI}
              isGenerating={isGenerating}
              onClose={onClose}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-1/4 min-w-80 bg-white border-r border-gray-200 flex-col">
        <DesktopPanelContent 
          workflow={workflow}
          onFileUpload={onFileUpload}
          onGenerateUI={onGenerateUI}
          isGenerating={isGenerating}
        />
      </div>
    </>
  );
}

function MobilePanelContent({ workflow, onFileUpload, onGenerateUI, isGenerating, onClose }) {
  return (
    <div className="h-full flex flex-col p-4">
      {/* Mobile Header with Close Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Astraflow</h1>
          <p className="text-gray-600 text-xs">Transform n8n workflows</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <PanelContent 
        workflow={workflow}
        onFileUpload={onFileUpload}
        onGenerateUI={onGenerateUI}
        isGenerating={isGenerating}
        isMobile={true}
      />
    </div>
  );
}

function DesktopPanelContent({ workflow, onFileUpload, onGenerateUI, isGenerating }) {
  return (
    <div className="p-6 flex flex-col h-full">
      {/* Desktop Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Astraflow</h1>
        <p className="text-gray-600 text-sm">Transform n8n workflows into React applications</p>
      </div>

      <PanelContent 
        workflow={workflow}
        onFileUpload={onFileUpload}
        onGenerateUI={onGenerateUI}
        isGenerating={isGenerating}
        isMobile={false}
      />
    </div>
  );
}

function PanelContent({ workflow, onFileUpload, onGenerateUI, isGenerating, isMobile }) {
  return (
    <>
      {/* File Upload */}
      <div className="flex-none">
        <WorkflowUpload onFileUpload={onFileUpload} isMobile={isMobile} />
      </div>

      {/* Workflow Info */}
      <div className="flex-1 min-h-0">
        <WorkflowInfo workflow={workflow} isMobile={isMobile} />
      </div>

      {/* Generate Button */}
      <div className="flex-none mt-6">
        <button
          onClick={onGenerateUI}
          disabled={!workflow || isGenerating}
          className={`
            w-full bg-blue-600 hover:bg-blue-700 text-white font-medium 
            py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed 
            transition-colors flex items-center justify-center gap-2
            ${isMobile ? 'text-sm' : ''}
          `}
        >
          {isGenerating ? (
            <>
              <span className="animate-spin">⏳</span>
              Generating...
            </>
          ) : (
            <>
              🚀 Generate Business App
            </>
          )}
        </button>
      </div>

      {/* Tips */}
      <div className="flex-none mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-800 mb-2">💡 Tips</h4>
        <ul className={`text-gray-600 space-y-1 ${isMobile ? 'text-xs' : 'text-xs'}`}>
          <li>• Upload any n8n workflow JSON file</li>
          <li>• Generated apps include authentication</li>
          <li>• Download complete React projects</li>
          <li>• Preview apps work with real webhooks</li>
        </ul>
      </div>
    </>
  );
}

export default LeftPanel;