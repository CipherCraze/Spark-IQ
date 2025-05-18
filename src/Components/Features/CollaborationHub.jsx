import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChatBubbleLeftEllipsisIcon,
  DocumentArrowUpIcon,
  UserGroupIcon,
  ClipboardDocumentIcon,
  VideoCameraIcon,
  PresentationChartBarIcon,
  StarIcon,
  ArrowPathIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  SparklesIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';

const CollaborationHub = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [whiteboardContent, setWhiteboardContent] = useState('');

  // Collaboration Features
  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([...messages, 
        { id: Date.now(), text: newMessage, sender: 'Educator', timestamp: new Date().toLocaleTimeString() }
      ]);
      setNewMessage('');
    }
  };

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files).map(file => ({
      id: Date.now(),
      name: file.name,
      type: file.type,
      size: file.size,
      preview: URL.createObjectURL(file)
    }));
    setFiles([...files, ...uploadedFiles]);
  };

  const createTask = () => {
    const newTask = {
      id: Date.now(),
      title: 'New Assignment',
      dueDate: '2024-04-01',
      status: 'pending',
      students: []
    };
    setTasks([...tasks, newTask]);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex">
      {/* Left Navigation */}
      <div className="w-20 bg-gray-800/50 border-r border-gray-700/50 flex flex-col items-center py-6">
        <nav className="space-y-6">
          {[
            { id: 'chat', icon: ChatBubbleLeftEllipsisIcon },
            { id: 'files', icon: DocumentArrowUpIcon },
            { id: 'tasks', icon: ClipboardDocumentIcon },
            { id: 'whiteboard', icon: PresentationChartBarIcon },
            { id: 'meet', icon: VideoCameraIcon }
          ].map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.1 }}
              className={`p-3 rounded-xl mb-4 ${activeTab === item.id ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:bg-gray-700/30'}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="w-6 h-6" />
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Collaborative Learning Space
          </h1>
          <p className="text-gray-400 mt-2">Computer Science - Advanced Algorithms</p>
        </div>

        {/* Content Area */}
        <div className="flex-1 grid grid-cols-3 gap-6 p-6">
          {/* Collaborative Whiteboard */}
          <motion.div 
            className={`col-span-2 bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 ${activeTab === 'whiteboard' ? 'block' : 'hidden'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                <PresentationChartBarIcon className="w-6 h-6 inline mr-2" />
                Interactive Whiteboard
              </h2>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-700/30 rounded-lg">
                  <ArrowsPointingOutIcon className="w-5 h-5 text-blue-400" />
                </button>
              </div>
            </div>
            <div className="h-[600px] bg-gray-900 rounded-lg border border-gray-700/50">
              {/* Whiteboard Content */}
            </div>
          </motion.div>

          {/* Chat Panel */}
          {activeTab === 'chat' && (
            <motion.div
              className="col-span-1 bg-gray-800/50 rounded-xl border border-gray-700/50 p-6"
              initial={{ x: 100 }}
              animate={{ x: 0 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">
                  <ChatBubbleLeftEllipsisIcon className="w-6 h-6 inline mr-2" />
                  Class Discussions
                </h2>
                <span className="text-gray-400 text-sm">34 participants</span>
              </div>
              <div className="h-[500px] overflow-y-auto mb-4 space-y-4">
                {messages.map(message => (
                  <div key={message.id} className="bg-gray-700/30 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-purple-400 text-sm">{message.sender}</span>
                      <span className="text-gray-500 text-xs">{message.timestamp}</span>
                    </div>
                    <p className="text-gray-300">{message.text}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Type your message..."
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-500 rounded-lg hover:bg-purple-600 flex items-center gap-2"
                >
                  <SparklesIcon className="w-4 h-4" />
                  Send
                </button>
              </form>
            </motion.div>
          )}

          {/* File Management */}
          {activeTab === 'files' && (
            <motion.div
              className="col-span-3 bg-gray-800/50 rounded-xl border border-gray-700/50 p-6"
              initial={{ y: 50 }}
              animate={{ y: 0 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">
                  <DocumentArrowUpIcon className="w-6 h-6 inline mr-2" />
                  Shared Resources
                </h2>
                <label className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 cursor-pointer">
                  <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                  Upload Files
                </label>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {files.map(file => (
                  <div key={file.id} className="bg-gray-900/30 p-4 rounded-lg border border-gray-700/50 hover:border-purple-400/30 transition-colors">
                    <div className="h-32 bg-gray-800 rounded-lg mb-2 flex items-center justify-center">
                      {file.type.startsWith('image/') ? (
                        <img src={file.preview} alt={file.name} className="h-full w-full object-cover rounded-lg" />
                      ) : (
                        <DocumentArrowUpIcon className="w-12 h-12 text-gray-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-300 truncate">{file.name}</div>
                    <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Task Management */}
          {activeTab === 'tasks' && (
            <motion.div
              className="col-span-3 bg-gray-800/50 rounded-xl border border-gray-700/50 p-6"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">
                  <ClipboardDocumentIcon className="w-6 h-6 inline mr-2" />
                  Assignments & Tasks
                </h2>
                <button 
                  onClick={createTask}
                  className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  New Task
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {tasks.map(task => (
                  <div key={task.id} className="bg-gray-900/30 p-4 rounded-lg border border-gray-700/50">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-gray-300 font-medium">{task.title}</h3>
                      <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded-full">
                        {task.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 mb-4">Due: {task.dueDate}</div>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {task.students.map((student, index) => (
                          <div key={index} className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                            {student.charAt(0)}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button className="p-1.5 hover:bg-gray-700/30 rounded-lg">
                          <PencilIcon className="w-4 h-4 text-blue-400" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-700/30 rounded-lg">
                          <TrashIcon className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default CollaborationHub;