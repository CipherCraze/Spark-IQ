import React, { useState, useEffect, useRef, useCallback } from 'react';
import CryptoJS from 'crypto-js';
import EmojiPicker from 'emoji-picker-react';
import {
  UserCircleIcon, PaperAirplaneIcon, UsersIcon, LockClosedIcon, Bars3Icon,
  XMarkIcon, MagnifyingGlassIcon, PlusCircleIcon, VideoCameraIcon, PhotoIcon,
  FaceSmileIcon, EllipsisVerticalIcon, MicrophoneIcon, LinkIcon, ArrowPathIcon,
  PaperClipIcon, DocumentTextIcon, CheckIcon, ChevronDownIcon, StarIcon,
  ArrowUturnLeftIcon, TrashIcon, ArrowLeftIcon, PhoneIcon, InformationCircleIcon,
  GifIcon, MapPinIcon, CalendarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as SolidStarIcon, MapPinIcon as SolidPinIcon } from '@heroicons/react/24/solid';

// Firebase imports (adjust paths if your firebaseConfig is elsewhere)
import { auth, db, connectionsCollection, studentsCollection, teachersCollection, chatsCollection } from '../../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, addDoc, deleteDoc, onSnapshot, or, and, serverTimestamp, orderBy, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

// --- IMPORT CENSORSHIP LOGIC ---
import { censorText } from '../../moderation/moderationConfig'; // Adjust path if moderationConfig.js is elsewhere

// --- Firebase Helper Operations (derived from your original components) ---

const getUserProfile = async (userId) => {
  if (!userId) return null;
  try {
    let userDocRef = doc(db, 'students', userId);
    let userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      userDocRef = doc(db, 'teachers', userId);
      userDocSnap = await getDoc(userDocRef);
    }
    if (userDocSnap.exists()) {
      return { id: userDocSnap.id, ...userDocSnap.data() };
    }
    console.warn(`User profile not found for ID: ${userId}`);
    return { id: userId, name: 'Unknown User', avatar: null }; // Fallback
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { id: userId, name: 'Error User', avatar: null }; // Error fallback
  }
};

const getChatParticipantsInfo = async (participantIds) => {
  if (!participantIds || participantIds.length === 0) return [];
  const participantPromises = participantIds.map(id => getUserProfile(id));
  const profiles = await Promise.all(participantPromises);
  return profiles.filter(p => p !== null);
};

const createChatInFirebase = async (participants) => { 
  const chatRef = doc(chatsCollection); 
  await setDoc(chatRef, {
    participants: participants.sort(), 
    createdAt: serverTimestamp(),
    lastMessageAt: serverTimestamp(),
    typing: {}
  });
  return chatRef.id;
};

const sendMessageToFirebase = async (chatId, senderId, textContent, files = [], replyToMessageId = null) => {
  const messagesColRef = collection(db, 'messages');
  const fileDataForFirestore = files.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      url: `placeholder_url_for_${file.name}` 
  }));

  // textContent here is expected to be ALREADY ENCRYPTED (and potentially censored before encryption)
  const messageData = {
    chatId, 
    sender: senderId,
    text: textContent, // This will store the encrypted (and pre-censored) text
    timestamp: serverTimestamp(),
    files: fileDataForFirestore,
    replyTo: replyToMessageId,
    reactions: {},
    isReadBy: { [senderId]: true }
  };
  const newMsgRef = await addDoc(messagesColRef, messageData);

  // lastMessageText will also store the encrypted (and pre-censored) text
  // If a plaintext preview is desired, this function would need to accept original censored plaintext.
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessageText: textContent || (files.length > 0 ? `Sent: ${files[0].name}` : "Sent a file"),
    lastMessageAt: serverTimestamp(),
    lastMessageSenderId: senderId,
    lastMessageId: newMsgRef.id,
  });
  return newMsgRef.id;
};

const subscribeToFirebaseMessages = (chatId, callback) => { 
  const messagesQuery = query(
    collection(db, 'messages'),
    where('chatId', '==', chatId),
    orderBy('timestamp', 'asc')
  );
  
  return onSnapshot(messagesQuery, (snapshot) => {
    const newMessages = snapshot.docs.map(docSnap => ({ // Renamed doc to docSnap to avoid conflict
      id: docSnap.id,
      ...docSnap.data(),
      timestamp: docSnap.data().timestamp?.toDate ? docSnap.data().timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...',
    }));
    callback(newMessages);
  }, (error) => {
    console.error("Error subscribing to messages:", error);
  });
};


// --- Main ChatFunctionality Component ---
const ChatFunctionality = () => {
  // Auth State
  const [fbCurrentUser, setFbCurrentUser] = useState(null);
  const [fbCurrentUserId, setFbCurrentUserId] = useState(null);
  const [fbCurrentUserName, setFbCurrentUserName] = useState('');
  const [fbCurrentUserProfile, setFbCurrentUserProfile] = useState(null);

  // UI States
  const [messageInputText, setMessageInputText] = useState(''); 
  const [displayedMessages, setDisplayedMessages] = useState([]); 
  const [activeChat, setActiveChat] = useState(null); 
  
  const [searchQueryConnections, setSearchQueryConnections] = useState(''); 
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsersDisplay, setTypingUsersDisplay] = useState(''); 
  
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [pinnedMessagesDisplay, setPinnedMessagesDisplay] = useState([]); 
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [replyingToMessage, setReplyingToMessage] = useState(null); 
  const [selectedFilesForUpload, setSelectedFilesForUpload] = useState([]); 
  const [activeMainTab, setActiveMainTab] = useState('friends'); 
  const [showChatInfoPanel, setShowChatInfoPanel] = useState(false); 
  const [messageSearchOpen, setMessageSearchOpen] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState('');

  // Firebase Data States
  const [connections, setConnections] = useState([]); 
  const [pendingReceivedRequests, setPendingReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [activeFirebaseChatId, setActiveFirebaseChatId] = useState(null);
  const [chatParticipantInfo, setChatParticipantInfo] = useState([]); 

  // Loading & Error States
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingChatMessages, setLoadingChatMessages] = useState(false);
  const [chatError, setChatError] = useState(null);
  
  // Refs
  const chatContainerRef = useRef(null);
  const messageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Encryption
  const encryptionKey = 'secure-encryption-key-v2'; // Store securely in a real app
  const encryptMessage = (text) => CryptoJS.AES.encrypt(text, encryptionKey).toString();
  const decryptMessage = (ciphertext) => {
    try {
      if (!ciphertext) return '';
      const bytes = CryptoJS.AES.decrypt(ciphertext, encryptionKey);
      const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
      return decryptedText || '[Encrypted]';
    } catch (e) {
      console.warn("Decryption error or already plain text:", e.message, ciphertext);
      return ciphertext || '[Error Decrypting]';
    }
  };
  
  const navigate = useNavigate(); 

  // --- Firebase Auth Effect ---
  useEffect(() => {
    setLoadingAuth(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFbCurrentUser(user);
        setFbCurrentUserId(user.uid);
        const userProfile = await getUserProfile(user.uid);
        setFbCurrentUserName(userProfile?.name || user.displayName || user.email || 'User');
        setFbCurrentUserProfile(userProfile);
      } else {
        setFbCurrentUser(null);
        setFbCurrentUserId(null);
        setFbCurrentUserName('');
        setFbCurrentUserProfile(null);
        setConnections([]);
        setPendingReceivedRequests([]);
        setSentRequests([]);
        setActiveChat(null);
        setActiveFirebaseChatId(null);
        setDisplayedMessages([]);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // --- Fetch Connections (Friends) ---
  useEffect(() => {
    if (!fbCurrentUserId) {
      setConnections([]);
      setLoadingConnections(false);
      return;
    }
    setLoadingConnections(true);
    const fetchConnectionDetails = async (connectionDoc) => {
      const connectionData = connectionDoc.data();
      const otherUserId = connectionData.senderId === fbCurrentUserId ? connectionData.receiverId : connectionData.senderId;
      const userProfile = await getUserProfile(otherUserId);
      return {
        firebaseConnectionId: connectionDoc.id,
        id: otherUserId, 
        name: userProfile?.name || (connectionData.senderId === fbCurrentUserId ? connectionData.receiverName : connectionData.senderName) || 'Unknown User',
        avatar: userProfile?.avatar || null,
        status: userProfile?.status || 'offline', 
      };
    };
    const q = query(
      connectionsCollection,
      and(
        or(
          where('senderId', '==', fbCurrentUserId),
          where('receiverId', '==', fbCurrentUserId)
        ),
        where('status', '==', 'accepted')
      )
    );
    const unsubscribe = onSnapshot(q, async (snapshot) => {
        const fetchedConnections = await Promise.all(snapshot.docs.map(fetchConnectionDetails));
        setConnections(fetchedConnections.filter(c => c.id)); 
        setLoadingConnections(false);
    }, (error) => {
        console.error("Error fetching connections:", error);
        setLoadingConnections(false);
    });
    return () => unsubscribe();
  }, [fbCurrentUserId]);

  // --- Fetch Connection Requests ---
  useEffect(() => {
    if (!fbCurrentUserId) {
      setPendingReceivedRequests([]);
      setSentRequests([]);
      setLoadingRequests(false);
      return;
    }
    setLoadingRequests(true);
    const receivedQuery = query(
      connectionsCollection,
      and(
        where('receiverId', '==', fbCurrentUserId),
        where('status', '==', 'pending')
      )
    );
    const unsubReceived = onSnapshot(receivedQuery, (snapshot) => {
      setPendingReceivedRequests(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))); // Renamed doc to docSnap
      setLoadingRequests(false); 
    }, (error) => { console.error('Error fetching received requests:', error); setLoadingRequests(false);});

    const sentQuery = query(
      connectionsCollection,
      and(
        where('senderId', '==', fbCurrentUserId),
        where('status', '==', 'pending')
      )
    );
    const unsubSent = onSnapshot(sentQuery, (snapshot) => {
      setSentRequests(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))); // Renamed doc to docSnap
    }, (error) => console.error('Error fetching sent requests:', error));
    return () => { unsubReceived(); unsubSent(); };
  }, [fbCurrentUserId]);

  // --- Setup Active Chat and Subscribe to Messages & Chat Details ---
  const messageSubscriptionRef = useRef(null);
  const chatDetailsSubscriptionRef = useRef(null);

  useEffect(() => {
    const cleanupSubscriptions = () => {
      if (messageSubscriptionRef.current) messageSubscriptionRef.current();
      if (chatDetailsSubscriptionRef.current) chatDetailsSubscriptionRef.current();
      messageSubscriptionRef.current = null;
      chatDetailsSubscriptionRef.current = null;
    };

    const setupActiveChat = async () => {
      if (!fbCurrentUserId || !activeChat?.id) { 
        setDisplayedMessages([]);
        setActiveFirebaseChatId(null);
        setChatParticipantInfo([]);
        cleanupSubscriptions();
        return;
      }
      setLoadingChatMessages(true);
      setChatError(null);
      cleanupSubscriptions();
      try {
        const otherUserId = activeChat.id;
        const participants = [fbCurrentUserId, otherUserId].sort();
        const chatQuery = query(chatsCollection, where('participants', '==', participants));
        const querySnapshot = await getDocs(chatQuery);
        let currentChatDocId = null;
        if (querySnapshot.empty) {
          currentChatDocId = await createChatInFirebase(participants);
        } else {
          currentChatDocId = querySnapshot.docs[0].id;
        }
        setActiveFirebaseChatId(currentChatDocId);
        const info = await getChatParticipantsInfo([fbCurrentUserId, otherUserId]);
        setChatParticipantInfo(info);

        if (currentChatDocId) {
          messageSubscriptionRef.current = subscribeToFirebaseMessages(currentChatDocId, (newMessages) => {
            setDisplayedMessages(newMessages.map(msg => ({
              ...msg,
              text: decryptMessage(msg.text), 
            })));
            setLoadingChatMessages(false);
          });

          chatDetailsSubscriptionRef.current = onSnapshot(doc(db, 'chats', currentChatDocId), (chatDoc) => {
            if (chatDoc.exists()) {
              const chatData = chatDoc.data();
              let typingString = '';
              let currentlyTyping = false;
              if (chatData.typing) {
                const activeTypers = Object.entries(chatData.typing)
                  .filter(([userId, status]) => userId !== fbCurrentUserId && status === true)
                  .map(([userId]) => info.find(p => p.id === userId)?.name || 'Someone');
                if (activeTypers.length > 0) {
                  currentlyTyping = true;
                  if (activeTypers.length === 1) typingString = `${activeTypers[0]} is typing...`;
                  else typingString = `${activeTypers.join(', ')} are typing...`;
                }
              }
              setIsTyping(currentlyTyping);
              setTypingUsersDisplay(typingString);
              if (chatData.pinnedMessageIds && Array.isArray(chatData.pinnedMessageIds)) {
                // Pinned messages logic
              }
            }
          });
        }
      } catch (err) {
        console.error('Error setting up chat:', err);
        setChatError('Failed to set up chat.');
        setLoadingChatMessages(false);
      }
    };
    setupActiveChat();
    return cleanupSubscriptions;
  }, [fbCurrentUserId, activeChat?.id, decryptMessage]); // Added decryptMessage to dependencies if it changes, though it's stable


  // --- Send Message ---
  const handleSendMessage = async () => {
    if ((!messageInputText.trim() && selectedFilesForUpload.length === 0) || !activeFirebaseChatId || !fbCurrentUserId) return;

    const originalText = messageInputText.trim();
    let textToSend = originalText;

    if (originalText) {
      // Censor the text before encryption
      const censoredText = censorText(originalText);
      if (censoredText !== originalText) {
        console.log("Original:", originalText, "Censored:", censoredText); // For debugging
        // Optionally, inform user their message was modified, or show them the censored version in input
      }
      textToSend = censoredText;
    }

    const encryptedText = textToSend ? encryptMessage(textToSend) : '';
    
    try {
      // setLoadingChatMessages(true); // Indicate sending - might be better to remove this if snapshots are quick
      await sendMessageToFirebase(activeFirebaseChatId, fbCurrentUserId, encryptedText, selectedFilesForUpload, replyingToMessage?.id || null);
      setMessageInputText('');
      setSelectedFilesForUpload([]);
      setReplyingToMessage(null);
      if (messageInputRef.current) messageInputRef.current.focus();
      
      if (activeFirebaseChatId && fbCurrentUserId) {
        await updateDoc(doc(db, 'chats', activeFirebaseChatId), { [`typing.${fbCurrentUserId}`]: false });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setChatError("Failed to send message.");
    } 
    // finally { setLoadingChatMessages(false); } // Usually handled by snapshot listener
  };

  // --- Typing Indicator ---
  const typingTimeoutRef = useRef(null);
  const handleTypingInputChange = async () => {
    if (!activeFirebaseChatId || !fbCurrentUserId) return;
    // No need to await these for typing indicator, can be fire-and-forget
    updateDoc(doc(db, 'chats', activeFirebaseChatId), { [`typing.${fbCurrentUserId}`]: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      updateDoc(doc(db, 'chats', activeFirebaseChatId), { [`typing.${fbCurrentUserId}`]: false });
    }, 2500);
  };
   useEffect(() => () => { if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current); }, []);


  // --- File Handling ---
  const handleFileSelect = (e) => setSelectedFilesForUpload(prev => [...prev, ...Array.from(e.target.files)].slice(0,5));
  const removeSelectedFile = (index) => setSelectedFilesForUpload(prev => prev.filter((_, i) => i !== index));

  // --- Message Reactions ---
  const handleMessageReaction = async (messageId, reactionEmoji) => {
    if (!activeFirebaseChatId || !fbCurrentUserId || !messageId) return;
    // NOTE: Message IDs are for messages in 'messages' collection, not 'chats/../messages' subcollection
    // The `messageRef` path needs to be corrected if messages are in a subcollection
    // Assuming 'messages' is a top-level collection and messages have a 'chatId' field.
    const messageRef = doc(db, 'messages', messageId); // Corrected path assuming top-level 'messages' collection
    
    try {
      const messageSnap = await getDoc(messageRef);
      if (messageSnap.exists()) {
        const messageData = messageSnap.data();
        // Ensure chatId matches, otherwise this is a security risk or bug
        if (messageData.chatId !== activeFirebaseChatId) {
            console.error("Message reaction chatId mismatch!");
            return;
        }

        const currentReactions = { ...(messageData.reactions || {}) }; 
        const usersForThisReaction = currentReactions[reactionEmoji] || [];
        const userHasReactedWithThis = usersForThisReaction.includes(fbCurrentUserId);

        if (userHasReactedWithThis) {
            await updateDoc(messageRef, {
                [`reactions.${reactionEmoji}`]: arrayRemove(fbCurrentUserId)
            });
        } else {
            await updateDoc(messageRef, {
                [`reactions.${reactionEmoji}`]: arrayUnion(fbCurrentUserId)
            });
        }
      }
    } catch (error) { console.error("Error reacting to message:", error); }
  };

  // --- Pin Message (UI only for now) ---
  const pinMessageToDisplay = (messageToPin) => {
    setPinnedMessagesDisplay(prev => prev.find(p => p.id === messageToPin.id) ? prev : [messageToPin, ...prev].slice(0,3));
  };

  // --- Delete Message ---
  const deleteFirebaseMessage = async (messageId, senderId) => {
    if (!fbCurrentUserId || fbCurrentUserId !== senderId) return; 
    // Assuming 'messages' is a top-level collection
    const messageRef = doc(db, 'messages', messageId); 
    try { 
        const msgDoc = await getDoc(messageRef);
        if (msgDoc.exists() && msgDoc.data().chatId === activeFirebaseChatId) { // Additional check
            await deleteDoc(messageRef); 
        } else {
            console.warn("Attempted to delete message not in active chat or not found.");
        }
    } catch (error) { console.error("Error deleting message:", error); }
  };

  // --- Start New Chat (Select a Connection) ---
  const handleStartNewChat = (connection) => {
    setActiveChat({
      id: connection.id, 
      type: 'dm',
      name: connection.name,
      avatar: connection.avatar,
      status: connection.status,
    });
    setDisplayedMessages([]); 
    setShowChatInfoPanel(false);
    setReplyingToMessage(null);
    if (window.innerWidth < 768) setIsSidebarCollapsed(true);
  };

  // Toggle favorite (UI only)
  const toggleFavoriteConnection = (id) => {
    setConnections(prev => prev.map(conn => conn.id === id ? { ...conn, isFavorite: !conn.isFavorite } : conn));
  };

  // Filtered lists for display
  const filteredConnections = connections.filter((conn) =>
    conn.name?.toLowerCase().includes(searchQueryConnections.toLowerCase()) // Added optional chaining for conn.name
  );
  const filteredDisplayedMessages = messageSearchQuery ? displayedMessages.filter(msg =>
    msg.text?.toLowerCase().includes(messageSearchQuery.toLowerCase())
  ) : displayedMessages;

  // Scroll to bottom & Focus input effects
  useEffect(() => { if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight; }, [displayedMessages, replyingToMessage, isTyping]);
  useEffect(() => { if (activeChat && messageInputRef.current) messageInputRef.current.focus(); }, [activeChat, replyingToMessage]);
  
  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => setIsSidebarCollapsed(window.innerWidth < 768);
    window.addEventListener('resize', handleResize); handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Connection Request Actions ---
  const handleAcceptRequest = async (requestId) => {
    try {
      await updateDoc(doc(db, 'connections', requestId), { status: 'accepted', acceptedAt: serverTimestamp() });
    } catch (err) { console.error('Error accepting request:', err); }
  };
  const handleRejectRequest = async (requestId) => {
    try { await deleteDoc(doc(db, 'connections', requestId)); } catch (err) { console.error('Error rejecting request:', err); }
  };

  // --- Send Connection Request Form States & Logic ---
  const [receiverEmailInput, setReceiverEmailInput] = useState('');
  const [sendReqLoading, setSendReqLoading] = useState(false);
  const [sendReqError, setSendReqError] = useState(null);
  const [sendReqSuccess, setSendReqSuccess] = useState(false);

  const handleSubmitConnectionRequest = async (e) => {
    e.preventDefault();
    if (!receiverEmailInput.trim() || !fbCurrentUserId || !fbCurrentUserName) return;
    setSendReqLoading(true); setSendReqError(null); setSendReqSuccess(false);
    try {
      const targetEmail = receiverEmailInput.toLowerCase().trim();
      let userSnap;
      const sQuery = query(studentsCollection, where('email', '==', targetEmail));
      userSnap = await getDocs(sQuery);
      if (userSnap.empty) {
        const tQuery = query(teachersCollection, where('email', '==', targetEmail));
        userSnap = await getDocs(tQuery);
      }
      if (userSnap.empty) { setSendReqError('No user found with this email.'); setSendReqLoading(false); return; } // Make sure to stop loading

      const receiverDoc = userSnap.docs[0];
      const receiverId = receiverDoc.id;
      const receiverData = receiverDoc.data();

      if (receiverId === fbCurrentUserId) { setSendReqError('Cannot send request to yourself.'); setSendReqLoading(false); return; }

      // Check for existing connections or requests
      const qExistingOr1 = query(connectionsCollection, 
        where('senderId', '==', fbCurrentUserId), 
        where('receiverId', '==', receiverId)
      );
      const qExistingOr2 = query(connectionsCollection, 
        where('senderId', '==', receiverId), 
        where('receiverId', '==', fbCurrentUserId)
      );
      
      const [snap1, snap2] = await Promise.all([getDocs(qExistingOr1), getDocs(qExistingOr2)]);

      if (!snap1.empty || !snap2.empty) {
        setSendReqError('A connection or request already exists with this user.');
        setSendReqLoading(false);
        return;
      }

      await addDoc(connectionsCollection, {
        senderId: fbCurrentUserId, senderName: fbCurrentUserName,
        receiverId: receiverId, receiverName: receiverData.name || targetEmail, receiverEmail: targetEmail,
        status: 'pending', createdAt: serverTimestamp()
      });
      setSendReqSuccess(true); setReceiverEmailInput('');
    } catch (err) { console.error('Error sending request:', err); setSendReqError('Failed to send request.');
    } finally { setSendReqLoading(false); }
  };


  // --- Render Logic ---
  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-white text-xl">SparkChat Initializing...</p>
      </div>
    );
  }

  if (!fbCurrentUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-white text-xl">Please Log In to use SparkChat.</p>
        {/* Login component or redirect */}
      </div>
    );
  }

  const activeChatOtherParticipant = chatParticipantInfo.find(p => p.id === activeChat?.id);
  // const currentChatUserParticipant = chatParticipantInfo.find(p => p.id === fbCurrentUserId); // Not used, can remove

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex overflow-hidden">
      {/* Left Sidebar */}
      <div 
        className={`bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col ${
          isSidebarCollapsed ? 'hidden md:flex md:w-20' : 'w-80'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {!isSidebarCollapsed ? (
            <>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                SparkChat
              </h1>
              <button onClick={() => setIsSidebarCollapsed(true)} className="p-1 rounded-lg hover:bg-gray-700">
                <ChevronDownIcon className="w-5 h-5 text-gray-400 transform rotate-90" />
              </button>
            </>
          ) : (
            <button onClick={() => setIsSidebarCollapsed(false)} className="p-1 rounded-lg hover:bg-gray-700 mx-auto">
              <Bars3Icon className="w-7 h-7 text-indigo-400" />
            </button>
          )}
        </div>

        {/* Search Input for Connections */}
        <div className="p-3 border-b border-gray-700">
          {!isSidebarCollapsed ? (
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text" placeholder="Search connections..." value={searchQueryConnections}
                onChange={(e) => setSearchQueryConnections(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ) : (
            <button className="p-2 rounded-lg hover:bg-gray-700 mx-auto block" title="Search Connections">
              <MagnifyingGlassIcon className="w-6 h-6 text-gray-400" />
            </button>
          )}
        </div>

        {/* Tabs for Friends/Requests/Groups */}
        <div className="flex-1 overflow-y-auto">
          {!isSidebarCollapsed && (
            <div className="flex border-b border-gray-700">
              <button onClick={() => setActiveMainTab('friends')} className={`flex-1 py-3 text-sm font-medium ${activeMainTab === 'friends' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-gray-300'}`}>
                Connections {connections.length > 0 && `(${connections.length})`}
              </button>
              <button onClick={() => setActiveMainTab('requests')} className={`flex-1 py-3 text-sm font-medium ${activeMainTab === 'requests' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-gray-300'}`}>
                Requests {pendingReceivedRequests.length > 0 && `(${pendingReceivedRequests.length})`}
              </button>
              <button onClick={() => setActiveMainTab('groups')} className={`flex-1 py-3 text-sm font-medium ${activeMainTab === 'groups' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-gray-300'}`}>
                Groups
              </button>
            </div>
          )}

          {/* Connections (Friends) List */}
          {activeMainTab === 'friends' && (
            <div>
              {!isSidebarCollapsed && <h3 className="text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wider">Direct Messages</h3>}
              {loadingConnections ? <p className="text-gray-400 p-4 text-center">Loading connections...</p> :
                filteredConnections.length === 0 ? <p className="text-gray-400 p-4 text-center">{searchQueryConnections ? 'No matching connections.' : 'No connections yet. Add some!'}</p> :
                filteredConnections.map((conn) => (
                  <div
                    key={conn.id} onClick={() => handleStartNewChat(conn)}
                    className={`flex items-center p-3 cursor-pointer transition-all ${activeChat?.id === conn.id ? 'bg-gray-700/50' : 'hover:bg-gray-700/30'}`}
                  >
                    <div className="relative">
                        {conn.avatar ? <img src={conn.avatar} alt={conn.name} className="w-10 h-10 rounded-full object-cover"/> : <UserCircleIcon className="w-10 h-10 text-gray-500"/>}
                        {/* TODO: Add online status dot based on conn.status */}
                    </div>
                    {!isSidebarCollapsed && (
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-medium truncate">{conn.name}</p>
                          {/* Optional: Favorite button or last message time */}
                        </div>
                        <p className="text-xs text-gray-400 truncate">{conn.lastMessage || "Start a conversation"}</p>
                      </div>
                    )}
                  </div>
              ))}
            </div>
          )}
          
          {/* Requests Tab Content */}
          {activeMainTab === 'requests' && !isSidebarCollapsed && (
             <div className="p-4 space-y-6">
                <div className="bg-gray-800/50 rounded-lg shadow p-4">
                  <h3 className="text-lg font-medium mb-3 text-gray-200">Send Connection Request</h3>
                  <form onSubmit={handleSubmitConnectionRequest}>
                    <div className="space-y-3">
                      <input type="email" value={receiverEmailInput} onChange={(e) => setReceiverEmailInput(e.target.value)} placeholder="Enter user's email..."
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" disabled={sendReqLoading}/>
                      <button type="submit" className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50" disabled={sendReqLoading || !receiverEmailInput.trim()}>
                        {sendReqLoading ? 'Sending...' : 'Send Request'}
                      </button>
                    </div>
                  </form>
                  {sendReqError && <p className="mt-2 text-red-400 text-sm">{sendReqError}</p>}
                  {sendReqSuccess && <p className="mt-2 text-green-400 text-sm">Request sent successfully!</p>}
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3 text-gray-200">Pending Received ({pendingReceivedRequests.length})</h3>
                  {loadingRequests && pendingReceivedRequests.length === 0 && <p className="text-gray-400">Loading requests...</p>}
                  {!loadingRequests && pendingReceivedRequests.length === 0 && <p className="text-gray-400">No pending requests.</p>}
                  {pendingReceivedRequests.map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg mb-2">
                        <span className="font-medium text-white">{req.senderName}</span>
                        <div className="space-x-2">
                          <button onClick={() => handleAcceptRequest(req.id)} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm">Accept</button>
                          <button onClick={() => handleRejectRequest(req.id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">Reject</button>
                        </div>
                      </div>
                  ))}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3 text-gray-200">Sent Requests ({sentRequests.length})</h3>
                   {sentRequests.length === 0 && <p className="text-gray-400">No sent requests.</p>}
                   {sentRequests.map((req) => (
                        <div key={req.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg mb-2">
                          <span className="font-medium text-white">{req.receiverName || req.receiverEmail}</span>
                          <span className="text-gray-300 text-sm">Pending</span>
                        </div>
                    ))}
                </div>
            </div>
          )}

          {/* Groups Tab (Placeholder) */}
          {activeMainTab === 'groups' && (
            <div className="p-4 text-center text-gray-500">
              <UsersIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-lg">Group Chat Feature</p>
              <p className="text-sm">This feature is planned for a future update.</p>
            </div>
          )}
        </div>

        {/* User Profile Footer */}
        {!isSidebarCollapsed && fbCurrentUserProfile && (
          <div className="p-3 border-t border-gray-700 flex items-center">
            {fbCurrentUserProfile.avatar ? <img src={fbCurrentUserProfile.avatar} alt="User" className="w-10 h-10 rounded-full object-cover"/> : <UserCircleIcon className="w-10 h-10 text-gray-400"/>}
            <div className="ml-3 flex-1">
              <p className="text-white font-medium">{fbCurrentUserName}</p>
              <p className="text-xs text-green-400">Online</p> 
            </div>
            {/* TODO: Settings/Logout button */}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat && activeFirebaseChatId ? ( 
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-800">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="md:hidden p-2 hover:bg-gray-700 rounded-lg"><Bars3Icon className="w-5 h-5 text-gray-400" /></button>
                {activeChatOtherParticipant?.avatar ? <img src={activeChatOtherParticipant.avatar} alt={activeChat.name} className="w-10 h-10 rounded-full object-cover"/> : <UserCircleIcon className="w-10 h-10 text-gray-400"/>}
                <div>
                  <h2 className="text-lg font-bold text-white">{activeChat.name}</h2>
                  <p className="text-xs text-gray-400">{activeChat.status || 'Offline'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setMessageSearchOpen(!messageSearchOpen)} className="p-2 hover:bg-gray-700 rounded-lg" title="Search Messages"><MagnifyingGlassIcon className="w-5 h-5 text-gray-400" /></button>
                <button className="p-2 hover:bg-gray-700 rounded-lg" title="Start Call (Not Implemented)"><PhoneIcon className="w-5 h-5 text-gray-400" /></button>
                <button className="p-2 hover:bg-gray-700 rounded-lg" title="Start Video Call (Not Implemented)"><VideoCameraIcon className="w-5 h-5 text-gray-400" /></button>
                <button onClick={() => setShowChatInfoPanel(!showChatInfoPanel)} className="p-2 hover:bg-gray-700 rounded-lg" title="Chat Info"><InformationCircleIcon className="w-5 h-5 text-gray-400" /></button>
              </div>
            </div>

            {/* Message Search Bar - Placeholder */}
            {messageSearchOpen && (
              <div className="p-2 border-b border-gray-700 bg-gray-800">
                  <input 
                    type="text" 
                    placeholder="Search in chat..." 
                    value={messageSearchQuery}
                    onChange={(e) => setMessageSearchQuery(e.target.value)}
                    className="w-full p-2 bg-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
              </div>
            )}

            <div className="flex-1 flex overflow-hidden">
              <div ref={chatContainerRef} className={`flex-1 overflow-y-auto p-4 bg-gray-900/50 ${showChatInfoPanel ? 'hidden md:block md:w-2/3' : 'w-full'}`}>
                {loadingChatMessages && displayedMessages.length === 0 && <p className="text-gray-400 text-center py-4">Loading messages...</p>}
                {chatError && <p className="text-red-400 text-center py-4">{chatError}</p>}
                
                {/* Pinned Messages Display - Placeholder */}
                {pinnedMessagesDisplay.length > 0 && (
                    <div className="sticky top-0 bg-gray-900/80 backdrop-blur-sm p-2 mb-2 rounded-lg shadow z-10">
                        {pinnedMessagesDisplay.map(pinMsg => (
                            <div key={pinMsg.id} className="text-xs text-gray-300 p-1 border-b border-gray-700/50 last:border-b-0">
                                <SolidPinIcon className="w-3 h-3 inline mr-1 text-yellow-400"/>
                                {pinMsg.text.substring(0,50)}{pinMsg.text.length > 50 && '...'}
                            </div>
                        ))}
                    </div>
                )}

                {isTyping && typingUsersDisplay && (
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="p-2 bg-gray-800 rounded-full flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-gray-400">{typingUsersDisplay}</span>
                  </div>
                )}

                {filteredDisplayedMessages.map((msg) => (
                  <MessageItem 
                    key={msg.id} msg={msg} currentUserId={fbCurrentUserId}
                    participantInfo={chatParticipantInfo}
                    handleReaction={handleMessageReaction}
                    setReplyingTo={setReplyingToMessage}
                    pinMessage={pinMessageToDisplay} 
                    deleteMessage={(messageId) => deleteFirebaseMessage(messageId, msg.sender)}
                    isSearchResult={messageSearchOpen && messageSearchQuery && msg.text?.toLowerCase().includes(messageSearchQuery.toLowerCase())}
                  />
                ))}
                 {!loadingChatMessages && displayedMessages.length === 0 && !chatError && (
                    <p className="text-gray-500 text-center py-10">No messages yet. Be the first to say hi!</p>
                )}
              </div>

              {showChatInfoPanel && activeChatOtherParticipant && (
                 <div className="w-full md:w-1/3 bg-gray-800 border-l border-gray-700 overflow-y-auto p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">Chat Info</h3>
                        <button onClick={() => setShowChatInfoPanel(false)} className="p-1 hover:bg-gray-700 rounded-lg"><XMarkIcon className="w-5 h-5 text-gray-400" /></button>
                    </div>
                    <div className="flex flex-col items-center mb-6">
                        {activeChatOtherParticipant.avatar ? 
                            <img src={activeChatOtherParticipant.avatar} alt={activeChatOtherParticipant.name} className="w-24 h-24 rounded-full object-cover mb-3"/> : 
                            <UserCircleIcon className="w-24 h-24 text-gray-500 mb-3"/>}
                        <h4 className="text-xl font-bold text-white">{activeChatOtherParticipant.name}</h4>
                        <p className="text-sm text-gray-400 mb-4">{activeChat.status || 'Offline'}</p>
                        {/* More user details can go here */}
                    </div>
                    {/* TODO: Sections for Media, Links, Docs shared in chat */}
                    <div className="mt-4">
                        <h4 className="text-md font-semibold text-gray-300 mb-2">Shared Media</h4>
                        <p className="text-xs text-gray-500">No media shared yet.</p>
                    </div>
                </div>
              )}
            </div>

            {replyingToMessage && (
              <div className="px-4 pt-2 pb-1 bg-gray-800 border-t border-gray-700 flex items-start justify-between">
                <div className="flex-1 overflow-hidden"> {/* Added overflow-hidden for better truncation */}
                  <div className="flex items-center mb-1">
                    <ArrowUturnLeftIcon className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-xs font-medium text-gray-400">Replying to {replyingToMessage.sender === fbCurrentUserId ? 'yourself' : chatParticipantInfo.find(p=>p.id === replyingToMessage.sender)?.name || 'them'}</span>
                  </div>
                  <p className="text-sm text-gray-300 truncate">{decryptMessage(replyingToMessage.text) || '[File]'}</p>
                </div>
                <button onClick={() => setReplyingToMessage(null)} className="p-1 hover:bg-gray-700 rounded-lg ml-2"><XMarkIcon className="w-4 h-4 text-gray-400" /></button>
              </div>
            )}

            {selectedFilesForUpload.length > 0 && (
             <div className="px-4 py-2 bg-gray-800 border-t border-gray-700">
                <p className="text-xs text-gray-400 mb-1">Files to send:</p>
                <div className="flex flex-wrap gap-2">
                    {selectedFilesForUpload.map((file, idx) => (
                    <div key={idx} className="flex items-center bg-gray-700 rounded px-2 py-1 text-xs text-gray-200">
                        <PaperClipIcon className="w-3 h-3 mr-1 text-gray-400"/>
                        <span className="mr-2 truncate max-w-[100px]">{file.name}</span>
                        <button
                        type="button"
                        className="ml-1 text-red-400 hover:text-red-600"
                        onClick={() => removeSelectedFile(idx)}
                        >
                        <XMarkIcon className="w-3 h-3" />
                        </button>
                    </div>
                    ))}
                </div>
              </div>
            )}

            <div className="p-4 border-t border-gray-700 bg-gray-800">
              <div className="flex items-end gap-3"> {/* Changed to items-end for better alignment with multiline input */}
                <div className="flex items-center gap-1">
                  <button onClick={() => fileInputRef.current.click()} className="p-2 hover:bg-gray-700 rounded-lg" title="Attach File"><PaperClipIcon className="w-5 h-5 text-gray-400" /></button>
                  <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple className="hidden"/>
                  <button onClick={() => setEmojiPickerOpen(!emojiPickerOpen)} className="p-2 hover:bg-gray-700 rounded-lg relative" title="Open Emoji Picker">
                    <FaceSmileIcon className="w-5 h-5 text-gray-400" />
                    {emojiPickerOpen && (
                      <div className="absolute bottom-full left-0 mb-2 z-20">
                        <EmojiPicker 
                          onEmojiClick={(emojiData) => {setMessageInputText(prev => prev + emojiData.emoji); setEmojiPickerOpen(false); messageInputRef.current?.focus();}}
                          theme="dark" width={300} height={350} previewConfig={{ showPreview: false }} lazyLoadEmojis={true}
                        />
                      </div>
                    )}
                  </button>
                </div>
                <div className="flex-1 relative">
                  <textarea // Changed to textarea for multiline support
                    ref={messageInputRef} placeholder="Type your message..." value={messageInputText}
                    onChange={(e) => setMessageInputText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { handleSendMessage(); e.preventDefault();}}} // Use onKeyDown for Enter
                    onKeyUp={handleTypingInputChange} // Still use onKeyUp for general typing
                    rows={1} // Start with 1 row
                    className="w-full px-4 py-3 bg-gray-700 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none overflow-y-auto max-h-28" // Added resize-none, overflow-y-auto, max-h
                    style={{lineHeight: '1.5rem'}} // Adjust line height if needed
                  />
                </div>
                <button onClick={handleSendMessage} disabled={(!messageInputText.trim() && selectedFilesForUpload.length === 0) || loadingChatMessages}
                  className={`p-3 rounded-xl transition-all self-end ${ (messageInputText.trim() || selectedFilesForUpload.length > 0) && !loadingChatMessages ? 'bg-gradient-to-br from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600' : 'bg-gray-700 cursor-not-allowed'}`}>
                  <PaperAirplaneIcon className="w-5 h-5 text-white transform rotate-45" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 p-6">
             <div className="max-w-md text-center animate-fade-in">
              <div className="relative inline-block mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                  <UsersIcon className="w-16 h-16 text-indigo-400 animate-float" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Start a Conversation
              </h3>
              <p className="text-gray-400 mb-6">
                Select a connection from the sidebar to begin messaging. Your chats are end-to-end encrypted.
              </p>
              <div className="mt-8 pt-6 border-t border-gray-800 flex items-center justify-center">
                <LockClosedIcon className="w-5 h-5 text-green-400 mr-2" />
                <span className="text-xs text-gray-500">Client-side encryption enabled</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MessageItem Component (Adapted) ---
const MessageItem = ({ msg, currentUserId, participantInfo, handleReaction, setReplyingTo, pinMessage, deleteMessage, isSearchResult }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const messageItemRef = useRef(null);
  const reactionsEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏']; 

  const senderIsCurrentUser = msg.sender === currentUserId;
  const senderProfile = participantInfo.find(p => p.id === msg.sender);

  useEffect(() => { 
    const handleClickOutside = (event) => {
      if (messageItemRef.current && !messageItemRef.current.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const msgTimestamp = typeof msg.timestamp === 'string' ? msg.timestamp : msg.timestamp?.toDate?.().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '...';

  return (
    <div 
      ref={messageItemRef}
      className={`flex ${senderIsCurrentUser ? 'justify-end' : 'justify-start'} mb-1 group relative ${isSearchResult ? 'bg-indigo-900/30 rounded-lg p-1 my-1 ring-1 ring-indigo-600' : ''}`}
      onContextMenu={(e) => { e.preventDefault(); setMenuOpen(prev => !prev);}} // Toggle menu
    >
      <div className={`flex items-end gap-2 ${senderIsCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!senderIsCurrentUser && (
            senderProfile?.avatar ? 
            <img src={senderProfile.avatar} alt={senderProfile.name} className="w-6 h-6 rounded-full object-cover self-end mb-1"/> : 
            <UserCircleIcon className="w-6 h-6 text-gray-500 self-end mb-1"/>
        )}
        <div 
          className={`max-w-[85%] md:max-w-[70%] p-2.5 rounded-xl relative transition-all ${
            senderIsCurrentUser ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-br-none' : 'bg-gray-700 text-gray-100 rounded-bl-none'
          } ${isSearchResult ? '!bg-indigo-700' : ''}`}
        >
          {!senderIsCurrentUser && senderProfile && (<p className="text-xs font-medium text-indigo-300 mb-0.5">{senderProfile.name}</p>)}
          
          {msg.replyTo && msg.replyToMessageText && ( // Check if replyToMessageText exists
            <div className="mb-1.5 p-1.5 bg-black/20 rounded text-xs text-indigo-200/80 border-l-2 border-indigo-400">
              <p className="font-medium text-indigo-300/90 mb-0.5">
                Replying to: {msg.replyToSenderName || 'Unknown'}
              </p>
              <p className="truncate">{msg.replyToMessageText}</p>
            </div>
          )}
          {msg.files?.map((file, i) => ( 
            <div key={i} className="text-xs my-1 p-1.5 bg-black/20 rounded flex items-center gap-2 hover:bg-black/30 cursor-pointer">
                <DocumentTextIcon className="w-4 h-4 text-indigo-300"/>
                <span>{file.name} ({Math.round(file.size / 1024)}KB)</span>
            </div> 
          ))}
          
          {msg.text && <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>} 

          <div className="flex items-center justify-end mt-1 space-x-2">
            {msg.reactions && Object.entries(msg.reactions).map(([emoji, users]) => 
                (users && users.length > 0) && (
                <span 
                    key={emoji} 
                    className={`text-xs rounded-full px-1.5 py-0.5 cursor-pointer transition-all ${
                        users.includes(currentUserId) ? 'bg-indigo-400/50 hover:bg-indigo-400/70' : 'bg-black/20 hover:bg-black/40'
                    }`}
                    onClick={() => handleReaction(msg.id, emoji)}
                    title={users.map(uid => participantInfo.find(p => p.id === uid)?.name || 'User').join(', ')}
                >
                    {emoji} <span className="text-gray-300">{users.length}</span>
                </span>
            ))}
            <span className="text-xs text-gray-400/80 leading-none">{msgTimestamp}</span>
            {senderIsCurrentUser && (<CheckIcon className={`w-3.5 h-3.5 ${msg.isReadBy && Object.keys(msg.isReadBy).length > 1 ? 'text-blue-300' : 'text-gray-400/80'}`} />)}
          </div>
          
          {!isSearchResult && (
            <div className={`absolute opacity-0 group-hover:opacity-100 transition-opacity flex bg-gray-800/80 backdrop-blur-sm rounded-md shadow-lg overflow-hidden z-10 ${senderIsCurrentUser ? 'right-0 -top-7 transform -translate-y-0.5' : 'left-0 -top-7 transform -translate-y-0.5'}`}>
              {reactionsEmojis.slice(0, 3).map((r) => (<button key={r} onClick={() => handleReaction(msg.id, r)} className="p-1.5 hover:bg-gray-700"><span className="text-sm">{r}</span></button>))}
              <button onClick={() => setMenuOpen(prev => !prev)} className="p-1.5 hover:bg-gray-700"><EllipsisVerticalIcon className="w-4 h-4 text-gray-300" /></button>
            </div>
          )}
        </div>
      </div>
      
      {menuOpen && (
        <div className={`absolute z-20 mt-1 w-48 origin-top rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${senderIsCurrentUser ? 'right-0' : 'left-8' }`} style={{top: '10px'}}> {/* Adjusted styling and ring */}
          <div className="py-1">
            <button onClick={() => { setReplyingTo(msg); setMenuOpen(false); }} className="flex items-center w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700 hover:text-white"><ArrowUturnLeftIcon className="w-3.5 h-3.5 mr-2" />Reply</button>
            <button onClick={() => { pinMessage(msg); setMenuOpen(false); }} className="flex items-center w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700 hover:text-white"><MapPinIcon className="w-3.5 h-3.5 mr-2" />Pin Message</button>
            {msg.text && <button onClick={() => { navigator.clipboard.writeText(msg.text); setMenuOpen(false); }} className="flex items-center w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700 hover:text-white"><DocumentTextIcon className="w-3.5 h-3.5 mr-2" />Copy Text</button>}
            {senderIsCurrentUser && <button onClick={() => { deleteMessage(msg.id); setMenuOpen(false); }} className="flex items-center w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-gray-700 hover:text-red-300"><TrashIcon className="w-3.5 h-3.5 mr-2" />Delete Message</button>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatFunctionality;