import { useState, useEffect } from 'react';
import {
  ClipboardDocumentIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PrinterIcon,
  ArrowPathIcon,
  Bars3Icon,
  EnvelopeIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  MegaphoneIcon,
  VideoCameraIcon,
  LightBulbIcon,
  SparklesIcon,
  UsersIcon,
  FolderIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const AttendanceTracking = () => {
  const [selectedBatch, setSelectedBatch] = useState('Batch 1');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [showBatchSelector, setShowBatchSelector] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', rollNo: '', email: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile

  const batches = ['Batch 1', 'Batch 2', 'Batch 3', 'Batch 4'];
  const dates = [
    '2023-11-01',
    '2023-11-02',
    '2023-11-03',
    '2023-11-06',
    '2023-11-07',
    '2023-11-08',
  ];

  useEffect(() => {
    const generateData = () => {
      const students = [];
      const studentCount =
        selectedBatch === 'Batch 1'
          ? 25
          : selectedBatch === 'Batch 2'
            ? 30
            : selectedBatch === 'Batch 3'
              ? 22
              : 28;
      for (let i = 1; i <= studentCount; i++) {
        const attendanceRecord = {};
        dates.forEach((date) => {
          attendanceRecord[date] = Math.random() > 0.2 ? 'present' : 'absent';
        });
        students.push({
          id: i,
          name: `Student ${i}`,
          rollNo: `${selectedBatch.slice(-1)}${i.toString().padStart(2, '0')}`,
          email: `student${i}@example.com`,
          overallAttendance: Math.floor(Math.random() * 30) + 70,
          ...attendanceRecord,
        });
      }
      setAttendanceData(students);
    };
    generateData();
  }, [selectedBatch]);

  const attendanceStats = [
    { name: 'Present', value: attendanceData.filter((s) => s[selectedDate] === 'present').length },
    { name: 'Absent', value: attendanceData.filter((s) => s[selectedDate] === 'absent').length },
  ];

  const monthlyTrendData = [
    { name: 'Week 1', present: 85, absent: 15 },
    { name: 'Week 2', present: 78, absent: 22 },
    { name: 'Week 3', present: 92, absent: 8 },
    { name: 'Week 4', present: 88, absent: 12 },
  ];

  const COLORS = ['#10b981', '#ef4444'];

  const toggleAttendance = (studentId) => {
    setAttendanceData((prev) =>
      prev.map((student) => {
        if (student.id === studentId) {
          return {
            ...student,
            [selectedDate]: student[selectedDate] === 'present' ? 'absent' : 'present',
          };
        }
        return student;
      })
    );
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    const newStudentData = {
      id: attendanceData.length + 1,
      name: newStudent.name,
      rollNo: newStudent.rollNo,
      email: newStudent.email,
      overallAttendance: 100,
      ...dates.reduce((acc, date) => ({ ...acc, [date]: 'present' }), {}),
    };
    setAttendanceData([...attendanceData, newStudentData]);
    setShowAddStudentModal(false);
    setNewStudent({ name: '', rollNo: '', email: '' });
  };

  const educatorMenu = [
    { title: 'Dashboard', Icon: AcademicCapIcon, link: '/educator-dashboard' },
    { title: 'Assignments', Icon: ClipboardDocumentIcon, link: '/assignment-management' },
    { title: 'Grades', Icon: DocumentTextIcon, link: '/grading-system' },
    { title: 'Resources', Icon: FolderIcon, link: '/resource-management' },
    { title: 'Ask Sparky', Icon: ChatBubbleLeftRightIcon, link: '/chatbot-education' },
    { title: 'Feedback', Icon: LightBulbIcon, link: '/feedback-dashboard' },
    { title: 'Questions', Icon: SparklesIcon, link: '/ai-generated-questions' },
    { title: 'News', Icon: UsersIcon, link: '/educational-news' },
    { title: 'Suggestions', Icon: EnvelopeIcon, link: '/suggestions-to-students' },
    { title: 'Meetings', Icon: VideoCameraIcon, link: '/meeting-host' },
    { title: 'Announcements', Icon: MegaphoneIcon, link: '/announcements' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed inset-y-0 left-0 z-50 w-64 transform bg-gray-800 border-r border-gray-700/50 p-6 transition-transform duration-300 ease-in-out md:relative md:flex md:flex-col`}
      >
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            SPARK IQ
          </h1>
        </div>
        <nav>
          <ul className="space-y-2">
            {educatorMenu.map((item, index) => (
              <li key={index}>
                <a
                  href={item.link}
                  className="flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-all duration-300 group"
                >
                  <item.Icon className="w-5 h-5 text-indigo-400 group-hover:text-purple-400 transition-colors" />
                  <span>{item.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 ml-0 md:ml-64">
        {/* Mobile Header */}
        <header className="mb-6 flex justify-between items-center md:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Bars3Icon className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Attendance Tracker
          </h1>
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="p-2 bg-blue-600 rounded-full"
          >
            <PlusIcon className="w-5 h-5 text-white" />
          </button>
        </header>

        {/* Desktop Header */}
        <div className="hidden md:block">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Attendance Tracker
            </h1>
            <p className="text-gray-400 text-lg">Monitor and manage student attendance across all batches</p>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <button
              onClick={() => setShowBatchSelector(!showBatchSelector)}
              className="w-full flex items-center justify-between bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 hover:bg-gray-700/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-blue-400" />
                <span>{selectedBatch}</span>
              </div>
              {showBatchSelector ? (
                <ChevronUpIcon className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              )}
            </button>
            {showBatchSelector && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-10 mt-2 w-full bg-gray-800 border border-gray-700/50 rounded-lg shadow-lg"
              >
                {batches.map((batch) => (
                  <button
                    key={batch}
                    onClick={() => {
                      setSelectedBatch(batch);
                      setShowBatchSelector(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-700/50 transition-colors ${
                      selectedBatch === batch ? 'text-blue-400' : 'text-gray-300'
                    }`}
                  >
                    {batch}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
          <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3">
            <CalendarIcon className="w-5 h-5 text-blue-400" />
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent outline-none w-full"
            >
              {dates.map((date) => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2 sm:col-span-2 flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3">
            <MagnifyingGlassIcon className="w-5 h-5 text-blue-400" />
            <input
              type="text"
              placeholder="Search students..."
              className="bg-transparent outline-none w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              title: 'Total Students',
              value: attendanceData.length,
              icon: UserGroupIcon,
              trend: '↑5%',
              color: 'blue',
            },
            {
              title: 'Present Today',
              value: attendanceData.filter((s) => s[selectedDate] === 'present').length,
              icon: CheckCircleIcon,
              trend: `${Math.round(
                attendanceData.filter((s) => s[selectedDate] === 'present').length /
                  attendanceData.length *
                  100
              )}%`,
              color: 'green',
            },
            {
              title: 'Absent Today',
              value: attendanceData.filter((s) => s[selectedDate] === 'absent').length,
              icon: XCircleIcon,
              trend: `${Math.round(
                attendanceData.filter((s) => s[selectedDate] === 'absent').length /
                  attendanceData.length *
                  100
              )}%`,
              color: 'red',
            },
            {
              title: 'Avg Attendance',
              value: `${Math.round(
                attendanceData.reduce((acc, student) => acc + student.overallAttendance, 0) /
                  attendanceData.length
              )}%`,
              icon: ChartBarIcon,
              trend: '↑2%',
              color: 'purple',
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-blue-600/20 to-purple-600/10 p-4 rounded-xl border border-blue-500/20 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <span className="text-xs text-blue-400">{stat.trend}</span>
                </div>
                <stat.icon className="w-10 h-10 p-2 rounded-full bg-blue-500/20 text-blue-400" />
              </div>
            </div>
          ))}
        </div>

        {/* Table & Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 overflow-hidden">
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <ClipboardDocumentIcon className="w-5 h-5 text-purple-400" />
                  {selectedBatch} Attendance
                </h3>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-700/50 rounded-lg">
                    <PrinterIcon className="w-5 h-5 text-blue-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-700/50 rounded-lg">
                    <EnvelopeIcon className="w-5 h-5 text-blue-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-700/50 rounded-lg">
                    <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-700/50">
                      <th className="pb-4 pl-2">Roll No</th>
                      <th className="pb-4">Name</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4">Overall %</th>
                      <th className="pb-4 pr-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData
                      .filter(
                        (student) =>
                          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((student) => (
                        <tr
                          key={student.id}
                          className="border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors"
                        >
                          <td className="py-4 pl-2 text-blue-400 font-medium">{student.rollNo}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-white">{student.name}</p>
                                <p className="text-xs text-gray-400">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                student[selectedDate] === 'present'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {student[selectedDate]}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full"
                                style={{ width: `${student.overallAttendance}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{student.overallAttendance}%</p>
                          </td>
                          <td className="py-4 pr-2">
                            <button
                              onClick={() => toggleAttendance(student.id)}
                              className={`px-3 py-1 rounded-lg text-xs ${
                                student[selectedDate] === 'present'
                                  ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                                  : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                              }`}
                            >
                              Mark {student[selectedDate] === 'present' ? 'Absent' : 'Present'}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Analytics Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-green-400" />
                Today's Attendance
              </h3>
              <div className="flex justify-center">
                <PieChart width={240} height={240}>
                  <Pie
                    data={attendanceStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {attendanceStats.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                    itemStyle={{ color: '#e5e7eb' }}
                  />
                </PieChart>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {attendanceStats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-xs text-gray-300">
                      {stat.name}: {stat.value} ({Math.round((stat.value / attendanceData.length) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ArrowPathIcon className="w-5 h-5 text-blue-400" />
                Monthly Trend
              </h3>
              <BarChart width={300} height={200} data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
                <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </div>

            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BellIcon className="w-5 h-5 text-purple-400" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-2 p-3 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors">
                  <EnvelopeIcon className="w-5 h-5 text-blue-400" />
                  <span>Notify Absentees</span>
                </button>
                <button className="w-full flex items-center gap-2 p-3 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors">
                  <DocumentTextIcon className="w-5 h-5 text-purple-400" />
                  <span>Generate Report</span>
                </button>
                <button className="w-full flex items-center gap-2 p-3 bg-green-600/20 hover:bg-green-600/30 rounded-lg transition-colors">
                  <UserGroupIcon className="w-5 h-5 text-green-400" />
                  <span>View All Batches</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Add Student Modal */}
        {showAddStudentModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md relative">
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Add New Student
              </h3>
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-gray-300">Full Name</label>
                  <input
                    type="text"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-gray-300">Roll Number</label>
                    <input
                      type="text"
                      value={newStudent.rollNo}
                      onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                      className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-gray-300">Batch</label>
                    <select
                      className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      disabled
                    >
                      <option>{selectedBatch}</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-gray-300">Email Address</label>
                  <input
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddStudentModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 transition-all flex items-center gap-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Add Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AttendanceTracking;