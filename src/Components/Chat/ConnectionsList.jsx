import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, connectionsCollection, studentsCollection, teachersCollection } from '../../firebase/firebaseConfig';
import { 
  UserCircleIcon, 
  MagnifyingGlassIcon as SearchIcon, 
  UserGroupIcon 
} from '@heroicons/react/24/outline';
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
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700/30 p-4 shadow-xl">
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search connections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <SearchIcon className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredConnections.map((connection) => (
          <div
            key={connection.connectionId}
            onClick={() => onSelectUser(connection.userId)}
            className="flex items-center p-3 rounded-xl hover:bg-gray-700/50 cursor-pointer transition-all border border-transparent hover:border-indigo-500/30"
          >
            <div className="flex items-center space-x-3 flex-1">
              <div className="relative">
                {connection.avatar ? (
                  <img
                    src={connection.avatar}
                    alt={connection.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/30"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center border-2 border-indigo-500/30">
                    <span className="text-lg font-semibold text-indigo-400">
                      {connection.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white group-hover:text-indigo-400 transition-colors">
                  {connection.name}
                </h3>
                <p className="text-sm text-gray-400">Click to start chat</p>
              </div>
            </div>
          </div>
        ))}
        
        {filteredConnections.length === 0 && (
          <div className="text-center py-8">
            <UserGroupIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">
              {searchTerm ? 'No matching connections found' : 'No connections yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionsList; 