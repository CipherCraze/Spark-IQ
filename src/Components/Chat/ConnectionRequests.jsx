import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, addDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { connectionsCollection } from '../../firebase/firebaseConfig';
import SendRequest from './SendRequest';
import { auth } from '../../firebase/firebaseConfig';

const ConnectionRequests = ({ currentUserId }) => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserName, setCurrentUserName] = useState('');

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
      {/* Send Request Section */}
      <SendRequest currentUserId={currentUserId} currentUserName={currentUserName} />

      {/* Requests Section */}
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4 text-white">Connection Requests</h2>
        
        {/* Pending Requests */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 text-gray-200">Pending Requests</h3>
          {pendingRequests.length === 0 ? (
            <p className="text-gray-400">No pending requests</p>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <span className="font-medium text-white">{request.senderName}</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors duration-200"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sent Requests */}
        <div>
          <h3 className="text-lg font-medium mb-3 text-gray-200">Sent Requests</h3>
          {sentRequests.length === 0 ? (
            <p className="text-gray-400">No sent requests</p>
          ) : (
            <div className="space-y-3">
              {sentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <span className="font-medium text-white">{request.receiverName || request.receiverEmail}</span>
                  <span className="text-gray-300">Pending</span>
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