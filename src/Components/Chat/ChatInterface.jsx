import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, getDocs, or, serverTimestamp } from 'firebase/firestore';
import { db, chatsCollection, messagesCollection } from '../../firebase/firebaseConfig';
import { sendMessage, subscribeToMessages, createChat, getChatParticipantsInfo } from '../../firebase/chatOperations';
import { UserCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const ChatInterface = ({ currentUserId, selectedUserId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participantInfo, setParticipantInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const chatSubscriptionRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleProfileClick = (userId) => {
    console.log('Profile click handler called with userId:', userId);
    navigate(`/view-profile/${userId}`);
  };

  // Cleanup function to handle unsubscribing from all listeners
  const cleanup = () => {
    if (chatSubscriptionRef.current) {
      chatSubscriptionRef.current();
      chatSubscriptionRef.current = null;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const setupChat = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Cleanup previous subscriptions
        cleanup();
        
        // Find existing chat with both combinations of sender/receiver
        const chatQuery = query(
          chatsCollection,
          or(
            where('participants', '==', [currentUserId, selectedUserId].sort()),
            where('participants', '==', [selectedUserId, currentUserId].sort())
          )
        );
        
        const querySnapshot = await getDocs(chatQuery);
        let existingChat = querySnapshot.docs[0];
        
        if (!existingChat) {
          // Create new chat with sorted participants
          const participants = [currentUserId, selectedUserId].sort();
          const newChatId = await createChat(participants);
          setChatId(newChatId);
        } else {
          setChatId(existingChat.id);
        }

        // Get participant information
        const participants = [currentUserId, selectedUserId];
        const info = await getChatParticipantsInfo(participants);
        setParticipantInfo(info);
      } catch (err) {
        console.error('Error setting up chat:', err);
        setError('Failed to set up chat. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId && selectedUserId) {
      setupChat();
    }

    // Cleanup on unmount or when users change
    return cleanup;
  }, [currentUserId, selectedUserId]);

  useEffect(() => {
    if (!chatId) return;

    // Set up real-time message listener using chatOperations
    chatSubscriptionRef.current = subscribeToMessages(chatId, (newMessages) => {
      setMessages(newMessages);
      scrollToBottom();
    });

    // Cleanup subscription when chatId changes or component unmounts
    return () => {
      if (chatSubscriptionRef.current) {
        chatSubscriptionRef.current();
      }
    };
  }, [chatId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;

    try {
      await sendMessage(chatId, currentUserId, newMessage.trim());
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[600px] bg-gray-800 rounded-lg shadow">
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-[600px] bg-gray-800 rounded-lg shadow">
        <div className="flex items-center justify-center h-full">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  const otherParticipant = participantInfo?.find(p => p.id === selectedUserId);

  return (
    <div className="flex flex-col h-[600px] bg-gray-800 rounded-lg shadow">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700 flex items-center">
        <div className="flex items-center space-x-3">
          {participantInfo && participantInfo.find(p => p.id === selectedUserId)?.avatar ? (
            <img 
              src={participantInfo.find(p => p.id === selectedUserId).avatar}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <UserCircleIcon className="w-10 h-10 text-gray-400" />
          )}
          <h2 
            onClick={() => handleProfileClick(selectedUserId)}
            className="text-xl font-semibold text-white select-none cursor-pointer hover:text-indigo-400 transition-colors"
          >
            {participantInfo?.find(p => p.id === selectedUserId)?.name || 'Chat'}
          </h2>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800">
        {messages.map((message) => {
          const isCurrentUser = message.sender === currentUserId;
          const senderInfo = participantInfo?.find(p => p.id === message.sender);
          
          return (
            <div
              key={message.id}
              className={`flex items-start space-x-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isCurrentUser && (
                <div 
                  className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProfileClick(message.sender);
                  }}
                >
                  {senderInfo?.avatar ? (
                    <img 
                      src={senderInfo.avatar}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="w-8 h-8 text-gray-400" />
                  )}
                </div>
              )}
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  isCurrentUser
                    ? 'bg-indigo-500 text-white ml-2'
                    : 'bg-gray-700 text-gray-100 mr-2'
                }`}
              >
                <div 
                  className="cursor-pointer hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Name clicked, sender:', message.sender);
                    handleProfileClick(message.sender);
                  }}
                >
                  <span className="text-sm font-medium opacity-75">
                    {senderInfo?.name || 'Unknown User'}
                  </span>
                </div>
                <p>{message.text}</p>
                <span className="text-xs opacity-75 mt-1 block">
                  {message.timestamp}
                </span>
              </div>
              {isCurrentUser && (
                <div 
                  className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProfileClick(message.sender);
                  }}
                >
                  {senderInfo?.avatar ? (
                    <img 
                      src={senderInfo.avatar}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="w-8 h-8 text-gray-400" />
                  )}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface; 