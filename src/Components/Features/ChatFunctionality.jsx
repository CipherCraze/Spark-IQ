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

const sendMessageToFirebase = async (chatId, senderId, textContent, files = [], replyToMessageId = null, replyToMessageData = null) => {
  const messagesColRef = collection(db, 'messages');
  const fileDataForFirestore = files.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      url: `placeholder_url_for_${file.name}` // Replace with actual storage URL after upload
  }));

  // textContent here is expected to be ALREADY ENCRYPTED (and potentially censored before encryption)
  const messageData = {
    chatId,
    sender: senderId,
    text: textContent,
    timestamp: serverTimestamp(),
    files: fileDataForFirestore,
    replyTo: replyToMessageId,
    reactions: {},
    isReadBy: { [senderId]: true }
  };

  if (replyToMessageId && replyToMessageData) {
    messageData.replyToSenderId = replyToMessageData.sender;
    // Store original (potentially encrypted) text for reply preview consistency
    messageData.replyToMessageText = replyToMessageData.text;
    messageData.replyToHasFiles = replyToMessageData.files && replyToMessageData.files.length > 0;
  }


  const newMsgRef = await addDoc(messagesColRef, messageData);

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
    const newMessages = snapshot.docs.map(docSnap => ({
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768); // Collapse by default on mobile
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
  const searchConnectionsInputRef = useRef(null);


  // Encryption
  const encryptionKey = 'secure-encryption-key-v2'; // Store securely in a real app
  const encryptMessage = (text) => CryptoJS.AES.encrypt(text, encryptionKey).toString();
  const decryptMessage = useCallback((ciphertext) => {
    try {
      if (!ciphertext) return '';
      const bytes = CryptoJS.AES.decrypt(ciphertext, encryptionKey);
      const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
      return decryptedText || '[Encrypted]';
    } catch (e) {
      console.warn("Decryption error or already plain text:", e.message, ciphertext);
      return ciphertext || '[Error Decrypting]';
    }
  }, [encryptionKey]);


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
        status: userProfile?.status || 'offline', // TODO: Get real-time status if available
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
      setPendingReceivedRequests(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
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
      setSentRequests(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
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
              // Decrypt text for display. Original encrypted text remains in `msg.text` if needed for `replyToMessageText`
              textForDisplay: decryptMessage(msg.text),
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
  }, [fbCurrentUserId, activeChat?.id, decryptMessage]);


  // --- Send Message ---
  const handleSendMessage = async () => {
    if ((!messageInputText.trim() && selectedFilesForUpload.length === 0) || !activeFirebaseChatId || !fbCurrentUserId) return;

    const originalText = messageInputText.trim();
    let textToSend = originalText;

    if (originalText) {
      const censoredText = censorText(originalText);
      textToSend = censoredText;
    }

    const encryptedText = textToSend ? encryptMessage(textToSend) : '';

    try {
        const replyToData = replyingToMessage ? {
            id: replyingToMessage.id,
            text: replyingToMessage.text, // This is original encrypted text of message being replied to
            sender: replyingToMessage.sender,
            files: replyingToMessage.files,
        } : null;

      await sendMessageToFirebase(
          activeFirebaseChatId,
          fbCurrentUserId,
          encryptedText,
          selectedFilesForUpload,
          replyingToMessage?.id || null,
          replyToData // Pass full replyingToMessage object for context
        );
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
  };

  // --- Typing Indicator ---
  const typingTimeoutRef = useRef(null);
  const handleTypingInputChange = async () => {
    if (!activeFirebaseChatId || !fbCurrentUserId) return;
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
    const messageRef = doc(db, 'messages', messageId);

    try {
      const messageSnap = await getDoc(messageRef);
      if (messageSnap.exists()) {
        const messageData = messageSnap.data();
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
    // TODO: Implement actual pinning in Firestore if desired (e.g., add messageId to a 'pinnedMessages' array in chat doc)
    // This currently only updates local UI state for pinned messages.
    setPinnedMessagesDisplay(prev => {
        const isAlreadyPinned = prev.find(p => p.id === messageToPin.id);
        if (isAlreadyPinned) {
            return prev.filter(p => p.id !== messageToPin.id); // Unpin
        } else {
            // For display, we need the decrypted text
            return [{...messageToPin, text: decryptMessage(messageToPin.text)}, ...prev].slice(0,3); // Pin, max 3
        }
    });
  };

  // --- Delete Message ---
  const deleteFirebaseMessage = async (messageId, senderId) => {
    if (!fbCurrentUserId || fbCurrentUserId !== senderId) return;
    const messageRef = doc(db, 'messages', messageId);
    try {
        const msgDoc = await getDoc(messageRef);
        if (msgDoc.exists() && msgDoc.data().chatId === activeFirebaseChatId) {
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
    setMessageSearchQuery('');
    setMessageSearchOpen(false);
    if (window.innerWidth < 768) setIsSidebarCollapsed(true); // Collapse sidebar on mobile when a chat is opened
  };

  // Toggle favorite (UI only)
  const toggleFavoriteConnection = (id) => {
    // TODO: This should interact with Firestore if favorites are persisted (e.g., in user profile)
    setConnections(prev => prev.map(conn => conn.id === id ? { ...conn, isFavorite: !conn.isFavorite } : conn));
  };

  // Filtered lists for display
  const filteredConnections = connections.filter((conn) =>
    conn.name?.toLowerCase().includes(searchQueryConnections.toLowerCase())
  );
  const filteredDisplayedMessages = messageSearchQuery ? displayedMessages.filter(msg =>
    (msg.textForDisplay && typeof msg.textForDisplay === 'string' && msg.textForDisplay.toLowerCase().includes(messageSearchQuery.toLowerCase())) ||
    (msg.files && msg.files.some(file => file.name.toLowerCase().includes(messageSearchQuery.toLowerCase())))
  ) : displayedMessages;

  // Scroll to bottom & Focus input effects
  useEffect(() => {
    if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        const isScrolledNearBottom = scrollHeight - scrollTop <= clientHeight + 200; // Tolerance for auto-scroll
        if (isScrolledNearBottom || displayedMessages.length !== filteredDisplayedMessages.length) { // If not searching, or if search results change
             chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }
  }, [displayedMessages, filteredDisplayedMessages.length]); // Re-scroll when message list or its filtered version changes

  useEffect(() => { if (activeChat && messageInputRef.current && !emojiPickerOpen) messageInputRef.current.focus(); }, [activeChat, replyingToMessage, emojiPickerOpen]);

  // Responsive sidebar:
  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth < 768) {
            if (!activeChat) setIsSidebarCollapsed(true); // Collapse if no chat active on mobile
        } else {
            setIsSidebarCollapsed(false); // Default to expanded on desktop
        }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    return () => window.removeEventListener('resize', handleResize);
  }, [activeChat]); // Re-evaluate on activeChat change for mobile

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
      if (userSnap.empty) { setSendReqError('No user found with this email.'); setSendReqLoading(false); return; }

      const receiverDoc = userSnap.docs[0];
      const receiverId = receiverDoc.id;
      const receiverData = receiverDoc.data();

      if (receiverId === fbCurrentUserId) { setSendReqError('Cannot send request to yourself.'); setSendReqLoading(false); return; }

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
      setTimeout(() => setSendReqSuccess(false), 3000);
    } catch (err) { console.error('Error sending request:', err); setSendReqError('Failed to send request.');
    } finally { setSendReqLoading(false); }
  };


  // --- Render Logic ---
  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        {/* Simple spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
        <p className="text-white text-xl ml-4">SparkChat Initializing...</p>
      </div>
    );
  }

  if (!fbCurrentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-indigo-400 mb-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <p className="text-white text-xl mb-6">Please Log In to use SparkChat.</p>
        <button onClick={() => navigate('/login')} className="px-6 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 text-white font-medium transition-colors">Login</button>
      </div>
    );
  }

  const activeChatOtherParticipant = chatParticipantInfo.find(p => p.id === activeChat?.id);
  const isDesktopCollapsed = isSidebarCollapsed && window.innerWidth >= 768;


  return (
    <div className="h-screen bg-gray-900 text-gray-100 flex overflow-hidden">
      {/* Left Sidebar */}
      <div
        className={`
          bg-gray-800 border-r border-gray-700 transition-all duration-300 ease-in-out flex flex-col
          ${isSidebarCollapsed
            ? 'w-0 -translate-x-full md:w-20 md:translate-x-0' // Collapsed: mobile hidden, desktop icon-only
            : 'w-full translate-x-0 md:w-80'                     // Expanded: mobile full, desktop standard
          }
          ${activeChat && !isSidebarCollapsed && window.innerWidth < 768
            ? 'absolute z-40 h-full' // If chat active, mobile, AND sidebar is open (expanded) -> make it an overlay
            : 'relative z-30'         // Otherwise relative
          }
        `}
      >
        {/* Sidebar Header */}
        <div className={`p-4 border-b border-gray-700 flex items-center shrink-0 h-[69px] ${isDesktopCollapsed ? 'justify-center' : 'justify-between'}`}>
          {isSidebarCollapsed ? (
            <>
              {/* Desktop Collapsed: Spark Icon to expand */}
              <button onClick={() => setIsSidebarCollapsed(false)} className="p-1 rounded-lg hover:bg-gray-700 hidden md:block" title="Expand Sidebar">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-indigo-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </button>
              {/* Mobile Collapsed (w-0): This button isn't reachable as sidebar is -translate-x-full. Trigger is in Chat Header. */}
              {/* If sidebar is w-full on mobile and then user clicks X to collapse it (not implemented), then Bars3Icon could be here */}
              <button onClick={() => setIsSidebarCollapsed(false)} className="p-1 rounded-lg hover:bg-gray-700 md:hidden" title="Open Menu">
                <Bars3Icon className="w-7 h-7 text-indigo-400" />
              </button>
            </>
          ) : (
            // Expanded view: Title and collapse chevron
            <>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                SparkChat
              </h1>
              <button onClick={() => setIsSidebarCollapsed(true)} className="p-1 rounded-lg hover:bg-gray-700" title="Collapse Sidebar">
                <ChevronDownIcon className="w-5 h-5 text-gray-400 transform rotate-90" />
              </button>
            </>
          )}
        </div>

        {/* Search Input for Connections */}
        <div className={`p-3 border-b border-gray-700 shrink-0
                        ${isDesktopCollapsed ? 'flex justify-center items-center py-3.5' : 'py-2.5'}
                        ${(isSidebarCollapsed && window.innerWidth < 768) ? 'hidden' : ''}
                      `}>
          {isDesktopCollapsed ? (
            <button
              className="p-2.5 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
              title="Search Connections"
              onClick={() => {
                setIsSidebarCollapsed(false);
                setTimeout(() => searchConnectionsInputRef.current?.focus(), 300);
              }}
            >
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            </button>
          ) : (
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchConnectionsInputRef}
                type="text" placeholder="Search connections..." value={searchQueryConnections}
                onChange={(e) => setSearchQueryConnections(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Tabs and Content Area */}
        <div className={`flex-1 overflow-y-auto min-h-0 ${(isSidebarCollapsed && window.innerWidth < 768) ? 'hidden' : 'block'}`}>
          {(!isDesktopCollapsed || (isDesktopCollapsed && window.innerWidth >= 768)) && ( // Show tabs always unless fully hidden on mobile
            <div className="flex border-b border-gray-700 shrink-0">
              <button title="Connections" onClick={() => setActiveMainTab('friends')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeMainTab === 'friends' ? 'text-indigo-400 border-b-2 border-indigo-400 bg-gray-700/30' : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/20'} ${isDesktopCollapsed && 'px-0'}`}>
                {isDesktopCollapsed ? <UsersIcon className="w-5 h-5 mx-auto"/> : `Connections ${connections.length > 0 ? `(${connections.length})` : ''}`}
              </button>
              <button title="Requests" onClick={() => setActiveMainTab('requests')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeMainTab === 'requests' ? 'text-purple-400 border-b-2 border-purple-400 bg-gray-700/30' : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/20'} ${isDesktopCollapsed && 'px-0'}`}>
                 {isDesktopCollapsed ? <PlusCircleIcon className="w-5 h-5 mx-auto"/> : `Requests ${pendingReceivedRequests.length > 0 ? `(${pendingReceivedRequests.length})` : ''}`}
              </button>
              <button title="Groups" onClick={() => setActiveMainTab('groups')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeMainTab === 'groups' ? 'text-green-400 border-b-2 border-green-400 bg-gray-700/30' : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/20'} ${isDesktopCollapsed && 'px-0'}`}>
                {isDesktopCollapsed ? <UsersIcon className="w-5 h-5 mx-auto"/> : 'Groups'}
              </button>
            </div>
          )}

          {/* Connections (Friends) List */}
          {activeMainTab === 'friends' && (
            <div>
              {!isDesktopCollapsed && <h3 className="text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wider">Direct Messages</h3>}
              {loadingConnections ? <p className="text-gray-400 p-4 text-center">Loading connections...</p> :
                filteredConnections.length === 0 ? <p className="text-gray-400 p-4 text-center">{searchQueryConnections ? 'No matching connections.' : 'No connections yet. Add some!'}</p> :
                filteredConnections.map((conn) => (
                  <div
                    key={conn.id} onClick={() => handleStartNewChat(conn)}
                    className={`flex items-center p-3 cursor-pointer transition-all ${activeChat?.id === conn.id ? 'bg-gray-700/50' : 'hover:bg-gray-700/30'} ${isDesktopCollapsed && 'justify-center py-2.5'}`}
                  >
                    <div className={`relative shrink-0 ${isDesktopCollapsed && 'mx-auto'}`}>
                        {conn.avatar ? <img src={conn.avatar} alt={conn.name} className="w-10 h-10 rounded-full object-cover"/> : <UserCircleIcon className="w-10 h-10 text-gray-500"/>}
                        {/* TODO: Online status dot for collapsed view if desired */}
                    </div>
                    {!isDesktopCollapsed && (
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-medium truncate">{conn.name}</p>
                        </div>
                        <p className="text-xs text-gray-400 truncate">{conn.status || "Start a conversation"}</p>
                      </div>
                    )}
                  </div>
              ))}
            </div>
          )}

          {/* Requests Tab Content */}
          {activeMainTab === 'requests' && !isDesktopCollapsed && ( // Hide full content if desktop collapsed
             <div className="p-4 space-y-6">
                <div className="bg-gray-800/50 rounded-lg shadow p-4">
                  <h3 className="text-lg font-medium mb-3 text-gray-200">Send Connection Request</h3>
                  <form onSubmit={handleSubmitConnectionRequest}>
                    <div className="space-y-3">
                      <input type="email" value={receiverEmailInput} onChange={(e) => setReceiverEmailInput(e.target.value)} placeholder="Enter user's email..."
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" disabled={sendReqLoading}/>
                      <button type="submit" className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-opacity" disabled={sendReqLoading || !receiverEmailInput.trim()}>
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
                        <span className="font-medium text-white truncate">{req.senderName}</span>
                        <div className="space-x-2 shrink-0">
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
                          <span className="font-medium text-white truncate">{req.receiverName || req.receiverEmail}</span>
                          <span className="text-gray-300 text-sm shrink-0">Pending</span>
                        </div>
                    ))}
                </div>
            </div>
          )}
           {activeMainTab === 'requests' && isDesktopCollapsed && (
             <div className="p-4 text-center text-gray-500">
                <PlusCircleIcon className="w-10 h-10 mx-auto text-gray-600"/>
                <p className="text-xs mt-2">Expand to manage requests.</p>
             </div>
           )}


          {/* Groups Tab (Placeholder) */}
          {activeMainTab === 'groups' && (
            <div className={`p-4 text-center text-gray-500 ${isDesktopCollapsed ? 'flex flex-col items-center justify-center h-full' : ''}`}>
              <UsersIcon className={`mx-auto mb-2 ${isDesktopCollapsed ? 'w-10 h-10' : 'w-16 h-16'} text-gray-600`} />
              {!isDesktopCollapsed && <p className="text-lg">Group Chat Feature</p>}
              <p className="text-sm">{isDesktopCollapsed ? 'Groups' : 'This feature is planned for a future update.'}</p>
            </div>
          )}
        </div>

        {/* User Profile Footer */}
        {fbCurrentUserProfile && (
          <div className={`p-3 border-t border-gray-700 flex items-center shrink-0 ${isDesktopCollapsed ? 'justify-center py-3' : ''}`}>
            {fbCurrentUserProfile.avatar ? <img src={fbCurrentUserProfile.avatar} alt="User" className="w-10 h-10 rounded-full object-cover shrink-0"/> : <UserCircleIcon className="w-10 h-10 text-gray-400 shrink-0"/>}
            {!isDesktopCollapsed && (
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-white font-medium truncate">{fbCurrentUserName}</p>
                <p className="text-xs text-green-400">Online</p>
              </div>
            )}
            {/* TODO: Settings/Logout button. Add icon for collapsed view */}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeChat && activeFirebaseChatId ? (
          <>
            {/* Chat Header */}
            <div className="p-3 md:p-4 border-b border-gray-700 flex items-center justify-between bg-gray-800 shrink-0">
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <button
                    onClick={() => setIsSidebarCollapsed(prev => !prev)}
                    className="md:hidden p-2 -ml-1 hover:bg-gray-700 rounded-lg"
                    title={isSidebarCollapsed ? "Open Menu" : "Close Menu"}
                >
                    {isSidebarCollapsed ? <Bars3Icon className="w-5 h-5 text-gray-400" /> : <XMarkIcon className="w-5 h-5 text-gray-400" />}
                </button>
                {activeChatOtherParticipant?.avatar ? <img src={activeChatOtherParticipant.avatar} alt={activeChat.name} className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover shrink-0"/> : <UserCircleIcon className="w-9 h-9 md:w-10 md:h-10 text-gray-400 shrink-0"/>}
                <div className="min-w-0">
                  <h2 className="text-md md:text-lg font-bold text-white truncate">{activeChat.name}</h2>
                  <p className="text-xs text-gray-400 truncate">{isTyping ? typingUsersDisplay : (activeChat.status || 'Offline')}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 md:gap-2 shrink-0">
                <button onClick={() => setMessageSearchOpen(!messageSearchOpen)} className="p-2 hover:bg-gray-700 rounded-lg" title="Search Messages"><MagnifyingGlassIcon className="w-5 h-5 text-gray-400" /></button>
                <button className="p-2 hover:bg-gray-700 rounded-lg" title="Start Call (Not Implemented)"><PhoneIcon className="w-5 h-5 text-gray-400" /></button>
                <button className="p-2 hover:bg-gray-700 rounded-lg hidden md:block" title="Start Video Call (Not Implemented)"><VideoCameraIcon className="w-5 h-5 text-gray-400" /></button>
                <button onClick={() => setShowChatInfoPanel(!showChatInfoPanel)} className="p-2 hover:bg-gray-700 rounded-lg" title="Chat Info"><InformationCircleIcon className="w-5 h-5 text-gray-400" /></button>
              </div>
            </div>

            {messageSearchOpen && (
              <div className="p-2 border-b border-gray-700 bg-gray-800 shrink-0">
                  <input
                    type="text"
                    placeholder="Search in chat..."
                    value={messageSearchQuery}
                    onChange={(e) => setMessageSearchQuery(e.target.value)}
                    className="w-full p-2 bg-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
              </div>
            )}

            <div className="flex-1 flex overflow-hidden min-h-0"> {/* Main chat and info panel container */}
              <div ref={chatContainerRef} className={`flex-1 overflow-y-auto p-3 md:p-4 bg-gray-900/50 scroll-smooth flex flex-col ${showChatInfoPanel ? 'hidden md:flex' : 'flex'}`}>
                {/* Pinned Messages */}
                {pinnedMessagesDisplay.length > 0 && (
                    <div className="sticky top-0 bg-gray-900/80 backdrop-blur-sm p-2 mb-2 rounded-lg shadow z-10">
                        {pinnedMessagesDisplay.map(pinMsg => (
                            <div key={pinMsg.id} className="text-xs text-gray-300 p-1.5 border-b border-gray-700/50 last:border-b-0 flex items-center gap-2">
                                <SolidPinIcon className="w-3.5 h-3.5 inline text-yellow-400 shrink-0"/>
                                <span className="truncate">{pinMsg.text.substring(0,50)}{pinMsg.text.length > 50 && '...'}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Spacer to push messages to bottom */}
                {filteredDisplayedMessages.length > 0 && <div className="mt-auto" />}

                {loadingChatMessages && displayedMessages.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-300 mb-2"></div>
                    <p className="text-gray-400 text-center">Loading messages...</p>
                  </div>
                )}
                {chatError && <p className="text-red-400 text-center py-4">{chatError}</p>}


                {filteredDisplayedMessages.map((msg) => (
                  <MessageItem
                    key={msg.id} msg={msg} currentUserId={fbCurrentUserId}
                    participantInfo={chatParticipantInfo}
                    decryptMessage={decryptMessage}
                    handleReaction={handleMessageReaction}
                    setReplyingTo={setReplyingToMessage}
                    pinMessage={pinMessageToDisplay}
                    deleteMessage={(messageId) => deleteFirebaseMessage(messageId, msg.sender)}
                    isSearchResult={messageSearchOpen && messageSearchQuery && ((msg.textForDisplay && typeof msg.textForDisplay === 'string' && msg.textForDisplay.toLowerCase().includes(messageSearchQuery.toLowerCase())) || (msg.files && msg.files.some(f => f.name.toLowerCase().includes(messageSearchQuery.toLowerCase()))))}
                    isMessagePinned={pinnedMessagesDisplay.some(p => p.id === msg.id)}
                  />
                ))}
                {/* Typing Indicator (appears at the bottom of messages) */}
                {isTyping && typingUsersDisplay && !messageSearchQuery && (
                  <div className="flex items-center gap-2 mt-1 mb-1 px-2 self-start"> {/* self-start to align with other messages */}
                    <div className="p-2 bg-gray-800 rounded-full flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-gray-400">{typingUsersDisplay}</span>
                  </div>
                )}
                 {!loadingChatMessages && displayedMessages.length === 0 && !chatError && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <UsersIcon className="w-12 h-12 text-gray-600 mb-3"/>
                        <p className="text-gray-500">No messages yet.</p>
                        <p className="text-xs text-gray-500">Be the first to say hi!</p>
                    </div>
                )}
              </div>

              {/* Chat Info Panel */}
              {showChatInfoPanel && activeChatOtherParticipant && (
                 <div className="w-full md:w-1/3 bg-gray-800 border-l border-gray-700 overflow-y-auto p-4 flex flex-col shrink-0">
                    <div className="flex items-center justify-between mb-4 shrink-0">
                        <h3 className="text-lg font-bold text-white">Chat Info</h3>
                        <button onClick={() => setShowChatInfoPanel(false)} className="p-1 hover:bg-gray-700 rounded-lg" title="Close Info Panel"><XMarkIcon className="w-5 h-5 text-gray-400" /></button>
                    </div>
                    <div className="flex flex-col items-center mb-6 shrink-0 text-center">
                        {activeChatOtherParticipant.avatar ?
                            <img src={activeChatOtherParticipant.avatar} alt={activeChatOtherParticipant.name} className="w-24 h-24 rounded-full object-cover mb-3"/> :
                            <UserCircleIcon className="w-24 h-24 text-gray-500 mb-3"/>}
                        <h4 className="text-xl font-bold text-white">{activeChatOtherParticipant.name}</h4>
                        <p className="text-sm text-gray-400 mb-1">{activeChatOtherParticipant.email || 'No email provided'}</p>
                        <p className="text-sm text-gray-400">{activeChat.status || 'Offline'}</p>
                    </div>
                    {/* TODO: Add more info like shared media, mutual groups etc. */}
                    <div className="mt-4 border-t border-gray-700 pt-4 overflow-y-auto flex-1 min-h-0">
                        <h4 className="text-md font-semibold text-gray-300 mb-2">Shared Media</h4>
                        <p className="text-xs text-gray-500">No media shared yet in this view.</p>
                        {/* Placeholder for media items grid */}
                    </div>
                </div>
              )}
            </div>

            {/* Replying To Preview */}
            {replyingToMessage && (
              <div className="px-3 md:px-4 pt-2 pb-1 bg-gray-800 border-t border-gray-700 flex items-start justify-between shrink-0">
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center mb-1">
                    <ArrowUturnLeftIcon className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-xs font-medium text-gray-400">Replying to {replyingToMessage.sender === fbCurrentUserId ? 'yourself' : chatParticipantInfo.find(p=>p.id === replyingToMessage.sender)?.name || 'them'}</span>
                  </div>
                  <p className="text-sm text-gray-300 truncate">{decryptMessage(replyingToMessage.text) || (replyingToMessage.files && replyingToMessage.files.length > 0 ? replyingToMessage.files[0].name : '[Message]')}</p>
                </div>
                <button onClick={() => setReplyingToMessage(null)} className="p-1 hover:bg-gray-700 rounded-lg ml-2" title="Cancel Reply"><XMarkIcon className="w-4 h-4 text-gray-400" /></button>
              </div>
            )}

            {/* Selected Files Preview */}
            {selectedFilesForUpload.length > 0 && (
             <div className="px-3 md:px-4 py-2 bg-gray-800 border-t border-gray-700 shrink-0">
                <p className="text-xs text-gray-400 mb-1.5">Files to send ({selectedFilesForUpload.length}/5):</p>
                <div className="flex flex-wrap gap-2">
                    {selectedFilesForUpload.map((file, idx) => (
                    <div key={idx} className="flex items-center bg-gray-700 rounded px-2 py-1 text-xs text-gray-200 max-w-[150px] sm:max-w-[200px]">
                        <PaperClipIcon className="w-3 h-3 mr-1.5 text-gray-400 shrink-0"/>
                        <span className="mr-2 truncate">{file.name}</span>
                        <button
                        type="button"
                        className="ml-auto text-red-400 hover:text-red-600 shrink-0"
                        title={`Remove ${file.name}`}
                        onClick={() => removeSelectedFile(idx)}
                        >
                        <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    ))}
                </div>
              </div>
            )}

            {/* Message Input Area */}
            <div className="p-3 md:p-4 border-t border-gray-700 bg-gray-800 shrink-0">
              <div className="flex items-end gap-2 md:gap-3">
                <div className="flex items-center gap-0.5 md:gap-1">
                  <button onClick={() => fileInputRef.current.click()} className="p-2 hover:bg-gray-700 rounded-lg" title="Attach File"><PaperClipIcon className="w-5 h-5 text-gray-400" /></button>
                  <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple className="hidden" accept="image/*,application/pdf,.doc,.docx,.txt,.zip"/>
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
                  <textarea
                    ref={messageInputRef} placeholder="Type your message..." value={messageInputText}
                    onChange={(e) => setMessageInputText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { handleSendMessage(); e.preventDefault();}}}
                    onKeyUp={handleTypingInputChange}
                    rows={1}
                    className="w-full px-3.5 py-2.5 bg-gray-700 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none overflow-y-auto max-h-28"
                    style={{lineHeight: '1.4rem'}} // Adjusted for better text fit
                  />
                </div>
                <button onClick={handleSendMessage} disabled={(!messageInputText.trim() && selectedFilesForUpload.length === 0) || loadingChatMessages}
                  className={`p-2.5 md:p-3 rounded-xl transition-all self-end ${ (messageInputText.trim() || selectedFilesForUpload.length > 0) && !loadingChatMessages ? 'bg-gradient-to-br from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600' : 'bg-gray-600 cursor-not-allowed'}`}>
                  <PaperAirplaneIcon className="w-5 h-5 text-white transform rotate-45" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 p-6 text-center">
             <div className="max-w-md animate-fade-in">
              <div className="relative inline-block mb-8">
                <div className="w-28 h-28 md:w-32 md:h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                  <UsersIcon className="w-12 h-12 md:w-16 md:h-16 text-indigo-400 animate-float" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Start a Conversation
              </h3>
              <p className="text-gray-400 mb-6 text-sm md:text-base">
                Select a connection from the sidebar to begin messaging. Your chats are end-to-end encrypted.
              </p>
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="md:hidden px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium mb-6 transition-colors"
              >
                View Connections
              </button>
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

// --- MessageItem Component ---
const MessageItem = ({ msg, currentUserId, participantInfo, decryptMessage, handleReaction, setReplyingTo, pinMessage, deleteMessage, isSearchResult, isMessagePinned }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const messageItemRef = useRef(null);
  const reactionsEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏']; // Common reactions

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

  const decryptedReplyText = msg.replyTo && msg.replyToMessageText ? decryptMessage(msg.replyToMessageText) : msg.replyToMessageText;
  const displayedMessageText = msg.textForDisplay;


  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return <PhotoIcon className="w-4 h-4 text-indigo-300 shrink-0"/>;
    if (fileType === 'application/pdf') return <DocumentTextIcon className="w-4 h-4 text-red-300 shrink-0"/>;
    if (fileType?.startsWith('application/vnd.openxmlformats-officedocument') || fileType === 'application/msword') return <DocumentTextIcon className="w-4 h-4 text-blue-300 shrink-0"/>;
    if (fileType === 'image/gif') return <GifIcon className="w-4 h-4 text-purple-300 shrink-0"/>;
    return <PaperClipIcon className="w-4 h-4 text-gray-300 shrink-0"/>;
  }

  return (
    <div
      ref={messageItemRef}
      className={`flex group relative w-full mb-1 ${senderIsCurrentUser ? 'justify-end' : 'justify-start'} ${isSearchResult ? 'bg-indigo-900/40 rounded-lg p-1 my-1 ring-1 ring-indigo-700 shadow-md' : ''}`}
      onContextMenu={(e) => { e.preventDefault(); setMenuOpen(prev => !prev);}}
    >
      <div className={`flex items-end gap-1.5 md:gap-2 max-w-full ${senderIsCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!senderIsCurrentUser && (
            senderProfile?.avatar ?
            <img src={senderProfile.avatar} alt={senderProfile.name || 'User Avatar'} className="w-6 h-6 rounded-full object-cover self-end mb-1 shrink-0"/> :
            <UserCircleIcon className="w-6 h-6 text-gray-500 self-end mb-1 shrink-0"/>
        )}
        <div
          className={`max-w-[80%] sm:max-w-[75%] md:max-w-[70%] p-2 md:p-2.5 rounded-xl relative transition-all shadow-md
          ${senderIsCurrentUser ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-lg' : 'bg-gray-700 text-gray-100 rounded-bl-lg'}
          ${isSearchResult ? '!bg-indigo-800/80 shadow-lg' : ''}
          ${displayedMessageText ? '' : 'min-w-[80px]'}`} // Ensure some min-width for file-only messages
        >
          {!senderIsCurrentUser && senderProfile && (<p className="text-xs font-medium text-indigo-300 mb-0.5">{senderProfile.name}</p>)}

          {msg.replyTo && (
            <div className="mb-1.5 p-1.5 bg-black/20 rounded-md text-xs text-indigo-200/80 border-l-2 border-indigo-400">
              <p className="font-medium text-indigo-300/90 mb-0.5 flex items-center">
                <ArrowUturnLeftIcon className="w-3 h-3 mr-1.5 shrink-0"/>
                Replying to: {msg.replyToSenderName || participantInfo.find(p=>p.id === msg.replyToSenderId)?.name || 'Unknown'}
              </p>
              <p className="truncate ml-4.5">{decryptedReplyText || (msg.replyToHasFiles ? '[File Attachment]' : '[Original message not available]')}</p>
            </div>
          )}

          {msg.files?.map((file, i) => (
            <div key={i} title={`Download ${file.name}`} className="text-xs my-1 p-1.5 bg-black/25 rounded-md flex items-center gap-2 hover:bg-black/40 cursor-pointer transition-colors">
                {getFileIcon(file.type)}
                <div className="overflow-hidden">
                    <p className="truncate font-medium">{file.name}</p>
                    <p className="text-gray-400 text-[0.7rem]">{file.size ? (file.size / 1024 / 1024).toFixed(2) : 'N/A'} MB</p>
                </div>
                {/* TODO: Add download/preview link for file.url (requires file upload implementation) */}
            </div>
          ))}

          {displayedMessageText && <p className="text-sm whitespace-pre-wrap break-words">{displayedMessageText}</p>}

          <div className="flex items-center justify-end mt-1.5 space-x-1.5 text-gray-300/80">
             {msg.reactions && Object.entries(msg.reactions).map(([emoji, users]) =>
                (users && users.length > 0) && (
                <span
                    key={emoji}
                    className={`text-xs rounded-full px-1.5 py-0.5 cursor-pointer transition-all ${
                        users.includes(currentUserId) ? 'bg-indigo-400/60 hover:bg-indigo-400/80 text-white' : 'bg-black/25 hover:bg-black/40'
                    }`}
                    onClick={() => handleReaction(msg.id, emoji)}
                    title={users.map(uid => participantInfo.find(p => p.id === uid)?.name || 'User').join(', ')}
                >
                    {emoji} <span className="text-gray-300/90 text-[0.7rem]">{users.length}</span>
                </span>
            ))}
            <span className="text-[0.7rem] leading-none">{msgTimestamp}</span>
            {senderIsCurrentUser && (<CheckIcon className={`w-3.5 h-3.5 ${msg.isReadBy && Object.keys(msg.isReadBy).length > 1 ? 'text-blue-400' : 'text-gray-400/90'}`} />)}
          </div>

          {!isSearchResult && (
            <div className={`absolute opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex bg-gray-800/90 backdrop-blur-sm rounded-md shadow-lg overflow-hidden z-10
                           ${senderIsCurrentUser ? 'right-0 -top-7 transform -translate-y-0.5' : 'left-0 -top-7 transform -translate-y-0.5'}`}>
              {reactionsEmojis.slice(0, 3).map((r) => (<button key={r} title={`React with ${r}`} onClick={() => handleReaction(msg.id, r)} className="p-1.5 hover:bg-gray-700/80"><span className="text-sm">{r}</span></button>))}
              <button title="More options" onClick={() => setMenuOpen(prev => !prev)} className="p-1.5 hover:bg-gray-700/80"><EllipsisVerticalIcon className="w-4 h-4 text-gray-300" /></button>
            </div>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className={`absolute z-20 mt-1 w-48 origin-top rounded-md bg-gray-800 shadow-xl ring-1 ring-black ring-opacity-10 focus:outline-none
                        ${senderIsCurrentUser ?
                            (window.innerWidth < 768 ? 'right-0 bottom-full mb-1' : 'right-full mr-[-0.5rem] top-0') :
                            (window.innerWidth < 768 ? 'left-0 bottom-full mb-1' : 'left-full ml-[-0.5rem] top-0')
                         }
                       `}
        >
          <div className="py-1">
            <button onClick={() => { setReplyingTo({ id: msg.id, text: msg.text, sender: msg.sender, senderName: senderProfile?.name || 'User', files: msg.files }); setMenuOpen(false); }} className="flex items-center w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"><ArrowUturnLeftIcon className="w-3.5 h-3.5 mr-2" />Reply</button>
            <button onClick={() => { pinMessage(msg); setMenuOpen(false); }} className="flex items-center w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                {isMessagePinned ? <SolidPinIcon className="w-3.5 h-3.5 mr-2 text-yellow-400"/> : <MapPinIcon className="w-3.5 h-3.5 mr-2" />}
                {isMessagePinned ? 'Unpin' : 'Pin Message'}
            </button>
            {displayedMessageText && <button onClick={() => { navigator.clipboard.writeText(displayedMessageText); setMenuOpen(false); }} className="flex items-center w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"><PaperClipIcon className="w-3.5 h-3.5 mr-2" />Copy Text</button>}
            {senderIsCurrentUser && <button onClick={() => { deleteMessage(msg.id); setMenuOpen(false); }} className="flex items-center w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"><TrashIcon className="w-3.5 h-3.5 mr-2" />Delete Message</button>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatFunctionality;