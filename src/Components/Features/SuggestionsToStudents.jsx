import { useState, useRef } from 'react';
import {
  PaperClipIcon,
  XMarkIcon,
  DocumentTextIcon,
  ArrowUpTrayIcon,
  SparklesIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const SuggestionsToStudents = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files.map(f => ({ 
      name: f.name, 
      size: f.size, 
      type: f.type, 
      fileObject: f 
    }))]);
  };

  const removeAttachment = (fileName) => {
    setAttachments(prev => prev.filter(file => file.name !== fileName));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      // TODO: Implement the actual submission logic here
      // This is where you would send the suggestion to your backend
      console.log('Submitting suggestion:', {
        title,
        description,
        attachments
      });

      // Clear form after successful submission
      setTitle('');
      setDescription('');
      setAttachments([]);
    } catch (error) {
      console.error('Error submitting suggestion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8 pt-5">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
            <AcademicCapIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            Send New Suggestion
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pt-5">
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 backdrop-blur-sm">
            <div className="space-y-6">
              {/* Title Input */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 bg-gray-100/60 dark:bg-gray-700/60 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500/70 dark:placeholder-gray-400/70 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter suggestion title"
                  required
                />
              </div>

              {/* Description Input */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-gray-100/60 dark:bg-gray-700/60 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500/70 dark:placeholder-gray-400/70 min-h-[200px] focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter detailed suggestion description..."
                  required
                />
              </div>

              {/* File Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Attachments
                </label>
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200/70 dark:hover:bg-gray-700/70 transition-all"
                  >
                    <ArrowUpTrayIcon className="w-5 h-5" />
                    Attach Files
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    multiple
                  />
                  
                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      {attachments.map((file, i) => (
                        <div 
                          key={i} 
                          className="flex items-center gap-2 p-2 bg-gray-100/50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <DocumentTextIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1" title={file.name}>
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(file.name)}
                            className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <XMarkIcon className="w-4 h-4 text-red-500 dark:text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !description.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <SparklesIcon className="w-5 h-5" />
              {isSubmitting ? 'Sending...' : 'Send Suggestion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuggestionsToStudents;