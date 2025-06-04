import React, { useState } from 'react';
import { Link } from 'react-router'; // Assuming react-router v2/v3, adjust if using react-router-dom
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import {
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  SparklesIcon,
  UsersIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  PresentationChartLineIcon,
  DocumentMagnifyingGlassIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentIcon,
  ChevronLeftIcon,
  Bars3Icon,
  ChartBarIcon,
  FolderIcon,
  // ArrowUpTrayIcon, // Removed from nav items for clarity
  PrinterIcon,
  ArrowTrendingUpIcon,
  ChevronDownIcon, // Added for table expand
  ChevronUpIcon,   // Added for table expand
  // ArrowRightIcon, // Alternative for nav hover, not used for now
} from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker'; // Not used in current JSX, but kept import
import 'react-datepicker/dist/react-datepicker.css';

ChartJS.register(...registerables);

const AttendanceMonitoring = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Not used in current JSX
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  // Sample data (remains the same)
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    present: [25, 24, 26, 23, 22, 24],
    absent: [2, 3, 1, 4, 5, 3],
    late: [1, 0, 2, 1, 2, 0],
  };

  const attendanceStats = {
    present: 145,
    absent: 12,
    late: 8,
    overallPercentage: 92.5,
  };

  const dailyAttendance = [
    { id: 1, date: '2024-03-01', status: 'present', time: '08:45 AM', trend: [85, 88, 92, 95] },
    { id: 2, date: '2024-03-02', status: 'late', time: '09:15 AM', trend: [78, 82, 85, 87] },
    { id: 3, date: '2024-03-03', status: 'absent', time: null, trend: [82, 85, 88, 90] },
    // Add more sample data for better visual testing if needed
  ];

  // Enhanced Chart Options
  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#cbd5e1', font: { size: 12 } },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 10,
        cornerRadius: 6,
        boxPadding: 3,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.08)' },
        ticks: { color: '#9ca3af', font: { size: 10 } },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af', font: { size: 10 } },
      },
    },
  };

  const barChartOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      legend: { ...commonChartOptions.plugins.legend, position: 'top' },
    },
  };
  
  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#cbd5e1', font: { size: 12 } } },
      tooltip: { ...commonChartOptions.plugins.tooltip },
    },
  };

  const trendLineChartOptions = {
    ...commonChartOptions,
    plugins: { legend: { display: false }, tooltip: { ...commonChartOptions.plugins.tooltip } },
    scales: {
      y: { ...commonChartOptions.scales.y, display: false }, // Hide y-axis for compact trend
      x: { ...commonChartOptions.scales.x, display: false }, // Hide x-axis for compact trend
    },
  };


  const chartData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [
      {
        data: [attendanceStats.present, attendanceStats.absent, attendanceStats.late],
        backgroundColor: ['#4f46e5', '#ef4444', '#f59e0b'], // indigo-600, red-500, amber-500
        hoverBackgroundColor: ['#4338ca', '#dc2626', '#d97706'], // indigo-700, red-600, amber-600
        borderColor: '#374151', // gray-700 for dark theme
        borderWidth: 2,
      },
    ],
  };

  const trendData = (trend) => ({
    labels: ['W1', 'W2', 'W3', 'W4'], // Shorter labels for compact view
    datasets: [
      {
        label: 'Attendance Trend',
        data: trend,
        borderColor: '#6366f1', // indigo-500
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#4f46e5',
      },
    ],
  });

  // Enhanced status pill styling
  const getStatusPillClasses = (status) => {
    switch (status) {
      case 'present':
        return 'bg-indigo-500/10 text-indigo-400 ring-1 ring-inset ring-indigo-500/30';
      case 'absent':
        return 'bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/30';
      case 'late':
        return 'bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 ring-1 ring-inset ring-gray-500/30';
    }
  };
  
  const statCardDetails = [
    { label: 'Present', value: attendanceStats.present, color: 'indigo', Icon: CheckCircleIcon },
    { label: 'Absent', value: attendanceStats.absent, color: 'red', Icon: XCircleIcon },
    { label: 'Late', value: attendanceStats.late, color: 'amber', Icon: ClockIcon },
    { label: 'Overall', value: `${attendanceStats.overallPercentage}%`, color: 'green', Icon: ArrowTrendingUpIcon }, // Changed icon
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex text-gray-200">
      {/* Collapsible Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-800/95 backdrop-blur-md border-r border-gray-700/50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } z-50 flex flex-col shadow-2xl`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 relative">
            <div className="absolute w-36 h-36 bg-indigo-600/10 rounded-full -top-12 -right-12 blur-2xl opacity-50" />
            <div className="absolute w-48 h-48 bg-purple-600/10 rounded-full -bottom-20 -left-16 blur-2xl opacity-50" />
            <div className="flex items-center gap-3 mb-8 relative">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute -right-2 top-1/2 -translate-y-1/2 p-1.5 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-400 hover:text-gray-200" />
              </button>
              <ClipboardDocumentIcon className="w-8 h-8 text-indigo-400 animate-pulse" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent [text-shadow:0_0_8px_theme(colors.indigo.500_/_0.4)]">
                SPARK-IQ
              </h1>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4 styled-scrollbar">
            <nav>
              <ul className="space-y-1.5">
                {[
                  { title: 'Dashboard', link: '/dashboard', Icon: ChartBarIcon }, // Changed icon for Dashboard
                  { title: 'Assignments', link: '/assignment-submission', Icon: DocumentTextIcon },
                  { title: 'Tests', Icon: ClipboardDocumentIcon, link: '/student-tests' },
                  { title: 'Resources', link: '/resource-utilization', Icon: FolderIcon,  },
                  { title: 'Attendance', Icon: CheckCircleIcon, link: '/attendance-monitoring', active: true }, // Changed icon
                  { title: 'Grades & Feedback', Icon: PresentationChartLineIcon, link: '/GradesAndFeedback' },
                  { title: 'Voice Chat', Icon: ChatBubbleLeftRightIcon, link: '/voice-chat' },
                  { title: 'Ask Sparky', Icon: SparklesIcon, link: '/chatbot-access' }, // Changed Icon
                  { title: 'AI Questions', Icon: SparklesIcon, link: '/ai-generated-questions' },
                  { title: 'News Feed', Icon: UsersIcon, link: '/educational-news' },
                  { title: 'Smart Review', Icon: DocumentMagnifyingGlassIcon, link: '/smart-review' },
                  { title: 'Meetings', Icon: VideoCameraIcon, link: '/meeting-participation' },
                  { title: 'Inbox', Icon: EnvelopeIcon, link: '/inbox-for-suggestions' },
                ].map((item) => (
                  <li key={item.title}>
                    <Link
                      to={item.link}
                      className={`flex items-center gap-x-3.5 px-3.5 py-2.5 rounded-lg transition-all duration-200 group hover:bg-gray-700/70 ${
                        item.active 
                          ? 'bg-indigo-500/15 text-indigo-300 border-l-4 border-indigo-400 font-semibold shadow-inner shadow-indigo-500/10' 
                          : 'text-gray-400 hover:text-gray-100 hover:translate-x-1'
                      }`}
                    >
                      <item.Icon className={`w-5 h-5 flex-shrink-0 ${item.active ? 'text-indigo-400' : 'text-gray-500 group-hover:text-indigo-400 transition-colors'}`} />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 p-6 sm:p-8 overflow-y-auto relative transition-margin duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed left-4 top-4 z-40 p-2 bg-gray-800/80 backdrop-blur-sm rounded-lg hover:bg-gray-700 transition-colors shadow-lg"
          >
            <Bars3Icon className="w-6 h-6 text-gray-300" />
          </button>
        )}

        <header className="mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-2 [text-shadow:0_0_12px_theme(colors.indigo.500_/_0.3)]">
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Attendance Monitoring
                </span>
              </h2>
              <p className="text-gray-400 text-base sm:text-lg">
                Track your attendance, view trends, and manage records efficiently.
              </p>
            </div>
            <button className="mt-4 sm:mt-0 p-2.5 bg-gray-800 border border-gray-700 rounded-lg hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300 group">
              <PrinterIcon className="w-5 h-5 text-gray-400 group-hover:text-indigo-400 transition-colors" />
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {statCardDetails.map((stat) => (
            <div
              key={stat.label}
              className={`relative overflow-hidden bg-gray-800 p-5 rounded-xl border border-gray-700/80
                         hover:bg-gray-700/60 hover:shadow-xl hover:shadow-${stat.color}-600/20
                         transition-all duration-300 ease-in-out transform hover:-translate-y-1 group`}
            >
              <div className={`absolute -top-5 -right-5 w-20 h-20 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-400 text-${stat.color}-500`}>
                <stat.Icon className="w-full h-full" />
              </div>
              <div className="relative z-10">
                <div className={`mb-3 p-2.5 inline-block rounded-lg bg-${stat.color}-500/10`}>
                    <stat.Icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
                <p className="text-sm text-gray-400 mb-0.5">{stat.label}</p>
                <p className={`text-3xl font-bold text-${stat.color}-400`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-10">
          <div className="lg:col-span-3 bg-gray-800 p-6 rounded-xl border border-gray-700/80 shadow-lg hover:shadow-indigo-500/10 transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-gray-100 mb-1">Monthly Overview</h3>
            <p className="text-sm text-gray-400 mb-4">Presence, absence, and late arrivals over months.</p>
            <div className="h-80">
              <Bar
                data={{
                  labels: monthlyData.labels,
                  datasets: [
                    { label: 'Present', data: monthlyData.present, backgroundColor: '#4f46e5', borderRadius: 4 },
                    { label: 'Absent', data: monthlyData.absent, backgroundColor: '#ef4444', borderRadius: 4 },
                    { label: 'Late', data: monthlyData.late, backgroundColor: '#f59e0b', borderRadius: 4 },
                  ],
                }}
                options={barChartOptions}
              />
            </div>
          </div>

          <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl border border-gray-700/80 shadow-lg hover:shadow-purple-500/10 transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-gray-100 mb-1">Overall Distribution</h3>
            <p className="text-sm text-gray-400 mb-4">Proportion of attendance statuses.</p>
            <div className="h-80 flex items-center justify-center">
              <Doughnut data={chartData} options={doughnutChartOptions} />
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700/80 shadow-lg overflow-hidden">
          <div className="p-5 border-b border-gray-700/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h3 className="text-xl font-semibold text-gray-100">Daily Records</h3>
                <p className="text-sm text-gray-400">Detailed log of daily attendance status.</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search records..."
                  className="w-full md:w-48 pl-10 pr-3 py-2 bg-gray-700/60 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-gray-700 transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-gray-700/60 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-gray-700 transition-colors"
              >
                <option value="all">All Statuses</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-700/50">
                <tr>
                  {['Date', 'Status', 'Time', 'Weekly Trend', 'Details'].map(header => (
                     <th key={header} className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {header}
                     </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/70">
                {dailyAttendance
                  .filter(record => 
                    (filter === 'all' || record.status === filter) &&
                    (record.date.includes(searchQuery) || record.status.includes(searchQuery))
                  )
                  .map((record) => (
                  <React.Fragment key={record.id}>
                    <tr
                      className="hover:bg-gray-700/40 transition-colors duration-150"
                    >
                      <td className="px-5 py-4 text-sm text-gray-200 whitespace-nowrap">{record.date}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusPillClasses(record.status)}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-400 whitespace-nowrap">{record.time || 'N/A'}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="w-28 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${record.trend[record.trend.length - 1]}%` }} // Assumes trend value is already 0-100
                          />
                        </div>
                         <span className="text-xs text-gray-500 ml-2">{record.trend[record.trend.length - 1]}%</span>
                      </td>
                      <td className="px-5 py-4 text-sm whitespace-nowrap">
                        <button 
                          onClick={() => setExpandedRow(expandedRow === record.id ? null : record.id)}
                          className="p-1.5 rounded-md hover:bg-gray-600/50 text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          {expandedRow === record.id 
                            ? <ChevronUpIcon className="w-5 h-5" /> 
                            : <ChevronDownIcon className="w-5 h-5" />
                          }
                        </button>
                      </td>
                    </tr>
                    {expandedRow === record.id && (
                      <tr className="bg-gray-800/70">
                        <td colSpan="5" className="px-5 py-5">
                          <div className="p-4 bg-gray-900/50 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-100 mb-3">4-Week Attendance Trend for {record.date}</h4>
                            <div className="h-40"> {/* Increased height for better visibility */}
                              <Line data={trendData(record.trend)} options={trendLineChartOptions} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
             {dailyAttendance.filter(record => 
                    (filter === 'all' || record.status === filter) &&
                    (record.date.includes(searchQuery) || record.status.includes(searchQuery))
                  ).length === 0 && (
                <div className="text-center py-12">
                    <DocumentMagnifyingGlassIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No records found.</p>
                    <p className="text-gray-600 text-sm">Try adjusting your search or filter.</p>
                </div>
             )}
          </div>
        </div>
        <footer className="mt-12 text-center text-sm text-gray-500">
            Spark-IQ Attendance Module © {new Date().getFullYear()}
        </footer>
      </main>

      {/* Custom Scrollbar Styling (Optional - if you want to style scrollbars globally or for specific elements) */}
      <style jsx global>{`
        .styled-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .styled-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.5); /* gray-700 with opacity */
          border-radius: 10px;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.7); /* gray-500 with opacity */
          border-radius: 10px;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.9); /* gray-400 with opacity */
        }
      `}</style>
    </div>
  );
};

export default AttendanceMonitoring;