import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
// ... other imports ...
import { auth } from '../../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { saveChatMessage, getChatHistory, clearChatHistory, updateMessagePin } from '../../firebase/chatHistoryOperations';

const EducatorChatbot = () => {
  // ... existing state ...
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);

  // Check authentication and load chat history
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        loadChatHistory(user.uid);
      } else {
        setUserId(null);
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load chat history from Firebase
  const loadChatHistory = async (uid) => {
    try {
      const history = await getChatHistory(uid, true); // true for educator chat
      if (history.length > 0) {
        setMessages(history);
      } else {
        // Set initial greeting if no history
        setMessages([{
          id: Date.now(),
          text: initialPrompt,
          sender: 'bot',
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      setError('Failed to load chat history');
    }
  };

  // Modified handleSendMessage to save to Firebase
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    if (!userId) {
      setError('Please sign in to use the chatbot');
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsBotTyping(true);

    try {
      // Save user message to Firebase
      await saveChatMessage(userId, userMessage, true); // true for educator chat

      // Get bot response
      const botResponse = await sendMessageToGemini([...messages, userMessage]);
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Save bot message to Firebase
      await saveChatMessage(userId, botMessage, true); // true for educator chat
    } catch (error) {
      console.error('Error in chat:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I encountered an error. Please try again.",
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      await saveChatMessage(userId, errorMessage, true);
    } finally {
      setIsBotTyping(false);
    }
  };

  // Modified pinMessage to use Firebase
  const pinMessage = async (messageId) => {
    if (!userId) return;

    try {
      const message = messages.find(m => m.id === messageId);
      const newPinnedState = !message.pinned;
      
      await updateMessagePin(messageId, userId, newPinnedState);
      
      setMessages(prev =>
        prev.map(msg => msg.id === messageId ? { ...msg, pinned: newPinnedState } : msg)
      );
    } catch (error) {
      console.error('Error updating pin status:', error);
    }
  };

  // Modified clearAllChats to use Firebase
  const clearAllChats = async () => {
    if (!userId) return;

    try {
      await clearChatHistory(userId, true); // true for educator chat
      setMessages([]);
      setChatHistory([]);
    } catch (error) {
      console.error('Error clearing chat history:', error);
      setError('Failed to clear chat history');
    }
  };

  // ... rest of your existing component code ...

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark' : 'light'}`}>
      {/* Add authentication status indicator */}
      <div className="absolute top-4 right-4 text-sm text-gray-400">
        {userId ? (
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            Signed In
          </span>
        ) : (
          <span className="flex items-center gap-2 text-red-400">
            <span className="w-2 h-2 bg-red-400 rounded-full"></span>
            Please sign in to save chat history
          </span>
        )}
      </div>

      {/* ... rest of your existing JSX ... */}
    </div>
  );
};

export default EducatorChatbot; 