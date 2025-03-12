// Meetings.jsx
import { useState } from 'react';
import { Link } from 'react-router';
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
import { ChevronLeftIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';


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

  const [activeMeeting, setActiveMeeting] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

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

  const startRecording = () => {
    setIsRecording(true);
    // Add recording functionality
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    // Add screen sharing functionality
  };

  const sendMessage = () => {
    if (messageInput.trim()) {
      setChatMessages([...chatMessages, {
        id: chatMessages.length + 1,
        sender: 'You',
        text: messageInput,
        timestamp: new Date().toISOString(),
      }]);
      setMessageInput('');
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
                          { title: 'Dashboard', link: '/dashboard', Icon: ClipboardDocumentIcon },
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
              <div className="col-span-2 bg-gray-900 rounded-lg aspect-video relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <MicrophoneIcon className="w-5 h-5 text-green-400" />
                  <CameraIcon className="w-5 h-5 text-green-400" />
                  <span className="text-white">Host: Dr. Smith</span>
                </div>
              </div>
              
              {/* Participant Videos */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-900 rounded-lg aspect-video relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-green-500/20" />
                  <span className="absolute bottom-2 left-2 text-white text-sm">Student {i}</span>
                </div>
              ))}
            </div>

            {/* Meeting Controls */}
            <div className="flex items-center justify-center gap-4">
              <button className="p-3 bg-indigo-500/90 rounded-full hover:bg-indigo-600 transition-colors">
                <MicrophoneIcon className="w-6 h-6 text-white" />
              </button>
              <button className="p-3 bg-red-500/90 rounded-full hover:bg-red-600 transition-colors">
                <VideoCameraIcon className="w-6 h-6 text-white" />
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
              <button className="p-3 bg-green-500/90 rounded-full hover:bg-green-600 transition-colors">
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
                  className="w-full p-2 bg-gray-900 rounded-lg text-white"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                />
                <input
                  type="date"
                  className="w-full p-2 bg-gray-900 rounded-lg text-white"
                  value={newMeeting.date}
                  onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})}
                />
                <input
                  type="time"
                  className="w-full p-2 bg-gray-900 rounded-lg text-white"
                  value={newMeeting.time}
                  onChange={(e) => setNewMeeting({...newMeeting, time: e.target.value})}
                />
                <select
                  className="w-full p-2 bg-gray-900 rounded-lg text-white"
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
              <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="bg-gray-900/30 p-3 rounded-lg">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>{msg.sender}</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
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
                  className="flex-1 p-2 bg-gray-900 rounded-lg text-white"
                />
                <button
                  onClick={sendMessage}
                  className="p-2 bg-indigo-500/90 rounded-lg hover:bg-indigo-600 transition-colors"
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