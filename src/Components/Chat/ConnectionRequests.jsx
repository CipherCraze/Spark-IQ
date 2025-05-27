import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, addDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { connectionsCollection } from '../../firebase/firebaseConfig';
import { auth } from '../../firebase/firebaseConfig';
import { 
  UserPlusIcon, 
  BellIcon, 
  InboxIcon, 
  PaperAirplaneIcon,
  UserCircleIcon 
} from '@heroicons/react/24/outline';
import SendRequest from './SendRequest';

const ConnectionRequests = ({ currentUserId }) => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserName, setCurrentUserName] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Get current user's name
    const user = auth.currentUser;
    if (user) {
      setCurrentUserName(user.displayName || user.email);
    }
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    setLoading(true);
    setError(null);

    // Create queries for received and sent requests
    const receivedQuery = query(
      connectionsCollection,
      where('receiverId', '==', currentUserId),
      where('status', '==', 'pending')
    );

    const sentQuery = query(
      connectionsCollection,
      where('senderId', '==', currentUserId),
      where('status', '==', 'pending')
    );

    // Set up real-time listeners
    const unsubscribeReceived = onSnapshot(receivedQuery, 
      (snapshot) => {
        setPendingRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching received requests:', error);
        setError('Failed to load received requests. Please try again.');
        setLoading(false);
      }
    );

    const unsubscribeSent = onSnapshot(sentQuery,
      (snapshot) => {
        setSentRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching sent requests:', error);
        setError('Failed to load sent requests. Please try again.');
        setLoading(false);
      }
    );

    // Cleanup function to unsubscribe from listeners
    return () => {
      unsubscribeReceived();
      unsubscribeSent();
    };
  }, [currentUserId]);

  const handleAcceptRequest = async (requestId) => {
    try {
      const requestRef = doc(db, 'connections', requestId);
      await updateDoc(requestRef, {
        status: 'accepted',
        acceptedAt: new Date()
      });
      // No need to manually update the state as the listener will handle it
    } catch (err) {
      console.error('Error accepting request:', err);
      setError('Failed to accept request. Please try again.');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const requestRef = doc(db, 'connections', requestId);
      await deleteDoc(requestRef);
      // No need to manually update the state as the listener will handle it
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError('Failed to reject request. Please try again.');
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    try {
      // Implement the logic to send a connection request
      // This is a placeholder and should be replaced with actual implementation
      console.log('Sending request to:', receiverEmail);
      setSuccess(true);
    } catch (err) {
      console.error('Error sending request:', err);
      setError('Failed to send request. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-400 text-center">Loading requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <p className="text-red-400 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Send Request Section */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700/30 p-6 shadow-xl">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
          <UserPlusIcon className="w-6 h-6 text-indigo-400" />
          Send Connection Request
        </h3>
        <form onSubmit={handleSendRequest}>
          <div className="space-y-3">
            <input
              type="email"
              value={receiverEmail}
              onChange={(e) => setReceiverEmail(e.target.value)}
              placeholder="Enter user's email..."
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              disabled={loading}
            />
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !receiverEmail.trim()}
            >
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
        
        {error && (
          <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mt-3 p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
            <p className="text-green-400 text-sm">Request sent successfully!</p>
          </div>
        )}
      </div>

      {/* Enhanced Requests Section */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700/30 p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
          <BellIcon className="w-6 h-6 text-purple-400" />
          Connection Requests
        </h2>
        
        {/* Pending Requests */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4 text-gray-200 flex items-center gap-2">
            <InboxIcon className="w-5 h-5 text-indigo-400" />
            Pending Requests
          </h3>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-6 bg-gray-700/30 rounded-xl">
              <p className="text-gray-400">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-indigo-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-indigo-400">
                          {request.senderName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-white">{request.senderName}</span>
                        <p className="text-sm text-gray-400">Wants to connect with you</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sent Requests */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-200 flex items-center gap-2">
            <PaperAirplaneIcon className="w-5 h-5 text-purple-400" />
            Sent Requests
          </h3>
          {sentRequests.length === 0 ? (
            <div className="text-center py-6 bg-gray-700/30 rounded-xl">
              <p className="text-gray-400">No sent requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sentRequests.map((request) => (
                <div key={request.id} className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-indigo-400">
                          {(request.receiverName || request.receiverEmail).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-white">{request.receiverName || request.receiverEmail}</span>
                        <p className="text-sm text-gray-400">Request pending</p>
                      </div>
                    </div>
                    <span className="text-gray-400 text-sm">Awaiting response</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionRequests; 