import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, getDocs, or, serverTimestamp } from 'firebase/firestore';
import { db, chatsCollection, messagesCollection } from '../../firebase/firebaseConfig';
import { sendMessage, subscribeToMessages, createChat, getChatParticipantsInfo } from '../../firebase/chatOperations';
import { 
  UserCircleIcon, 
  PaperAirplaneIcon,
  EllipsisHorizontalIcon,
  PhoneIcon,
  VideoCameraIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
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
      <div className="flex flex-col h-[600px] bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700/30 shadow-xl">
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-[600px] bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700/30 shadow-xl">
        <div className="flex items-center justify-center h-full">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  const otherParticipant = participantInfo?.find(p => p.id === selectedUserId);

  return (
    <div className="flex flex-col h-[600px] bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700/30 shadow-xl">
      {/* Enhanced Chat Header */}
      <div className="p-4 border-b border-gray-700/50 flex items-center justify-between bg-gradient-to-r from-gray-800/80 to-gray-900/80">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {participantInfo?.find(p => p.id === selectedUserId)?.avatar ? (
              <img 
                src={participantInfo.find(p => p.id === selectedUserId).avatar}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/30"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center border-2 border-indigo-500/30">
                <UserCircleIcon className="w-8 h-8 text-indigo-400" />
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
          </div>
          <div>
            <h2 
              onClick={() => handleProfileClick(selectedUserId)}
              className="text-lg font-semibold text-white hover:text-indigo-400 transition-colors cursor-pointer"
            >
              {participantInfo?.find(p => p.id === selectedUserId)?.name || 'Chat'}
            </h2>
            <p className="text-sm text-gray-400">Online</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
            <PhoneIcon className="w-5 h-5 text-gray-400 hover:text-indigo-400" />
          </button>
          <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
            <VideoCameraIcon className="w-5 h-5 text-gray-400 hover:text-indigo-400" />
          </button>
          <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
            <InformationCircleIcon className="w-5 h-5 text-gray-400 hover:text-indigo-400" />
          </button>
        </div>
      </div>

      {/* Enhanced Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-900/50 to-gray-800/50">
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
                      className="w-8 h-8 rounded-full object-cover border border-gray-700/50"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                      <UserCircleIcon className="w-6 h-6 text-indigo-400" />
                    </div>
                  )}
                </div>
              )}
              <div
                className={`max-w-[70%] p-3 rounded-xl ${
                  isCurrentUser
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                    : 'bg-gray-700/60 text-gray-100'
                } shadow-lg hover:scale-[1.02] transition-transform`}
              >
                <div 
                  className="cursor-pointer hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProfileClick(message.sender);
                  }}
                >
                  <span className="text-sm font-medium opacity-75">
                    {senderInfo?.name || 'Unknown User'}
                  </span>
                </div>
                <p className="mt-1">{message.text}</p>
                <span className="text-xs opacity-75 mt-2 block">
                  {new Date(message.timestamp?.toDate()).toLocaleTimeString()}
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
                      className="w-8 h-8 rounded-full object-cover border border-gray-700/50"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                      <UserCircleIcon className="w-6 h-6 text-indigo-400" />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700/50 bg-gray-800/80">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface; 