import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import {
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentIcon,
  ChevronLeftIcon,
  Bars3Icon,
  ChartBarIcon,
  FolderIcon,
  ArrowUpTrayIcon,
  PrinterIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

ChartJS.register(...registerables);

const AttendanceMonitoring = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  // Sample data
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
    {
      id: 1,
      date: '2024-03-01',
      status: 'present',
      time: '08:45 AM',
      trend: [85, 88, 92, 95],
    },
    {
      id: 2,
      date: '2024-03-02',
      status: 'late',
      time: '09:15 AM',
      trend: [78, 82, 85, 87],
    },
    {
      id: 3,
      date: '2024-03-03',
      status: 'absent',
      time: null,
      trend: [82, 85, 88, 90],
    },
  ];

  const chartData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [
      {
        data: [attendanceStats.present, attendanceStats.absent, attendanceStats.late],
        backgroundColor: ['#4f46e5', '#ef4444', '#f59e0b'],
        hoverBackgroundColor: ['#4338ca', '#dc2626', '#d97706'],
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { enabled: true },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' } },
      x: { grid: { display: false } },
    },
  };

  const trendData = (trend) => ({
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Attendance Trend',
        data: trend,
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-indigo-500/20 text-indigo-400';
      case 'absent':
        return 'bg-red-500/20 text-red-400';
      case 'late':
        return 'bg-amber-500/20 text-amber-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
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
            <div className="absolute w-32 h-32 bg-indigo-500/10 rounded-full -top-16 -right-16" />
            <div className="absolute w-48 h-48 bg-purple-500/10 rounded-full -bottom-24 -left-24" />
            <div className="flex items-center gap-3 mb-8 relative">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute -right-3 top-0 p-1.5 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-400" />
              </button>
              <ClipboardDocumentIcon className="w-8 h-8 text-indigo-400 animate-pulse" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                SPARK-IQ
              </h1>
            </div>
          </div>

          {/* Scrollable Menu */}
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            <nav>
              <ul className="space-y-1">
                {[
                  { title: 'Dashboard', link: '/dashboard', Icon: ClipboardDocumentIcon },
                  { title: 'Attendance', link: '/attendance-monitoring', Icon: CalendarIcon },
                  { title: 'Grades', link: '/grading-access', Icon: ChartBarIcon },
                  { title: 'Resources', link: '/resources', Icon: FolderIcon },
                ].map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.link}
                      className="flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-all duration-300 group hover:translate-x-1"
                    >
                      <item.Icon className="w-5 h-5 text-indigo-400 group-hover:text-purple-400 transition-colors" />
                      <span>{item.title}</span>
                      <ArrowUpTrayIcon className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
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
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-4xl font-bold text-white mb-3">
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Attendance Monitoring
                </span>
              </h2>
              <p className="text-gray-400 text-lg">
                Track your attendance and view detailed reports.
              </p>
            </div>
            <button className="p-3 bg-indigo-500/20 rounded-xl hover:bg-indigo-500/30 transition-colors">
              <PrinterIcon className="w-6 h-6 text-indigo-400" />
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Present', value: attendanceStats.present, color: 'indigo', Icon: CheckCircleIcon },
            { label: 'Absent', value: attendanceStats.absent, color: 'red', Icon: XCircleIcon },
            { label: 'Late', value: attendanceStats.late, color: 'amber', Icon: ClockIcon },
            { label: 'Overall', value: `${attendanceStats.overallPercentage}%`, color: 'green', Icon: ChartBarIcon },
          ].map((stat, index) => (
            <div
              key={index}
              className={`bg-gray-800/50 p-6 rounded-xl border border-${stat.color}-500/20 hover:border-${stat.color}-400/50 transition-all`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className={`text-3xl font-bold text-${stat.color}-400`}>{stat.value}</p>
                </div>
                <stat.Icon className={`w-12 h-12 text-${stat.color}-500/20`} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Monthly Attendance Overview</h3>
            <div className="h-80">
              <Bar
                data={{
                  labels: monthlyData.labels,
                  datasets: [
                    { label: 'Present', data: monthlyData.present, backgroundColor: '#4f46e5' },
                    { label: 'Absent', data: monthlyData.absent, backgroundColor: '#ef4444' },
                    { label: 'Late', data: monthlyData.late, backgroundColor: '#f59e0b' },
                  ],
                }}
                options={barChartOptions}
              />
            </div>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Attendance Distribution</h3>
            <div className="h-80">
              <Doughnut
                data={chartData}
                options={{
                  plugins: {
                    legend: { position: 'bottom' },
                    tooltip: { enabled: true },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
          <div className="p-6 border-b border-gray-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-lg font-semibold text-white">Daily Records</h3>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search records..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-700/50 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-gray-700/50 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Time</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Trend</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {dailyAttendance.map((record) => (
                  <>
                    <tr
                      key={record.id}
                      className="hover:bg-gray-700/30 transition-colors cursor-pointer"
                      onClick={() => setExpandedRow(expandedRow === record.id ? null : record.id)}
                    >
                      <td className="px-6 py-4 text-sm text-white">{record.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(record.status)}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{record.time || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="w-32 h-2 bg-gray-700/50 rounded-full">
                          <div
                            className="h-full bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full"
                            style={{ width: `${(record.trend[record.trend.length - 1] / 100) * 100}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                          {expandedRow === record.id ? '▲' : '▼'}
                        </button>
                      </td>
                    </tr>
                    {expandedRow === record.id && (
                      <tr className="bg-gray-900/30">
                        <td colSpan="5" className="px-6 py-4">
                          <div className="flex gap-8">
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-white mb-2">Attendance Trend</h4>
                              <div className="h-32">
                                <Line
                                  data={trendData(record.trend)}
                                  options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AttendanceMonitoring;