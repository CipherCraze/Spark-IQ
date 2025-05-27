import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, connectionsCollection, studentsCollection, teachersCollection } from '../../firebase/firebaseConfig';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const ConnectionsList = ({ currentUserId, onSelectUser }) => {
  const [connections, setConnections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async (userId) => {
      try {
        // Try students collection first
        let userDoc = await getDoc(doc(db, 'students', userId));
        
        // If not found in students, try teachers collection
        if (!userDoc.exists()) {
          userDoc = await getDoc(doc(db, 'teachers', userId));
        }
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          return {
            avatar: userData.avatar || null,
            name: userData.name || 'Unknown User'
          };
        }
        return null;
      } catch (err) {
        console.error('Error fetching user profile:', err);
        return null;
      }
    };

    const fetchConnections = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get accepted connections where current user is either sender or receiver
        const [senderQuery, receiverQuery] = await Promise.all([
          getDocs(query(
            connectionsCollection,
            where('senderId', '==', currentUserId),
            where('status', '==', 'accepted')
          )),
          getDocs(query(
            connectionsCollection,
            where('receiverId', '==', currentUserId),
            where('status', '==', 'accepted')
          ))
        ]);

        const connectionIds = new Set();
        const connectionsList = [];

        // Process connections where user is sender
        for (const doc of senderQuery.docs) {
          const connection = doc.data();
          if (!connectionIds.has(connection.receiverId)) {
            connectionIds.add(connection.receiverId);
            const userProfile = await fetchUserProfile(connection.receiverId);
            connectionsList.push({
              userId: connection.receiverId,
              name: userProfile?.name || connection.receiverName || 'Unknown User',
              avatar: userProfile?.avatar || null,
              connectionId: doc.id
            });
          }
        }

        // Process connections where user is receiver
        for (const doc of receiverQuery.docs) {
          const connection = doc.data();
          if (!connectionIds.has(connection.senderId)) {
            connectionIds.add(connection.senderId);
            const userProfile = await fetchUserProfile(connection.senderId);
            connectionsList.push({
              userId: connection.senderId,
              name: userProfile?.name || connection.senderName || 'Unknown User',
              avatar: userProfile?.avatar || null,
              connectionId: doc.id
            });
          }
        }

        setConnections(connectionsList);
      } catch (err) {
        console.error('Error fetching connections:', err);
        setError('Failed to load connections. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId) {
      fetchConnections();
    }
  }, [currentUserId]);

  const filteredConnections = connections.filter(connection =>
    connection.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow p-4">
        <p className="text-gray-400 text-center">Loading connections...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg shadow p-4">
        <p className="text-red-400 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow p-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search connections..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="space-y-2">
        {filteredConnections.map((connection) => (
          <div
            key={connection.connectionId}
            onClick={() => onSelectUser(connection.userId)}
            className="flex items-center p-3 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors duration-200"
          >
            <div className="flex items-center space-x-3 flex-1">
              <div className="cursor-pointer">
                {connection.avatar ? (
                  <img
                    src={connection.avatar}
                    alt={connection.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-white">
                      {connection.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">
                  {connection.name}
                </h3>
                <p className="text-sm text-gray-400">Click to start chat</p>
              </div>
            </div>
          </div>
        ))}
        
        {filteredConnections.length === 0 && (
          <p className="text-center text-gray-400 py-4">
            {searchTerm ? 'No matching connections found' : 'No connections yet'}
          </p>
        )}
      </div>
    </div>
  );
};

export default ConnectionsList; 