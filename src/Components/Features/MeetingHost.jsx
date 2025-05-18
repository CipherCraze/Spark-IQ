import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  VideoCameraIcon,
  UserGroupIcon,
  ShareIcon,
  ChatBubbleLeftIcon,
  ClipboardIcon,
  PhoneIcon,
  MicrophoneIcon,
  
  
  VideoCameraSlashIcon,
  PresentationChartBarIcon,
  HandRaisedIcon,
  EllipsisVerticalIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';


const MeetingHost = () => {
  const [participants, setParticipants] = useState([
    { id: 1, name: 'Sarah Johnson', role: 'student', video: true, audio: true, raisedHand: false },
    { id: 2, name: 'Michael Chen', role: 'student', video: false, audio: true, raisedHand: true },
    { id: 3, name: 'Emma Wilson', role: 'student', video: true, audio: false, raisedHand: false },
  ]);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [recording, setRecording] = useState(false);

  const toggleAudio = () => setIsMuted(!isMuted);
  const toggleVideo = () => setIsVideoOff(!isVideoOff);
  const toggleRecording = () => setRecording(!recording);

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setChatMessages([...chatMessages, 
        { user: 'You', text: newMessage, time: new Date().toLocaleTimeString() }
      ]);
      setNewMessage('');
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 overflow-auto">
          {/* Host Video */}
          <div className="relative bg-gray-800 rounded-xl aspect-video">
            {!isVideoOff ? (
              <div className="w-full h-full bg-gray-800 rounded-xl" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <VideoCameraSlashIcon className="w-12 h-12 mb-2" />
                <span>Camera is off</span>
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-gray-900/50 px-3 py-1 rounded-lg text-sm">
              You (Host)
            </div>
          </div>

          {/* Participants Videos */}
          {participants.map(participant => (
            <div key={participant.id} className="relative bg-gray-800 rounded-xl aspect-video">
              {participant.video ? (
                <div className="w-full h-full bg-gray-800 rounded-xl" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <VideoCameraSlashIcon className="w-12 h-12 mb-2" />
                  <span>{participant.name}</span>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-gray-900/50 px-3 py-1 rounded-lg text-sm">
                {participant.name}
                {participant.raisedHand && (
                  <HandRaisedIcon className="w-4 h-4 ml-2 text-yellow-400 inline" />
                )}
              </div>
              <div className="absolute top-2 right-2 flex gap-2">
                {!participant.audio && <MicrophoneIcon className="w-5 h-5 text-red-400" />}
                {participant.raisedHand && (
                  <HandRaisedIcon className="w-5 h-5 text-yellow-400 animate-bounce" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Panel */}
        {showParticipants && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            className="w-80 bg-gray-800/50 border-l border-gray-700/50 p-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                <UserGroupIcon className="w-5 h-5 inline mr-2" />
                Participants ({participants.length})
              </h3>
              <button
                onClick={() => setShowParticipants(false)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {participants.map(participant => (
                <div key={participant.id} className="flex items-center justify-between p-2 hover:bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                      {participant.name.charAt(0)}
                    </div>
                    <span className="text-gray-300">{participant.name}</span>
                  </div>
                  {participant.raisedHand && (
                    <HandRaisedIcon className="w-5 h-5 text-yellow-400 animate-bounce" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Control Bar */}
      <div className="h-20 bg-gray-800/50 border-t border-gray-700/50 flex items-center justify-center">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-gray-700/50 text-white'}`}
          >
            {isMuted ? (
              <MicrophoneIcon className="w-6 h-6" />
            ) : (
              <MicrophoneIcon className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500/20 text-red-400' : 'bg-gray-700/50 text-white'}`}
          >
            {isVideoOff ? (
              <VideoCameraSlashIcon className="w-6 h-6" />
            ) : (
              <VideoCameraIcon className="w-6 h-6" />
            )}
          </button>

          <button className="p-3 rounded-full bg-gray-700/50 text-white">
            <PresentationChartBarIcon className="w-6 h-6" />
          </button>

          <button className="p-3 rounded-full bg-gray-700/50 text-white">
            <ShareIcon className="w-6 h-6" />
          </button>

          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="p-3 rounded-full bg-gray-700/50 text-white"
          >
            <UserGroupIcon className="w-6 h-6" />
          </button>

          <button 
            onClick={toggleRecording}
            className={`p-3 rounded-full ${recording ? 'bg-red-500 text-white' : 'bg-gray-700/50 text-white'}`}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              {recording ? (
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-white" />
              )}
            </div>
          </button>

          <button className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600">
            <PhoneIcon className="w-6 h-6 rotate-[135deg]" />
          </button>
        </div>
      </div>

      {/* Chat Panel */}
      {showChat && (
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className="absolute left-0 top-0 bottom-0 w-96 bg-gray-800/50 border-r border-gray-700/50 p-4"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              <ChatBubbleLeftIcon className="w-5 h-5 inline mr-2" />
              Chat
            </h3>
            <button
              onClick={() => setShowChat(false)}
              className="text-gray-400 hover:text-white"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="h-[calc(100vh-180px)] overflow-y-auto mb-4 space-y-4">
            {chatMessages.map((message, index) => (
              <div key={index} className="bg-gray-700/30 p-3 rounded-lg">
                <div className="text-sm text-purple-400">{message.user}</div>
                <p className="text-gray-300">{message.text}</p>
                <div className="text-xs text-gray-500 mt-1">{message.time}</div>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Type a message..."
            />
            <button
              type="submit"
              className="px-4 py-2 bg-purple-500 rounded-lg hover:bg-purple-600"
            >
              Send
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default MeetingHost;