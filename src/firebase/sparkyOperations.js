import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { encryptMessage, decryptMessage } from './chatOperations';

const sparkyChatsCollection = collection(db, 'sparkyChats');
const SPARKY_BOT_ID = 'sparky-bot';

// Initialize or get Sparky chat for a user
export const initializeSparkyChat = async (userId) => {
  try {
    // Check if user already has a Sparky chat
    const q = query(
      sparkyChatsCollection,
      where('userId', '==', userId)
    );
    
    const existingChats = await getDocs(q);
    if (!existingChats.empty) {
      return existingChats.docs[0].id;
    }
    
    // Create new Sparky chat
    const chatData = {
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: null,
      lastMessageTime: null,
      lastMessageSender: null
    };
    
    const chatRef = await addDoc(sparkyChatsCollection, chatData);
    return chatRef.id;
  } catch (error) {
    console.error('Error initializing Sparky chat:', error);
    throw error;
  }
};

// Save message to Sparky chat
export const saveSparkyMessage = async (chatId, message, isUserMessage = true) => {
  try {
    const chatRef = doc(db, 'sparkyChats', chatId);
    const chatDoc = await getDoc(chatRef);
    
    if (!chatDoc.exists()) {
      throw new Error('Chat does not exist');
    }
    
    const encryptedMessage = encryptMessage(message);
    const messageData = {
      chatId,
      message: encryptedMessage,
      timestamp: serverTimestamp(),
      isUserMessage,
      sender: isUserMessage ? chatDoc.data().userId : SPARKY_BOT_ID
    };
    
    // Save message
    await addDoc(collection(db, 'sparkyMessages'), messageData);
    
    // Update chat's last message
    await updateDoc(chatRef, {
      lastMessage: encryptedMessage,
      lastMessageTime: serverTimestamp(),
      lastMessageSender: isUserMessage ? chatDoc.data().userId : SPARKY_BOT_ID,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error saving Sparky message:', error);
    throw error;
  }
};

// Get chat history for a specific Sparky chat
export const getSparkyHistory = async (chatId) => {
  try {
    const q = query(
      collection(db, 'sparkyMessages'),
      where('chatId', '==', chatId),
      orderBy('timestamp', 'asc')
    );
    
    const snapshot = await getDocs(q);
    const messages = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        message: decryptMessage(data.message),
        timestamp: data.timestamp?.toDate() || new Date(),
        isUserMessage: data.isUserMessage,
        sender: data.sender
      });
    });
    
    return messages;
  } catch (error) {
    console.error('Error getting Sparky history:', error);
    throw error;
  }
};

// Delete Sparky chat history
export const deleteSparkyHistory = async (chatId) => {
  try {
    const messagesQuery = query(
      collection(db, 'sparkyMessages'),
      where('chatId', '==', chatId)
    );
    
    const snapshot = await getDocs(messagesQuery);
    const deletePromises = snapshot.docs.map(doc => 
      doc.ref.delete()
    );
    
    await Promise.all(deletePromises);
    
    // Reset chat metadata
    const chatRef = doc(db, 'sparkyChats', chatId);
    await updateDoc(chatRef, {
      lastMessage: null,
      lastMessageTime: serverTimestamp(),
      lastMessageSender: null,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting Sparky history:', error);
    throw error;
  }
}; 