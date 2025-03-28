import { useState } from 'react';
import {
  VideoCameraIcon,
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  ChevronLeftIcon,
  Bars3Icon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  PlayIcon,
  ShareIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';

const Meetings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  // Sample meeting data
  const meetingsData = {
    live: [
      {
        id: 1,
        title: 'Advanced Calculus Lecture',
        date: '2023-11-15',
        time: '14:00',
        duration: '90 mins',
        participants: 25,
        joinLink: '#',
        instructor: 'Dr. Smith',
      },
    ],
    upcoming: [
      {
        id: 3,
        title: 'Organic Chemistry Review',
        date: '2023-11-17',
        time: '10:30',
        duration: '120 mins',
        participants: 42,
        joinLink: '#',
        instructor: 'Dr. Williams',
      },
      {
        id: 4,
        title: 'Literature Seminar',
        date: '2023-11-18',
        time: '13:00',
        duration: '90 mins',
        participants: 15,
        joinLink: '#',
        instructor: 'Prof. Davis',
      },
    ],
    past: [
      {
        id: 6,
        title: 'Introduction to Biology',
        date: '2023-11-10',
        time: '11:00',
        duration: '90 mins',
        participants: 28,
        recordingLink: '#',
        materialsLink: '#',
        instructor: 'Dr. Wilson',
        attended: true,
        rating: 4,
        notes: 'Covered cell structure and function. Important concepts for next exam.',
      },
      {
        id: 7,
        title: 'History Discussion',
        date: '2023-11-08',
        time: '15:00',
        duration: '60 mins',
        participants: 12,
        recordingLink: '#',
        materialsLink: '#',
        instructor: 'Prof. Miller',
        attended: false,
        rating: null,
        notes: 'Missed due to conflicting appointment',
      },
      {
        id: 8,
        title: 'Mathematics Problem Solving',
        date: '2023-11-05',
        time: '14:00',
        duration: '120 mins',
        participants: 22,
        recordingLink: '#',
        materialsLink: '#',
        instructor: 'Dr. Anderson',
        attended: true,
        rating: 5,
        notes: 'Excellent session on differential equations. Practice problems were very helpful.',
      },
      {
        id: 9,
        title: 'Physics Lab Review',
        date: '2023-11-03',
        time: '09:30',
        duration: '90 mins',
        participants: 18,
        recordingLink: '#',
        materialsLink: '#',
        instructor: 'Prof. Johnson',
        attended: true,
        rating: 3,
        notes: 'Good overview of lab procedures, but some concepts needed more explanation.',
      },
    ],
  };

  // Function to render star rating
  const renderRating = (rating) => {
    if (!rating) return null;
    return (
      <div className="flex items-center mt-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-500'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Collapsible Sidebar (unchanged) */}
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
                  { title: 'My Meetings', link: '#my-meetings', Icon: UserGroupIcon },
                  { title: 'Schedule Meeting', link: '#schedule', Icon: CalendarIcon },
                  { title: 'Recordings', link: '#recordings', Icon: VideoCameraIcon },
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
              My Meetings
            </span>
          </h2>
          <p className="text-gray-400 text-lg">
            View and manage your scheduled meetings
          </p>
        </header>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'live' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            <PlayIcon className="w-5 h-5" />
            Live Meetings
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'upcoming' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            <CalendarIcon className="w-5 h-5" />
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'past' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            <CheckCircleIcon className="w-5 h-5" />
            Past Meetings
          </button>
        </div>

        {/* Meeting Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetingsData[activeTab].map((meeting) => (
            <div key={meeting.id} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:border-indigo-400/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{meeting.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">Instructor: {meeting.instructor}</p>
                  {activeTab === 'past' && renderRating(meeting.rating)}
                </div>
                {activeTab === 'past' && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    meeting.attended ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                  }`}>
                    {meeting.attended ? 'Attended' : 'Missed'}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <CalendarIcon className="w-5 h-5 text-indigo-400" />
                  <span>{meeting.date} at {meeting.time}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <ClockIcon className="w-5 h-5 text-amber-400" />
                  <span>{meeting.duration}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <UserGroupIcon className="w-5 h-5 text-purple-400" />
                  <span>{meeting.participants} participants</span>
                </div>

                {/* Additional details for past meetings */}
                {activeTab === 'past' && meeting.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="flex items-start gap-2">
                      <ClipboardDocumentIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-400 text-sm">{meeting.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6">
                {activeTab === 'live' && (
                  <a
                    href={meeting.joinLink}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <PlayIcon className="w-5 h-5" />
                    Join Meeting
                  </a>
                )}
                {activeTab === 'upcoming' && (
                  <div className="flex gap-2">
                    <a
                      href={meeting.joinLink}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      <ArrowRightIcon className="w-5 h-5" />
                      Join When Live
                    </a>
                    <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">
                      <CalendarIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}
                {activeTab === 'past' && (
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={meeting.recordingLink}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      <PlayIcon className="w-5 h-5" />
                      View Recording
                    </a>
                    <a
                      href={meeting.materialsLink}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <DocumentTextIcon className="w-5 h-5" />
                      Materials
                    </a>
                    <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">
                      <ShareIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {meetingsData[activeTab].length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-500 mb-4">
              <CalendarIcon className="w-full h-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-1">
              No {activeTab} meetings
            </h3>
            <p className="text-gray-500">
              {activeTab === 'live'
                ? 'There are currently no live meetings'
                : activeTab === 'upcoming'
                ? 'You have no upcoming meetings scheduled'
                : 'No past meetings to display'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Meetings;