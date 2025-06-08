
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { useMediaQuery } from 'react-responsive';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  SparklesIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  PresentationChartLineIcon,
  DocumentMagnifyingGlassIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentIcon,
  Bars3Icon,
  ChartBarIcon,
  FolderIcon,
  PrinterIcon,
  ArrowTrendingUpIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  LightBulbIcon,
  NewspaperIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

ChartJS.register(...registerables);

const studentMenu = [
  { title: 'Dashboard', Icon: HomeIcon, link: '/dashboard', description: "Overview of your progress." },
  { title: 'My Resources', Icon: FolderIcon, link: '/resource-utilization', description: "Access course materials." },
  { title: 'Tests', Icon: ClipboardDocumentIcon, link: '/student-tests', description: "Take and view your test results." },
  { title: 'Attendance', Icon: ChartBarIcon, link: '/attendance-monitoring', description: "Track your attendance." },
  { title: 'Assignments', Icon: DocumentTextIcon, link: '/assignment-submission', description: "View & submit assignments." },
  { title: 'Grades & Feedback', Icon: PresentationChartLineIcon, link: '/GradesAndFeedback', description: "Check your grades." },
  { title: 'Voice Chat', Icon: ChatBubbleLeftRightIcon, link: '/voice-chat', description: "Discuss with peers." },
  { title: 'Ask Sparky', Icon: QuestionMarkCircleIcon, link: '/chatbot-access', description: "Your AI study assistant." },
  { title: 'AI Questions', Icon: LightBulbIcon, link: '/ai-generated-questions', description: "Practice with AI questions." },
  { title: 'Educational News', Icon: NewspaperIcon, link: '/educational-news', description: "Latest in education." },
  { title: 'Smart Review', Icon: WrenchScrewdriverIcon, link: '/smart-review', description: "Enhance your writing." },
  { title: 'Virtual Meetings', Icon: VideoCameraIcon, link: '/meeting-participation', description: "Join online classes." },
  { title: 'My Inbox', Icon: EnvelopeIcon, link: '/inbox-for-suggestions', description: "Messages & suggestions." },
  { title: 'Upgrade to Pro', Icon: SparklesIcon, link: '/pricing', special: true, description: "Unlock premium features." },
];

const AttendanceMonitoring = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [fetchedData, setFetchedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isDesktop = useMediaQuery({ minWidth: 768 });
  const location = useLocation();

  const initialSampleData = {
    monthlyData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      present: [0, 0, 0, 0, 0, 0],
      absent: [0, 0, 0, 0, 0, 0],
      late: [0, 0, 0, 0, 0, 0],
    },
    attendanceStats: {
      present: 0,
      absent: 0,
      late: 0,
      overallPercentage: 0,
    },
    dailyAttendance: [],
  };

  useEffect(() => {
    if (isDesktop) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  }, [isDesktop]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchData(user.uid);
      } else {
        setCurrentUser(null);
        setFetchedData(null);
        setLoading(false);
        setError("Please log in to view your attendance.");
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async (studentId) => {
    setLoading(true);
    setError(null);
    try {
      const attendanceRef = collection(db, 'attendance');
      const q = query(
        attendanceRef,
        where('studentId', '==', studentId),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const processedMonthly = processMonthlyData(records);
      const processedStats = processStats(records);
      const processedDaily = processDailyRecords(records);

      setFetchedData({
        monthlyData: processedMonthly,
        attendanceStats: processedStats,
        dailyAttendance: processedDaily,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch attendance data. Please try again.");
      setFetchedData(initialSampleData);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyData = (records) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyAggregates = {};
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyAggregates[monthKey] = { present: 0, absent: 0, late: 0, label: monthNames[d.getMonth()] };
    }
    
    records.forEach(record => {
      if (record.date) {
        const recordDate = new Date(record.date + "T00:00:00");
        const monthKey = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (monthlyAggregates[monthKey]) {
          if (record.isPresent) {
            monthlyAggregates[monthKey].present += 1;
          } else if (record.isLate) {
            monthlyAggregates[monthKey].late += 1;
          } else {
            monthlyAggregates[monthKey].absent += 1;
          }
        }
      }
    });

    const labels = Object.values(monthlyAggregates).map(m => m.label);
    const present = Object.values(monthlyAggregates).map(m => m.present);
    const absent = Object.values(monthlyAggregates).map(m => m.absent);
    const late = Object.values(monthlyAggregates).map(m => m.late);

    return { labels, present, absent, late };
  };

  const processStats = (records) => {
    let present = 0;
    let absent = 0;
    let late = 0;
    
    records.forEach(record => {
      if (record.isPresent) present++;
      else if (record.isLate) late++;
      else absent++;
    });
    
    const totalRecorded = present + absent + late;
    const overallPercentage = totalRecorded > 0 ? parseFloat(((present + late * 0.5) / totalRecorded * 100).toFixed(1)) : 0;
    
    return { present, absent, late, overallPercentage };
  };

  const processDailyRecords = (records) => {
    return records.slice(0, 30).map(record => {
      let status = 'absent';
      if (record.isPresent) status = 'present';
      if (record.isLate) status = 'late';

      return {
        id: record.id,
        date: record.date,
        status: status,
        time: record.checkInTime || null,
        trend: [70, 75, 80, record.isPresent ? 90 : (record.isLate ? 60 : 40)],
      };
    });
  };

  const dataToUse = fetchedData || initialSampleData;

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
      y: { ...commonChartOptions.scales.y, display: false },
      x: { ...commonChartOptions.scales.x, display: false },
    },
  };

  const doughnutChartAPIData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [
      {
        data: [dataToUse.attendanceStats.present, dataToUse.attendanceStats.absent, dataToUse.attendanceStats.late],
        backgroundColor: ['#4f46e5', '#ef4444', '#f59e0b'],
        hoverBackgroundColor: ['#4338ca', '#dc2626', '#d97706'],
        borderColor: '#374151',
        borderWidth: 2,
      },
    ],
  };

  const trendDataForChart = (trendArray) => ({
    labels: ['W1', 'W2', 'W3', 'W4'],
    datasets: [
      {
        label: 'Attendance Trend',
        data: trendArray,
        borderColor: '#6366f1',
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
    { label: 'Present', value: dataToUse.attendanceStats.present, color: 'indigo', Icon: CheckCircleIcon },
    { label: 'Absent', value: dataToUse.attendanceStats.absent, color: 'red', Icon: XCircleIcon },
    { label: 'Late', value: dataToUse.attendanceStats.late, color: 'amber', Icon: ClockIcon },
    { label: 'Overall', value: `${dataToUse.attendanceStats.overallPercentage}%`, color: 'green', Icon: ArrowTrendingUpIcon },
  ];

  const filteredDailyAttendance = dataToUse.dailyAttendance.filter(record => 
    (filter === 'all' || record.status === filter) &&
    (record.date.toLowerCase().includes(searchQuery.toLowerCase()) || record.status.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading && !fetchedData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <SparklesIcon className="w-8 h-8 animate-spin mr-3 text-indigo-400" />
        Loading your attendance data...
      </div>
    );
  }

  if (error && !fetchedData) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-center p-4">
        <XCircleIcon className="w-16 h-16 text-red-400 mb-4" />
        <p className="text-xl text-red-400 mb-2">Error Loading Data</p>
        <p className="text-gray-400">{error}</p>
        <button 
          onClick={() => currentUser && fetchData(currentUser.uid)} 
          className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex text-gray-200">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside 
            key="sidebar"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.3 }}
            className={`fixed top-0 left-0 h-full w-64 bg-gray-800/80 backdrop-blur-xl border-r border-gray-700/60 shadow-2xl z-50 flex flex-col md:h-screen md:z-40 md:fixed md:translate-x-0`}
          >
            <div className="p-5 flex items-center gap-3.5 border-b border-gray-700/60 relative">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
                <SparklesIcon className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">SPARK-IQ</h1>
              {!isDesktop && (
                <button onClick={() => setIsSidebarOpen(false)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/50 transition-colors">
                  <XMarkIcon className="w-5 h-5"/>
                </button>
              )}
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 scrollbar-track-gray-800/50 scrollbar-thumb-rounded-md">
              {studentMenu.map(item => {
                const isActive = location.pathname === item.link;
                return (
                  <Link key={item.title} to={item.link} onClick={() => !isDesktop && setIsSidebarOpen(false)}
                        className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-gray-300 transition-all group
                                  ${isActive ? 'bg-indigo-500/30 text-indigo-200 font-semibold shadow-inner' : 'hover:bg-indigo-500/10 hover:text-indigo-300'}
                                  ${item.special ? `mt-auto mb-1 bg-gradient-to-r from-purple-600/90 to-indigo-600/90 !text-white shadow-md hover:shadow-lg hover:opacity-90 ${isActive ? 'ring-2 ring-purple-400' : ''}` : ''}`}>
                    <item.Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-300' : 'text-indigo-400'} group-hover:scale-110 transition-transform`} />
                    <span className="text-sm font-medium">{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
      {isSidebarOpen && !isDesktop && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      <main className={`flex-1 p-6 sm:p-8 overflow-y-auto relative transition-margin duration-300 ease-in-out md:ml-64`}>
        {!isDesktop && (
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
            {error && <div className="mt-2 text-sm text-red-400 bg-red-900/30 p-2 rounded-md">{error}</div>}
            <button className="mt-4 sm:mt-0 p-2.5 bg-gray-800 border border-gray-700 rounded-lg hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300 group"
                title="Print Attendance Report"
                onClick={() => window.print()}
            >
              <PrinterIcon className="w-5 h-5 text-gray-400 group-hover:text-indigo-400 transition-colors" />
            </button>
          </div>
        </header>

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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-10">
          <div className="lg:col-span-3 bg-gray-800 p-6 rounded-xl border border-gray-700/80 shadow-lg hover:shadow-indigo-500/10 transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-gray-100 mb-1">Monthly Overview</h3>
            <p className="text-sm text-gray-400 mb-4">Presence, absence, and late arrivals over the last 6 months.</p>
            <div className="h-80">
              {dataToUse.monthlyData.labels.length > 0 ? (
                <Bar
                    data={{
                    labels: dataToUse.monthlyData.labels,
                    datasets: [
                        { label: 'Present', data: dataToUse.monthlyData.present, backgroundColor: '#4f46e5', borderRadius: 4 },
                        { label: 'Absent', data: dataToUse.monthlyData.absent, backgroundColor: '#ef4444', borderRadius: 4 },
                        { label: 'Late', data: dataToUse.monthlyData.late, backgroundColor: '#f59e0b', borderRadius: 4 },
                    ],
                    }}
                    options={barChartOptions}
                />
              ) : <p className="text-center text-gray-500 pt-20">Not enough data for monthly overview.</p>}
            </div>
          </div>

          <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl border border-gray-700/80 shadow-lg hover:shadow-purple-500/10 transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-gray-100 mb-1">Overall Distribution</h3>
            <p className="text-sm text-gray-400 mb-4">Proportion of attendance statuses.</p>
            <div className="h-80 flex items-center justify-center">
              {(dataToUse.attendanceStats.present + dataToUse.attendanceStats.absent + dataToUse.attendanceStats.late > 0) ? (
                <Doughnut data={doughnutChartAPIData} options={doughnutChartOptions} />
              ) : <p className="text-center text-gray-500">No attendance data available for distribution chart.</p>}
            </div>
          </div>
        </div>

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
                  placeholder="Search by date or status..."
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
                  {['Date', 'Status', 'Time', 'Recent Trend', 'Details'].map(header => (
                     <th key={header} className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {header}
                     </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/70">
                {filteredDailyAttendance.map((record) => (
                  <React.Fragment key={record.id}>
                    <tr className="hover:bg-gray-700/40 transition-colors duration-150">
                      <td className="px-5 py-4 text-sm text-gray-200 whitespace-nowrap">{new Date(record.date + "T00:00:00").toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusPillClasses(record.status)}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-400 whitespace-nowrap">{record.time || 'N/A'}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="w-28 h-1.5 bg-gray-700 rounded-full overflow-hidden inline-block align-middle">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${record.trend[record.trend.length - 1]}%` }}
                          />
                        </div>
                         <span className="text-xs text-gray-500 ml-2 align-middle">{record.trend[record.trend.length - 1]}%</span>
                      </td>
                      <td className="px-5 py-4 text-sm whitespace-nowrap">
                        <button 
                          onClick={() => setExpandedRow(expandedRow === record.id ? null : record.id)}
                          className="p-1.5 rounded-md hover:bg-gray-600/50 text-indigo-400 hover:text-indigo-300 transition-colors"
                          title={expandedRow === record.id ? "Collapse details" : "Expand details"}
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
                            <h4 className="text-sm font-semibold text-gray-100 mb-3">4-Week Attendance Trend (Sample)</h4>
                            <div className="h-40">
                              <Line data={trendDataForChart(record.trend)} options={trendLineChartOptions} />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">More detailed information for {record.date} could be shown here.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
             {filteredDailyAttendance.length === 0 && (
                <div className="text-center py-12">
                    <DocumentMagnifyingGlassIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No records found.</p>
                    <p className="text-gray-600 text-sm">Try adjusting your search or filter, or check back later.</p>
                </div>
             )}
          </div>
        </div>
        <footer className="mt-12 text-center text-sm text-gray-500">
            Spark-IQ Attendance Module © {new Date().getFullYear()}
        </footer>
      </main>

      <style>{`
        .styled-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .styled-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.5);
          border-radius: 10px;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.7);
          border-radius: 10px;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.9);
        }
        .styled-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(107, 114, 128, 0.7) rgba(55, 65, 81, 0.5);
        }
      `}</style>
    </div>
  );
};

export default AttendanceMonitoring;