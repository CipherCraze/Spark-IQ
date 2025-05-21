import React, { useState } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { useNavigate } from 'react-router-dom';
import { VideoCameraIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const Meetings = () => {
  const [roomName, setRoomName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  const joinMeeting = () => {
    if (!roomName.trim()) {
      alert('Please enter a room name');
      return;
    }
    if (!displayName.trim()) {
      alert('Please enter your name');
      return;
    }
    setIsJoining(true);
  };

  const handleApiReady = (apiObj) => {
    apiObj.addEventListeners({
      videoConferenceJoined: () => {
        console.log('Participant joined the meeting');
      },
      participantJoined: () => {
        console.log('New participant joined');
      },
    });
  };

  if (!isJoining) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <VideoCameraIcon className="w-12 h-12 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-blue-400 mb-6 text-center">Join a Meeting</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-blue-300 mb-2 flex items-center">
                <UserCircleIcon className="w-5 h-5 mr-2" />
                Your Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-blue-300 mb-2 flex items-center">
                <VideoCameraIcon className="w-5 h-5 mr-2" />
                Room Name
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter room name"
              />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={joinMeeting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
              >
                <VideoCameraIcon className="w-5 h-5 mr-2" />
                Join Meeting
              </button>
              <button
                onClick={() => navigate('/host')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
              >
                Host Meeting
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900">
      <JitsiMeeting
        domain="meet.jit.si"
        roomName={roomName}
        displayName={displayName}
        configOverwrite={{
          startWithAudioMuted: true,
          disableModeratorIndicator: true,
          startScreenSharing: false,
          enableEmailInStats: false,
          prejoinPageEnabled: false,
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          TOOLBAR_BUTTONS: [
            'microphone',
            'camera',
            'closedcaptions',
            'desktop',
            'fullscreen',
            'fodeviceselection',
            'hangup',
            'profile',
            'chat',
            'recording',
            'shortcuts',
            'tileview',
            'select-background',
            'download',
            'help',
            'security',
          ],
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = '100%';
          iframeRef.style.width = '100%';
        }}
        onApiReady={handleApiReady}
      />
    </div>
  );
};

export default Meetings; 