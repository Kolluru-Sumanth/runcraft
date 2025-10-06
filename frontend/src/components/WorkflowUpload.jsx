import React, { useState, useRef } from "react";

function WorkflowUpload({ onFileUpload, isMobile = false }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const processFile = async (file) => {
    if (!file.name.toLowerCase().endsWith('.json')) {
      alert('Please upload a JSON file only.');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workflowData = JSON.parse(e.target.result);
          onFileUpload(workflowData);
        } catch (error) {
          alert('Invalid JSON file. Please upload a valid n8n workflow.');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      alert('Error reading file. Please try again.');
      setIsUploading(false);
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`${isMobile ? 'mb-4' : 'mb-6'}`}>
      <label className={`block font-medium text-gray-700 mb-2 ${isMobile ? 'text-sm' : 'text-sm'}`}>
        Upload n8n Workflow
      </label>
      
      <div
        className={`
          border-2 border-dashed rounded-lg text-center transition-all duration-200 cursor-pointer
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
          ${isMobile ? 'p-4' : 'p-6'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClickUpload}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-sm text-gray-600">Processing file...</p>
          </div>
        ) : (
          <>
            <div className="text-gray-400 mb-2">
              <svg 
                className={`mx-auto ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                />
              </svg>
            </div>
            
            <div className="space-y-1">
              <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Click to upload or drag and drop
              </p>
              <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                JSON files only
              </p>
            </div>

            {/* Mobile-specific enhancements */}
            {isMobile && (
              <div className="mt-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Tap to browse files
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* File format info for mobile */}
      {isMobile && (
        <div className="mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Supports: .json workflow files
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkflowUpload;