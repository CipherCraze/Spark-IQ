import { collection, addDoc, query, where, getDocs, orderBy, limit, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

// Changed collection name to avoid conflict with questionHistory
const sparkyChatCollection = collection(db, 'sparkyChatMessages');

// Save chat message to Firebase
export const saveChatMessage = async (userId, message, isEducator = false) => {
  if (!userId) throw new Error('User must be authenticated to save messages');

  try {
    const chatEntry = {
      userId,
      text: message.text || '',
      sender: message.sender || 'user',
      timestamp: message.timestamp || new Date().toISOString(),
      isEducator: Boolean(isEducator),
      pinned: Boolean(message.pinned)
    };

    // Validate required fields
    if (!chatEntry.text || typeof chatEntry.text !== 'string') {
      throw new Error('Message text is required and must be a string');
    }
    if (!['user', 'bot'].includes(chatEntry.sender)) {
      throw new Error('Invalid sender type');
    }

    const docRef = await addDoc(sparkyChatCollection, chatEntry);
    return docRef.id;
  } catch (error) {
    console.error('Error saving chat message:', error);
    throw error;
  }
};

// Get chat history for a user
export const getChatHistory = async (userId, isEducator = false, limitCount = 100) => {
  if (!userId) throw new Error('User must be authenticated to get chat history');

  try {
    const q = query(
      sparkyChatCollection,
      where('userId', '==', userId),
      where('isEducator', '==', isEducator),
      orderBy('timestamp', 'asc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || new Date(doc.data().timestamp)
    }));
  } catch (error) {
    console.error('Error getting chat history:', error);
    if (error.code === 'failed-precondition' || error.code === 'resource-exhausted') {
      console.error('Index missing or other Firebase error:', error);
    }
    throw error;
  }
};

// Clear chat history for a user
export const clearChatHistory = async (userId, isEducator = false) => {
  if (!userId) throw new Error('User must be authenticated to clear chat history');

  try {
    const q = query(
      sparkyChatCollection,
      where('userId', '==', userId),
      where('isEducator', '==', isEducator)
    );
    
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    return true;
  } catch (error) {
    console.error('Error clearing chat history:', error);
    throw error;
  }
};

// Update message pin status
export const updateMessagePin = async (messageId, userId, isPinned) => {
  if (!userId || !messageId) throw new Error('User must be authenticated to pin messages');

  try {
    const docRef = doc(db, 'sparkyChatMessages', messageId);
    await updateDoc(docRef, {
      pinned: Boolean(isPinned)
    });
    return true;
  } catch (error) {
    console.error('Error updating message pin status:', error);
    throw error;
  }
}; 