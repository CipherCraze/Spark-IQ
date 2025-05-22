import React, { useState } from 'react';
import ConnectionRequests from './ConnectionRequests';
import ConnectionsList from './ConnectionsList';
import ChatInterface from './ChatInterface';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const ChatContainer = ({ currentUserId }) => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'requests'
  const navigate = useNavigate();

  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-white">Please log in to access the chat.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Back to Dashboard Button */}
      <div className="mb-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-gray-300 hover:text-indigo-400 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="flex space-x-4">
        {/* Left Sidebar */}
        <div className="w-1/3">
          <div className="mb-4">
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-2 px-4 rounded-lg ${
                  activeTab === 'chat'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Chats
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 py-2 px-4 rounded-lg ${
                  activeTab === 'requests'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Requests
              </button>
            </div>
          </div>

          {activeTab === 'chat' ? (
            <ConnectionsList
              currentUserId={currentUserId}
              onSelectUser={setSelectedUserId}
            />
          ) : (
            <ConnectionRequests currentUserId={currentUserId} />
          )}
        </div>

        {/* Chat Area */}
        <div className="w-2/3">
          {selectedUserId ? (
            <ChatInterface
              currentUserId={currentUserId}
              selectedUserId={selectedUserId}
            />
          ) : (
            <div className="h-[600px] bg-gray-800 rounded-lg shadow flex items-center justify-center">
              <p className="text-gray-400 text-lg">
                Select a connection to start chatting
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatContainer; 