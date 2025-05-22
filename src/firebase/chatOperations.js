import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, doc, getDoc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'spark-iq-secure-key-2024';

// Encrypt message
const encryptMessage = (text) => {
  if (!text) return '';
  try {
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY);
    // Verify encryption worked by trying to decrypt
    const test = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    if (test.toString(CryptoJS.enc.Utf8) === text) {
      return encrypted.toString();
    }
    // If verification fails, return original text
    console.warn('Encryption verification failed, sending as plain text');
    return text;
  } catch (error) {
    console.error('Encryption error:', error);
    return text;
  }
};

// Decrypt message
const decryptMessage = (ciphertext) => {
  if (!ciphertext) return '';
  
  // Check if the message is already decrypted
  if (!ciphertext.includes('U2F') && !ciphertext.includes('==')) {
    return ciphertext;
  }

  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      console.warn('Decryption produced empty string, message may not be encrypted');
      return ciphertext;
    }
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return ciphertext;
  }
};

// Send a message
export const sendMessage = async (chatId, senderId, message, type = 'text') => {
  if (!message.trim() || !chatId || !senderId) return false;
  
  try {
    // First verify the chat exists and the sender is a participant
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);
    
    if (!chatDoc.exists()) {
      throw new Error('Chat does not exist');
    }
    
    const chatData = chatDoc.data();
    if (!chatData.participants.includes(senderId)) {
      throw new Error('Sender is not a participant in this chat');
    }

    const encryptedMessage = encryptMessage(message.trim());
    const messageData = {
      chatId,
      senderId,
      message: encryptedMessage,
      type,
      timestamp: serverTimestamp(),
      isRead: false,
      participants: chatData.participants // Add participants to message for better querying
    };
    
    const messageRef = await addDoc(collection(db, 'messages'), messageData);
    
    // Update the chat's last message
    await updateDoc(chatRef, {
      lastMessage: encryptedMessage,
      lastMessageTime: serverTimestamp(),
      lastMessageSender: senderId,
      updatedAt: serverTimestamp() // Add this to help with sorting/querying
    });
    
    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get chat messages
export const subscribeToMessages = (chatId, callback) => {
  if (!chatId) return () => {};

  try {
    // Create a query that will get all messages for this chat
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('timestamp', 'asc')
    );

    // Set up real-time listener
    return onSnapshot(q, (snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Only process if we have valid data
        if (data.message && data.senderId) {
          messages.push({
            id: doc.id,
            text: decryptMessage(data.message),
            sender: data.senderId,
            timestamp: data.timestamp?.toDate().toLocaleTimeString() || new Date().toLocaleTimeString(),
            type: data.type,
            isRead: data.isRead
          });
        }
      });
      callback(messages);
    }, (error) => {
      console.error('Error in messages subscription:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Error setting up messages subscription:', error);
    return () => {};
  }
};

// Create a new chat
export const createChat = async (participants) => {
  if (!participants?.length) throw new Error('Participants are required');
  
  try {
    // Always sort participants to ensure consistent order
    const sortedParticipants = [...participants].sort();
    
    // Check if chat already exists
    const existingChatQuery = query(
      collection(db, 'chats'),
      where('participants', '==', sortedParticipants)
    );
    
    const existingChats = await getDocs(existingChatQuery);
    if (!existingChats.empty) {
      // Return existing chat ID if found
      return existingChats.docs[0].id;
    }
    
    const chatData = {
      participants: sortedParticipants,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: null,
      lastMessageTime: null,
      lastMessageSender: null
    };
    
    const chatRef = await addDoc(collection(db, 'chats'), chatData);
    return chatRef.id;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

// Get chat participants' info
export const getChatParticipantsInfo = async (participantIds) => {
  if (!participantIds?.length) return [];
  
  try {
    const participantsInfo = await Promise.all(
      participantIds.map(async (userId) => {
        const userDoc = await getDoc(doc(db, 'students', userId));
        if (!userDoc.exists()) {
          const teacherDoc = await getDoc(doc(db, 'teachers', userId));
          if (teacherDoc.exists()) {
            return {
              id: userId,
              ...teacherDoc.data()
            };
          }
          return null;
        }
        return {
          id: userId,
          ...userDoc.data()
        };
      })
    );
    
    return participantsInfo.filter(Boolean);
  } catch (error) {
    console.error('Error getting participants info:', error);
    throw error;
  }
}; 