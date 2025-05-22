import React, { useState } from 'react';
import { addDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { connectionsCollection, db, studentsCollection, teachersCollection } from '../../firebase/firebaseConfig';
import { getUserProfile } from '../../firebase/userOperations';

const SendRequest = ({ currentUserId, currentUserName }) => {
  const [receiverEmail, setReceiverEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!receiverEmail.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Search in students collection first
      const studentQuery = query(
        studentsCollection,
        where('email', '==', receiverEmail.toLowerCase().trim())
      );
      
      let userSnapshot = await getDocs(studentQuery);
      
      // If not found in students, search in teachers collection
      if (userSnapshot.empty) {
        const teacherQuery = query(
          teachersCollection,
          where('email', '==', receiverEmail.toLowerCase().trim())
        );
        userSnapshot = await getDocs(teacherQuery);
      }
      
      if (userSnapshot.empty) {
        setError('No user found with this email address.');
        return;
      }

      const receiverUser = userSnapshot.docs[0];
      const receiverId = receiverUser.id;
      
      // Get full user profile to ensure we have the most up-to-date name
      const receiverProfile = await getUserProfile(receiverId);
      
      if (!receiverProfile) {
        setError('Unable to fetch user profile. Please try again.');
        return;
      }

      // Check if it's not the current user
      if (receiverId === currentUserId) {
        setError('You cannot send a request to yourself.');
        return;
      }

      // Check if a connection request already exists
      const existingRequestQuery = query(
        connectionsCollection,
        where('senderId', '==', currentUserId),
        where('receiverId', '==', receiverId)
      );

      const existingRequestSnapshot = await getDocs(existingRequestQuery);

      if (!existingRequestSnapshot.empty) {
        setError('A connection request already exists for this user.');
        return;
      }

      // Check if they are already connected
      const existingConnectionQuery = query(
        connectionsCollection,
        where('status', '==', 'accepted'),
        where('senderId', 'in', [currentUserId, receiverId]),
        where('receiverId', 'in', [currentUserId, receiverId])
      );

      const existingConnectionSnapshot = await getDocs(existingConnectionQuery);

      if (!existingConnectionSnapshot.empty) {
        setError('You are already connected with this user.');
        return;
      }

      // Create new connection request using the full profile name
      await addDoc(connectionsCollection, {
        senderId: currentUserId,
        senderName: currentUserName,
        receiverId: receiverId,
        receiverName: receiverProfile.name || receiverEmail.toLowerCase().trim(),
        receiverEmail: receiverEmail.toLowerCase().trim(),
        status: 'pending',
        createdAt: new Date()
      });

      setSuccess(true);
      setReceiverEmail('');
    } catch (err) {
      console.error('Error sending request:', err);
      setError('Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow p-4 mb-4">
      <h3 className="text-lg font-medium mb-3 text-gray-200">Send Connection Request</h3>
      <form onSubmit={handleSendRequest}>
        <div className="space-y-3">
          <input
            type="email"
            value={receiverEmail}
            onChange={(e) => setReceiverEmail(e.target.value)}
            placeholder="Enter user's email..."
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !receiverEmail.trim()}
          >
            {loading ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </form>
      
      {error && (
        <p className="mt-2 text-red-400 text-sm">{error}</p>
      )}
      
      {success && (
        <p className="mt-2 text-green-400 text-sm">Request sent successfully!</p>
      )}
    </div>
  );
};

export default SendRequest; 