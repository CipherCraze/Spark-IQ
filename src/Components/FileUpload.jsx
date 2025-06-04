import React, { useState } from 'react';
import { 
  ArrowUpTrayIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export const FileUpload = ({ onFileChange, onSubmit, file, isEvaluating }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    onFileChange(null);
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-500/10' 
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!file ? (
          <div className="text-center">
            <ArrowUpTrayIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-300 mb-1">Drag and drop your file here</p>
            <p className="text-gray-400 text-sm mb-4">or</p>
            <label className="inline-block px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors">
              <span className="text-gray-300">Browse Files</span>
              <input
                type="file"
                className="hidden"
                onChange={handleChange}
                disabled={isEvaluating}
              />
            </label>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-700 rounded-lg">
                <ArrowUpTrayIcon className="w-5 h-5 text-gray-300" />
              </div>
              <div>
                <p className="text-gray-300 font-medium truncate max-w-[200px]">
                  {file.name}
                </p>
                <p className="text-gray-400 text-sm">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
              disabled={isEvaluating}
            >
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        )}
      </div>

      {file && (
        <button
          onClick={onSubmit}
          disabled={isEvaluating}
          className={`mt-4 w-full py-2 px-4 rounded-lg font-medium transition-all ${
            isEvaluating
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isEvaluating ? 'Evaluating...' : 'Submit Assignment'}
        </button>
      )}
    </div>
  );
};
