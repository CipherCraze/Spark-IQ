import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase/firebaseConfig';
import ChatContainer from '../Chat/ChatContainer';

const ChatFunctionality = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-white">Please log in to access the chat.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <ChatContainer currentUserId={currentUser.uid} />
    </div>
  );
};

export default ChatFunctionality;