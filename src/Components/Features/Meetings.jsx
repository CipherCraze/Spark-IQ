import { useState, useEffect, useRef } from 'react';
import {
  VideoCameraIcon,
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  PresentationChartBarIcon,
  HandRaisedIcon,
  MicrophoneIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';
import { ChevronLeftIcon, Bars3Icon } from '@heroicons/react/24/outline';

const Meetings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [scheduledMeetings, setScheduledMeetings] = useState([
    {
      id: 1,
      title: 'Math Lecture',
      date: '2023-11-15',
      time: '14:00',
      duration: '90 mins',
      participants: 25,
      joinLink: '#',
    },
    {
      id: 2,
      title: 'Science Workshop',
      date: '2023-11-17',
      time: '10:30',
      duration: '120 mins',
      participants: 42,
      joinLink: '#',
    },
  ]);

  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    time: '',
    duration: '60',
    description: '',
  });

  // WebRTC Refs
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef([]);
  const [streams, setStreams] = useState([]);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [participantCount, setParticipantCount] = useState(4); // Mock participants
  const [handRaised, setHandRaised] = useState(false);

  // Initialize media devices
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // Mock remote streams
        const mockStreams = Array(4).fill(null).map((_, i) => ({
          id: `remote-${i}`,
          name: `Student ${i + 1}`,
          stream: null // In a real app, this would be from other participants
        }));
        
        setStreams(mockStreams);
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };

    initMedia();

    return () => {
      if (localVideoRef.current?.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleScheduleMeeting = () => {
    if (newMeeting.title && newMeeting.date && newMeeting.time) {
      const meeting = {
        id: scheduledMeetings.length + 1,
        ...newMeeting,
        participants: 0,
        joinLink: `meeting-${Date.now()}`,
      };
      setScheduledMeetings([meeting, ...scheduledMeetings]);
      setNewMeeting({
        title: '',
        date: '',
        time: '',
        duration: '60',
        description: '',
      });
    }
  };

  const toggleMic = async () => {
    if (localVideoRef.current?.srcObject) {
      const audioTracks = localVideoRef.current.srcObject.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMicMuted(!isMicMuted);
    }
  };

  const toggleCamera = async () => {
    if (localVideoRef.current?.srcObject) {
      const videoTracks = localVideoRef.current.srcObject.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(!isCameraOff);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        if (localVideoRef.current) {
          // Replace video track with screen share
          const videoTrack = screenStream.getVideoTracks()[0];
          const sender = localVideoRef.current.srcObject.getVideoTracks()[0];
          sender.replaceTrack(videoTrack);
          
          videoTrack.onended = () => {
            toggleScreenShare();
          };
        }
      } else {
        // Switch back to camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        const videoTrack = stream.getVideoTracks()[0];
        const sender = localVideoRef.current.srcObject.getVideoTracks()[0];
        sender.replaceTrack(videoTrack);
      }
      
      setIsScreenSharing(!isScreenSharing);
    } catch (err) {
      console.error("Error sharing screen:", err);
    }
  };

  const startRecording = async () => {
    if (!isRecording) {
      try {
        // In a real app, you would use MediaRecorder API
        // This is a simplified mock implementation
        setIsRecording(true);
        console.log("Recording started");
      } catch (err) {
        console.error("Error starting recording:", err);
      }
    } else {
      setIsRecording(false);
      console.log("Recording stopped");
    }
  };

  const toggleHandRaise = () => {
    setHandRaised(!handRaised);
    // In a real app, this would notify other participants
  };

  const sendMessage = () => {
    if (messageInput.trim()) {
      const newMessage = {
        id: chatMessages.length + 1,
        sender: 'You',
        text: messageInput,
        timestamp: new Date().toISOString(),
      };
      setChatMessages([...chatMessages, newMessage]);
      setMessageInput('');
      
      // Mock response (in a real app, this would come from other participants)
      setTimeout(() => {
        const responses = [
          "Thanks for your question!",
          "I agree with that point.",
          "Let me check and get back to you.",
          "Could you elaborate on that?"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        setChatMessages(prev => [...prev, {
          id: prev.length + 2,
          sender: 'Dr. Smith',
          text: randomResponse,
          timestamp: new Date().toISOString(),
        }]);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Collapsible Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-800 border-r border-gray-700/50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } z-50 flex flex-col`}
      >
        {/* Sidebar Content */}
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 relative">
            <div className="flex items-center gap-3 mb-8 relative">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute -right-3 top-0 p-1.5 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-400" />
              </button>
              <VideoCameraIcon className="w-8 h-8 text-indigo-400 animate-pulse" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                SPARK Meetings
              </h1>
            </div>
          </div>

          {/* Scrollable Menu */}
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            <nav>
              <ul className="space-y-1">
                {[
                  { title: 'Dashboard', link: '/dashboard', Icon: VideoCameraIcon },
                  { title: 'Schedule Meeting', link: '#schedule', Icon: CalendarIcon },
                  { title: 'My Meetings', link: '#my-meetings', Icon: UserGroupIcon },
                  { title: 'Recordings', link: '#recordings', Icon: DocumentDuplicateIcon },
                  { title: 'Virtual Classroom', link: '#classroom', Icon: PresentationChartBarIcon },
                ].map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.link}
                      className="flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-all duration-300 group hover:translate-x-1"
                    >
                      <item.Icon className="w-5 h-5 text-indigo-400 group-hover:text-purple-400 transition-colors" />
                      <span>{item.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 p-8 overflow-y-auto relative transition-margin duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        {/* Toggle Button */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed left-4 top-4 z-40 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Bars3Icon className="w-6 h-6 text-gray-400" />
          </button>
        )}

        {/* Header */}
        <header className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-3">
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Virtual Classroom
            </span>
          </h2>
          <p className="text-gray-400 text-lg">
            Host and join interactive virtual meetings with real-time collaboration.
          </p>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Meeting Space */}
          <div className="lg:col-span-2 bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Host Video */}
              <div className="col-span-2 bg-gray-900 rounded-lg aspect-video relative overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-gray-900/70 px-3 py-1 rounded-full">
                  <MicrophoneIcon className={`w-4 h-4 ${isMicMuted ? 'text-red-400' : 'text-green-400'}`} />
                  <CameraIcon className={`w-4 h-4 ${isCameraOff ? 'text-red-400' : 'text-green-400'}`} />
                  <span className="text-white text-sm">You (Host)</span>
                </div>
              </div>
              
              {/* Participant Videos */}
              {streams.map((stream, i) => (
                <div key={stream.id} className="bg-gray-900 rounded-lg aspect-video relative overflow-hidden">
                  {!isCameraOff && (
                    <video
                      ref={el => remoteVideoRefs.current[i] = el}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-gray-900/70 px-2 py-0.5 rounded-full">
                    <MicrophoneIcon className="w-3 h-3 text-green-400" />
                    <span className="text-white text-xs">{stream.name}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Meeting Controls */}
            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={toggleMic}
                className={`p-3 ${isMicMuted ? 'bg-red-500/90' : 'bg-indigo-500/90'} rounded-full hover:opacity-90 transition-colors`}
              >
                <MicrophoneIcon className="w-6 h-6 text-white" />
              </button>
              <button 
                onClick={toggleCamera}
                className={`p-3 ${isCameraOff ? 'bg-red-500/90' : 'bg-indigo-500/90'} rounded-full hover:opacity-90 transition-colors`}
              >
                <CameraIcon className="w-6 h-6 text-white" />
              </button>
              <button 
                onClick={toggleScreenShare}
                className={`p-3 ${isScreenSharing ? 'bg-purple-500' : 'bg-gray-700'} rounded-full hover:opacity-90 transition-colors`}
              >
                <ShareIcon className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={startRecording}
                className={`p-3 ${isRecording ? 'bg-red-500' : 'bg-gray-700'} rounded-full hover:opacity-90 transition-colors`}
              >
                <DocumentDuplicateIcon className="w-6 h-6 text-white" />
              </button>
              <button 
                onClick={toggleHandRaise}
                className={`p-3 ${handRaised ? 'bg-yellow-500/90' : 'bg-gray-700'} rounded-full hover:opacity-90 transition-colors`}
              >
                <HandRaisedIcon className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Schedule Meeting */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-indigo-400" />
                Schedule New Meeting
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Meeting Title"
                  className="w-full p-2 bg-gray-900 rounded-lg text-white border border-gray-700 focus:border-indigo-500 focus:outline-none"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                />
                <input
                  type="date"
                  className="w-full p-2 bg-gray-900 rounded-lg text-white border border-gray-700 focus:border-indigo-500 focus:outline-none"
                  value={newMeeting.date}
                  onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})}
                />
                <input
                  type="time"
                  className="w-full p-2 bg-gray-900 rounded-lg text-white border border-gray-700 focus:border-indigo-500 focus:outline-none"
                  value={newMeeting.time}
                  onChange={(e) => setNewMeeting({...newMeeting, time: e.target.value})}
                />
                <select
                  className="w-full p-2 bg-gray-900 rounded-lg text-white border border-gray-700 focus:border-indigo-500 focus:outline-none"
                  value={newMeeting.duration}
                  onChange={(e) => setNewMeeting({...newMeeting, duration: e.target.value})}
                >
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
                <button
                  onClick={handleScheduleMeeting}
                  className="w-full py-2 bg-indigo-500/90 rounded-lg text-white hover:bg-indigo-600 transition-colors"
                  disabled={!newMeeting.title || !newMeeting.date || !newMeeting.time}
                >
                  Schedule Meeting
                </button>
              </div>
            </div>

            {/* Chat Section */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 h-96 flex flex-col">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <ChatBubbleLeftIcon className="w-6 h-6 text-green-400" />
                Meeting Chat
              </h3>
              <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800/50">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`bg-gray-900/30 p-3 rounded-lg ${msg.sender === 'You' ? 'ml-6' : 'mr-6'}`}>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span className={msg.sender === 'You' ? 'text-indigo-300' : 'text-green-300'}>{msg.sender}</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-white mt-1">{msg.text}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 p-2 bg-gray-900 rounded-lg text-white border border-gray-700 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  onClick={sendMessage}
                  className="p-2 bg-indigo-500/90 rounded-lg hover:bg-indigo-600 transition-colors"
                  disabled={!messageInput.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scheduled Meetings */}
        <div className="mt-8 bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <UserGroupIcon className="w-6 h-6 text-purple-400" />
            Upcoming Meetings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scheduledMeetings.map((meeting) => (
              <div key={meeting.id} className="bg-gray-900/30 p-4 rounded-lg hover:bg-gray-800/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white text-lg font-semibold">{meeting.title}</h4>
                  <span className="text-sm text-gray-400">{meeting.date} {meeting.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-400">
                    <ClockIcon className="w-4 h-4" />
                    <span>{meeting.duration} mins</span>
                    <UserGroupIcon className="w-4 h-4 ml-2" />
                    <span>{meeting.participants}</span>
                  </div>
                  <a
                    href={meeting.joinLink}
                    className="px-3 py-1 bg-indigo-500/90 rounded-lg text-white hover:bg-indigo-600 transition-colors"
                  >
                    Join Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Meetings;