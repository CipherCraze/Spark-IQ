import { useState } from 'react';
import { Link } from 'react-router';
import {
  ChartBarIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon,
  ChevronLeftIcon,
  Bars3Icon,
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  CalendarIcon,
  StarIcon,
  PrinterIcon,
  ArrowTrendingUpIcon,
    FolderIcon,
} from '@heroicons/react/24/outline';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';

ChartJS.register(...registerables);

const GradingAccess = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('Fall 2024');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  // Sample data
  const gradesData = [
    {
      id: 1,
      course: 'Mathematics',
      grade: 'A',
      score: 95,
      credits: 4,
      feedback: 'Excellent performance! Keep it up.',
      trend: [85, 88, 92, 95],
    },
    {
      id: 2,
      course: 'Physics',
      grade: 'B+',
      score: 87,
      credits: 3,
      feedback: 'Good work, but room for improvement in practicals.',
      trend: [78, 82, 85, 87],
    },
    {
      id: 3,
      course: 'Chemistry',
      grade: 'A-',
      score: 90,
      credits: 3,
      feedback: 'Great understanding of concepts.',
      trend: [82, 85, 88, 90],
    },
  ];

  const overallStats = {
    gpa: 8.9,
    totalCredits: 10,
    coursesCompleted: 3,
    averageScore: 90.7,
    maxGPA: 10.0,
  };

  // Chart data with fixed dimensions
  const chartData = {
    labels: gradesData.map((course) => course.course),
    datasets: [
      {
        label: 'Scores',
        data: gradesData.map((course) => course.score),
        backgroundColor: '#4f46e5',
        hoverBackgroundColor: '#4338ca',
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const trendData = (trend) => ({
    labels: ['Quiz 1', 'Midterm', 'Quiz 2', 'Final'],
    datasets: [
      {
        label: 'Progress',
        data: trend,
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  });

  const doughnutData = {
    labels: ['A', 'B+', 'A-'],
    datasets: [
      {
        data: [1, 1, 1],
        backgroundColor: ['#4f46e5', '#6366f1', '#818cf8'],
        hoverBackgroundColor: ['#4338ca', '#4f46e5', '#6366f1'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      y: { 
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.1)' },
        ticks: { color: '#9CA3AF' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9CA3AF' }
      },
    },
  };

  const getGradeColor = (grade) => {
    switch(grade[0]) {
      case 'A': return 'bg-green-500/20 text-green-400';
      case 'B': return 'bg-yellow-500/20 text-yellow-400';
      case 'C': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-red-500/20 text-red-400';
    }
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
                                { title: 'Resources', link: '/resource-utilization', Icon: FolderIcon },
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
      <main className={`flex-1 p-8 overflow-y-auto relative transition-margin duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-4xl font-bold text-white mb-3">
                <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Academic Transcript
                </span>
              </h2>
              <p className="text-gray-400 text-lg">
                Comprehensive overview of your academic performance
              </p>
            </div>
            <button className="p-3 bg-indigo-500/20 rounded-xl hover:bg-indigo-500/30 transition-colors">
              <PrinterIcon className="w-6 h-6 text-indigo-400" />
            </button>
          </div>
        </header>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { 
              label: 'CGPA', 
              value: overallStats.gpa, 
              max: overallStats.maxGPA, 
              color: 'from-purple-500 to-indigo-500',
              Icon: StarIcon 
            },
            { 
              label: 'Credits Earned', 
              value: overallStats.totalCredits, 
              max: 120, 
              color: 'from-blue-500 to-cyan-500',
              Icon: AcademicCapIcon 
            },
            { 
              label: 'Courses Completed', 
              value: overallStats.coursesCompleted, 
              color: 'from-green-500 to-emerald-500',
              Icon: BookOpenIcon 
            },
            { 
              label: 'Average Score', 
              value: overallStats.averageScore, 
              color: 'from-pink-500 to-rose-500',
              Icon: ChartBarIcon 
            },
          ].map((stat, index) => (
            <div key={index} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:border-indigo-400/30 transition-all">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">
                    {stat.value}{stat.max && `/${stat.max}`}
                  </p>
                </div>
              </div>
              {stat.max && (
                <div className="mt-4">
                  <div className="h-2 bg-gray-700/50 rounded-full">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full transition-all duration-500"
                      style={{ width: `${(stat.value/stat.max)*100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Performance Overview</h3>
              <div className="flex gap-2">
                <button className="text-sm text-gray-400 hover:text-white">Scores</button>
                <button className="text-sm text-gray-400 hover:text-white">Trend</button>
              </div>
            </div>
            <div className="h-80">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
          
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Grade Distribution</h3>
            <div className="h-80">
              <Doughnut 
                data={doughnutData} 
                options={{
                  ...chartOptions,
                  plugins: { legend: { position: 'bottom' } }
                }} 
              />
            </div>
          </div>
        </div>

        {/* Interactive Grades Table */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
          <div className="p-6 border-b border-gray-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-lg font-semibold text-white">Course Details</h3>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-700/50 rounded-lg text-white placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="bg-gray-700/50 rounded-lg px-4 py-2 text-white"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                {['Fall 2024', 'Spring 2024', 'Summer 2024'].map(sem => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Course</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Grade</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Progress</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Credits</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {gradesData.map((course) => (
                  <>
                    <tr 
                      key={course.id} 
                      className="hover:bg-gray-700/30 transition-colors cursor-pointer"
                      onClick={() => setExpandedRow(expandedRow === course.id ? null : course.id)}
                    >
                      <td className="px-6 py-4 text-sm text-white">{course.course}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getGradeColor(course.grade)}`}>
                          {course.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-32 h-2 bg-gray-700/50 rounded-full">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full"
                            style={{ width: `${(course.score/100)*100}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white">{course.credits}</td>
                      <td className="px-6 py-4">
                        <button className="text-indigo-400 hover:text-indigo-300">
                          {expandedRow === course.id ? '▲' : '▼'}
                        </button>
                      </td>
                    </tr>
                    {expandedRow === course.id && (
                      <tr className="bg-gray-900/30">
                        <td colSpan="5" className="px-6 py-4">
                          <div className="flex gap-8">
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-white mb-2">Feedback</h4>
                              <p className="text-sm text-gray-400">{course.feedback}</p>
                            </div>
                            <div className="w-64">
                              <h4 className="text-sm font-semibold text-white mb-2">Score Trend</h4>
                              <div className="h-32">
                                <Line 
                                  data={trendData(course.trend)} 
                                  options={{
                                    ...chartOptions,
                                    plugins: { legend: { display: false } }
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

export default GradingAccess;