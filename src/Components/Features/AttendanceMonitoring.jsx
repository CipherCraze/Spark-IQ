import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import {
  HomeIcon,
  FolderIcon,
  ClipboardDocumentIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  LightBulbIcon,
  NewspaperIcon,
  WrenchScrewdriverIcon,
  VideoCameraIcon,
  EnvelopeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

ChartJS.register(...registerables);

const studentMenu = [
  { title: 'Dashboard', Icon: HomeIcon, link: '/dashboard', description: "Overview of your progress." },
  { title: 'My Resources', Icon: FolderIcon, link: '/resource-utilization', description: "Access course materials." },
  { title: 'Tests', Icon: ClipboardDocumentIcon, link: '/student-tests', description: "Take and view your test results." },
  { title: 'Attendance', Icon: ChartBarIcon, link: '/attendance-monitoring', description: "Track your attendance." },
  { title: 'Assignments', Icon: DocumentTextIcon, link: '/assignment-submission', description: "View & submit assignments." },
  { title: 'Grades & Feedback', Icon: ChartBarIcon, link: '/GradesAndFeedback', description: "Check your grades." },
  { title: 'Voice Chat', Icon: ChatBubbleLeftRightIcon, link: '/voice-chat', description: "Discuss with peers." },
  { title: 'Ask Sparky', Icon: QuestionMarkCircleIcon, link: '/chatbot-access', description: "Your AI study assistant." },
  { title: 'AI Questions', Icon: LightBulbIcon, link: '/ai-generated-questions', description: "Practice with AI questions." },
  { title: 'Educational News', Icon: NewspaperIcon, link: '/educational-news', description: "Latest in education." },
  { title: 'Smart Review', Icon: WrenchScrewdriverIcon, link: '/smart-review', description: "Enhance your writing." },
  { title: 'Virtual Meetings', Icon: VideoCameraIcon, link: '/meeting-participation', description: "Join online classes." },
  { title: 'Chat Platform', Icon: ChatBubbleLeftRightIcon, link: '/chat-functionality', description: "Connect with peers." },
  { title: 'My Inbox', Icon: EnvelopeIcon, link: '/inbox-for-suggestions', description: "Messages & suggestions." },
  { title: 'Upgrade to Pro', Icon: SparklesIcon, link: '/pricing', special: true, description: "Unlock premium features." },
];

const AttendanceMonitoring = () => {
  const [realData, setRealData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchData();
      else {
        setRealData(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch attendance records
      const attendanceRef = collection(db, 'attendance');
      const q = query(attendanceRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      
      // Get the first 30 records manually
      const records = snapshot.docs.slice(0, 30).map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Process into the exact format your UI expects
      const monthlyData = processMonthlyData(records);
      const attendanceStats = processStats(records);
      const dailyAttendance = processDailyRecords(records);

      setRealData({
        monthlyData,
        attendanceStats,
        dailyAttendance
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch attendance data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Process functions to match your dummy data structure
  const processMonthlyData = (records) => {
    // Transform records to match your monthlyData structure
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], // Keep same for UI
      present: [25, 24, 26, 23, 22, 24], // Replace with real calculations
      absent: [2, 3, 1, 4, 5, 3],
      late: [1, 0, 2, 1, 2, 0]
    };
  };

  const processStats = (records) => {
    // Calculate real stats but maintain same structure
    return {
      present: 145, // Replace with real count
      absent: 12,
      late: 8,
      overallPercentage: 92.5
    };
  };

  const processDailyRecords = (records) => {
    // Transform to match your dailyAttendance structure
    return records.slice(0, 3).map(record => ({
      id: record.id,
      date: record.date,
      status: 'present', // Determine from record data
      time: '08:45 AM', // Extract from record if available
      trend: [85, 88, 92, 95] // Calculate from historical data
    }));
  };

  // Use realData if available, fallback to original dummy data
  const dataToUse = realData || {
    monthlyData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      present: [25, 24, 26, 23, 22, 24],
      absent: [2, 3, 1, 4, 5, 3],
      late: [1, 0, 2, 1, 2, 0],
    },
    attendanceStats: {
      present: 145,
      absent: 12,
      late: 8,
      overallPercentage: 92.5,
    },
    dailyAttendance: [
      { id: 1, date: '2024-03-01', status: 'present', time: '08:45 AM', trend: [85, 88, 92, 95] },
      { id: 2, date: '2024-03-02', status: 'late', time: '09:15 AM', trend: [78, 82, 85, 87] },
      { id: 3, date: '2024-03-03', status: 'absent', time: null, trend: [82, 85, 88, 90] },
    ]
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen w-64 bg-gray-800 border-r border-gray-700/50 z-50 flex flex-col transition-all duration-300 ${
        isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''
      }`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              SPARK IQ
            </h1>
          </div>
          <nav>
            <ul className="space-y-2">
              {studentMenu.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.link}
                    className="flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-all duration-300 group"
                    onClick={() => isMobile && setSidebarOpen(false)}
                  >
                    <item.Icon className="w-5 h-5 text-indigo-400 group-hover:text-purple-400 transition-colors" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 p-4 lg:p-8 transition-all duration-300 ${
        !isMobile ? 'ml-64' : ''
      }`}>
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-6">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-gray-800/50"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Attendance
          </h1>
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>

        {/* Header */}
        <header className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  My Attendance
                </span>
              </h1>
              <p className="text-gray-400 text-sm lg:text-lg">
                Track your attendance history and statistics
              </p>
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Attendance Overview */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 lg:w-6 lg:h-6 text-purple-400" />
                Monthly Overview
              </h3>
              <div className="h-[300px]">
                <Bar
                  data={{
                    labels: dataToUse.monthlyData.labels,
                    datasets: [
                      {
                        label: 'Present',
                        data: dataToUse.monthlyData.present,
                        backgroundColor: '#10b981',
                        borderRadius: 4,
                      },
                      {
                        label: 'Absent',
                        data: dataToUse.monthlyData.absent,
                        backgroundColor: '#ef4444',
                        borderRadius: 4,
                      },
                      {
                        label: 'Late',
                        data: dataToUse.monthlyData.late,
                        backgroundColor: '#f59e0b',
                        borderRadius: 4,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          color: '#e5e7eb',
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(255, 255, 255, 0.1)',
                        },
                        ticks: {
                          color: '#9ca3af',
                        },
                      },
                      x: {
                        grid: {
                          color: 'rgba(255, 255, 255, 0.1)',
                        },
                        ticks: {
                          color: '#9ca3af',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6 lg:space-y-8">
            {/* Overall Stats */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 lg:w-6 lg:h-6 text-green-400" />
                Overall Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Present</span>
                  <span className="text-green-400 font-medium">{dataToUse.attendanceStats.present}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Absent</span>
                  <span className="text-red-400 font-medium">{dataToUse.attendanceStats.absent}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Late</span>
                  <span className="text-yellow-400 font-medium">{dataToUse.attendanceStats.late}</span>
                </div>
                <div className="pt-4 border-t border-gray-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Overall Attendance</span>
                    <span className="text-blue-400 font-medium">{dataToUse.attendanceStats.overallPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full" 
                      style={{ width: `${dataToUse.attendanceStats.overallPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Attendance */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <ClipboardDocumentIcon className="w-5 h-5 lg:w-6 lg:h-6 text-purple-400" />
                Recent Attendance
              </h3>
              <div className="space-y-4">
                {dataToUse.dailyAttendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{record.date}</p>
                      <p className="text-sm text-gray-400">{record.time || 'No record'}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      record.status === 'present' 
                        ? 'bg-green-500/20 text-green-400'
                        : record.status === 'late'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {record.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AttendanceMonitoring; 