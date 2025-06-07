import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardDocumentIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  FunnelIcon,
  ArrowPathIcon,
  VideoCameraIcon,
  LightBulbIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  MegaphoneIcon,
  PrinterIcon,
  UsersIcon,
  FolderIcon,
  EnvelopeIcon,
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  Bars3Icon,
  EllipsisVerticalIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, orderBy, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

// Menu items for the sidebar
const educatorMenu = [
  { title: 'Dashboard', Icon: ChartBarIcon, link: '/dashboard' },
  { title: 'Attendance', Icon: ClipboardDocumentIcon, link: '/attendance' },
  { title: 'Students', Icon: UserGroupIcon, link: '/students' },
  { title: 'Schedule', Icon: CalendarIcon, link: '/schedule' },
  { title: 'Resources', Icon: DocumentTextIcon, link: '/resources' },
  { title: 'Live Classes', Icon: VideoCameraIcon, link: '/live-classes' },
  { title: 'Assignments', Icon: LightBulbIcon, link: '/assignments' },
  { title: 'AI Tutor', Icon: SparklesIcon, link: '/ai-tutor' },
  { title: 'Chat', Icon: ChatBubbleLeftRightIcon, link: '/chat' },
  { title: 'Courses', Icon: AcademicCapIcon, link: '/courses' },
  { title: 'Announcements', Icon: MegaphoneIcon, link: '/announcements' }
];

const AttendanceTracking = () => {
  // State management
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBatchSelector, setShowBatchSelector] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', rollNo: '', email: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [batches, setBatches] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showAttendanceHistory, setShowAttendanceHistory] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Handle window resize
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

  // Fetch students and organize by batch
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const studentsRef = collection(db, 'students');
        const q = query(studentsRef, orderBy('name'));
        const querySnapshot = await getDocs(q);
        
        const studentsData = [];
        const batchesSet = new Set();
        
        querySnapshot.forEach((doc) => {
          const studentData = doc.data();
          studentsData.push({
            id: doc.id,
            name: studentData.name || 'Unnamed Student',
            email: studentData.email || '',
            avatar: studentData.avatar || '',
            batch: studentData.batch || 'Unassigned',
            year: studentData.year || '',
            rollNo: studentData.rollNo || '',
            ...studentData
          });
          if (studentData.batch) {
            batchesSet.add(studentData.batch);
          }
        });

        setStudents(studentsData);
        setBatches(Array.from(batchesSet));
        
        if (batchesSet.size > 0 && !selectedBatch) {
          setSelectedBatch(Array.from(batchesSet)[0]);
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to fetch students. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Fetch attendance records
  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      if (!selectedBatch || !selectedDate) return;

      try {
        setLoading(true);
        const attendanceRef = collection(db, 'attendance');
        const q = query(
          attendanceRef,
          where('batch', '==', selectedBatch),
          where('date', '==', selectedDate)
        );
        const querySnapshot = await getDocs(q);
        
        const records = [];
        querySnapshot.forEach((doc) => {
          records.push({ id: doc.id, ...doc.data() });
        });
        
        setAttendanceRecords(records);
      } catch (err) {
        console.error('Error fetching attendance records:', err);
        setError('Failed to fetch attendance records. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceRecords();
  }, [selectedBatch, selectedDate]);

  // Handle attendance change
  const handleAttendanceChange = async (studentId, isPresent) => {
    try {
      setSaving(true);
      const attendanceRef = collection(db, 'attendance');
      const q = query(
        attendanceRef,
        where('studentId', '==', studentId),
        where('date', '==', selectedDate)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Create new attendance record
        await addDoc(attendanceRef, {
          studentId,
          batch: selectedBatch,
          date: selectedDate,
          isPresent,
          createdAt: serverTimestamp()
        });
      } else {
        // Update existing record
        const docRef = doc(db, 'attendance', querySnapshot.docs[0].id);
        await updateDoc(docRef, { isPresent });
      }

      // Update local state
      setAttendanceRecords(prev => {
        const existing = prev.find(r => r.studentId === studentId);
        if (existing) {
          return prev.map(r => 
            r.studentId === studentId ? { ...r, isPresent } : r
          );
        }
        return [...prev, { studentId, isPresent, date: selectedDate }];
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Error updating attendance:', err);
      setError('Failed to update attendance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle student selection
  const handleStudentSelect = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Handle view history
  const handleViewHistory = (student) => {
    setSelectedStudent(student);
    setShowAttendanceHistory(true);
  };

  // Handle bulk actions
  const handleBulkAction = (action) => {
    switch (action) {
      case 'markPresent':
        selectedStudents.forEach(studentId => {
          handleAttendanceChange(studentId, true);
        });
        break;
      case 'markAbsent':
        selectedStudents.forEach(studentId => {
          handleAttendanceChange(studentId, false);
        });
        break;
      case 'export':
        // Implement export functionality
        break;
      case 'notify':
        // Implement notification functionality
        break;
    }
    setSelectedStudents([]);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Error state
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
              {educatorMenu.map((item, index) => (
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
            <Bars3Icon className="w-6 h-6 text-white" />
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
                  Attendance Tracker
                </span>
              </h1>
              <p className="text-gray-400 text-sm lg:text-lg">
                Monitor and manage student attendance across all batches
              </p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowAddStudentModal(true)}
                className="flex items-center gap-2 px-4 py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 rounded-lg transition-all text-sm lg:text-base"
              >
                <PlusIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="hidden sm:inline">Add Student</span>
              </button>
            </div>
          </div>
        </header>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Batch Selector */}
          <div className="relative">
            <button 
              onClick={() => setShowBatchSelector(!showBatchSelector)}
              className="w-full flex items-center justify-between bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 lg:px-4 lg:py-3 hover:bg-gray-700/30 transition-colors text-sm lg:text-base"
            >
              <div className="flex items-center gap-2">
                <UserGroupIcon className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
                <span className="truncate">{selectedBatch}</span>
              </div>
              {showBatchSelector ? (
                <ChevronUpIcon className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
              )}
            </button>
            {showBatchSelector && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-10 mt-2 w-full bg-gray-800 border border-gray-700/50 rounded-lg shadow-lg text-sm lg:text-base"
              >
                {batches.map(batch => (
                  <button
                    key={batch}
                    onClick={() => {
                      setSelectedBatch(batch);
                      setShowBatchSelector(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-700/50 transition-colors ${
                      selectedBatch === batch ? 'text-blue-400' : 'text-gray-300'
                    }`}
                  >
                    {batch}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 lg:px-4 lg:py-3 text-sm lg:text-base">
            <CalendarIcon className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent outline-none w-full"
            />
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 lg:px-4 lg:py-3 sm:col-span-2 lg:col-span-2 text-sm lg:text-base">
            <MagnifyingGlassIcon className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
            <input
              type="text"
              placeholder="Search students..."
              className="bg-transparent outline-none w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Attendance Table */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 lg:p-6 overflow-x-auto">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h3 className="text-lg lg:text-xl font-semibold text-white flex items-center gap-2">
                  <ClipboardDocumentIcon className="w-5 h-5 lg:w-6 lg:h-6 text-purple-400" />
                  {selectedBatch} Attendance
                </h3>
                <div className="flex gap-2">
                  <button className="p-1.5 lg:p-2 hover:bg-gray-700/50 rounded-lg">
                    <PrinterIcon className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
                  </button>
                  <button className="p-1.5 lg:p-2 hover:bg-gray-700/50 rounded-lg">
                    <EnvelopeIcon className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
                  </button>
                  <button className="p-1.5 lg:p-2 hover:bg-gray-700/50 rounded-lg">
                    <EllipsisVerticalIcon className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="min-w-[600px] lg:min-w-0">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-700/50 text-sm lg:text-base">
                      <th className="pb-3 pl-2">
                        <input
                          type="checkbox"
                          checked={selectedStudents.length === students.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents(students.map(s => s.id));
                            } else {
                              setSelectedStudents([]);
                            }
                          }}
                          className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                        />
                      </th>
                      <th className="pb-3">Roll No</th>
                      <th className="pb-3">Student</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Overall</th>
                      <th className="pb-3 pr-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students
                      .filter(student => student.batch === selectedBatch)
                      .filter(student => 
                        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        student.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(student => {
                        const attendanceRecord = attendanceRecords.find(r => r.studentId === student.id);
                        const isPresent = attendanceRecord?.isPresent ?? false;
                        
                        return (
                          <tr key={student.id} className="border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors text-sm lg:text-base">
                            <td className="py-3 pl-2">
                              <input
                                type="checkbox"
                                checked={selectedStudents.includes(student.id)}
                                onChange={() => handleStudentSelect(student.id)}
                                className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                              />
                            </td>
                            <td className="py-3 pl-2 text-blue-400 font-medium">{student.rollNo}</td>
                            <td className="py-3">
                              <div className="flex items-center gap-2 lg:gap-3">
                                <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                  {student.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-white">{student.name}</p>
                                  <p className="text-xs text-gray-400 truncate max-w-[120px] lg:max-w-none">{student.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                isPresent 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {isPresent ? 'present' : 'absent'}
                              </span>
                            </td>
                            <td className="py-3">
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full" 
                                  style={{ width: `${isPresent ? 100 : 0}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-400 mt-1">{isPresent ? '100%' : '0%'}</p>
                            </td>
                            <td className="py-3 pr-2">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAttendanceChange(student.id, !isPresent)}
                                  className={`px-2 py-1 rounded-lg text-xs ${
                                    isPresent 
                                      ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                                      : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                                  }`}
                                >
                                  {isPresent ? 'Mark Absent' : 'Mark Present'}
                                </button>
                                <button
                                  onClick={() => handleViewHistory(student)}
                                  className="px-2 py-1 rounded-lg text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400"
                                >
                                  History
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Analytics Sidebar */}
          <div className="space-y-6 lg:space-y-8">
            {/* Today's Attendance Pie Chart */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-semibold text-white mb-3 lg:mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 lg:w-6 lg:h-6 text-green-400" />
                Today's Attendance
              </h3>
              <div className="flex items-center justify-center">
                <PieChart width={200} height={200} className="lg:w-[240px] lg:h-[240px]">
                  <Pie
                    data={[
                      { name: 'Present', value: students.filter(s => attendanceRecords.find(r => r.studentId === s.id)?.isPresent).length },
                      { name: 'Absent', value: students.filter(s => !attendanceRecords.find(r => r.studentId === s.id)?.isPresent).length }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                    itemStyle={{ color: '#e5e7eb' }}
                  />
                </PieChart>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-semibold text-white mb-3 lg:mb-4 flex items-center gap-2">
                <BellIcon className="w-5 h-5 lg:w-6 lg:h-6 text-purple-400" />
                Quick Actions
              </h3>
              <div className="space-y-2 lg:space-y-3">
                <button 
                  onClick={() => handleBulkAction('notify')}
                  className="w-full flex items-center gap-2 lg:gap-3 p-2 lg:p-3 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors text-sm lg:text-base"
                >
                  <EnvelopeIcon className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
                  <span>Notify Absentees</span>
                </button>
                <button 
                  onClick={() => handleBulkAction('export')}
                  className="w-full flex items-center gap-2 lg:gap-3 p-2 lg:p-3 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors text-sm lg:text-base"
                >
                  <DocumentTextIcon className="w-4 h-4 lg:w-5 lg:h-5 text-purple-400" />
                  <span>Generate Report</span>
                </button>
                <button className="w-full flex items-center gap-2 lg:gap-3 p-2 lg:p-3 bg-green-600/20 hover:bg-green-600/30 rounded-lg transition-colors text-sm lg:text-base">
                  <UserGroupIcon className="w-4 h-4 lg:w-5 lg:h-5 text-green-400" />
                  <span>View All Batches</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 lg:p-8 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddStudentModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            
            <h3 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Add New Student
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              // Implement add student functionality
              setShowAddStudentModal(false);
            }} className="space-y-4 lg:space-y-6">
              <div className="space-y-2">
                <label className="block text-gray-300 text-sm lg:text-base">Full Name</label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 lg:py-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm lg:text-base"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-2">
                  <label className="block text-gray-300 text-sm lg:text-base">Roll Number</label>
                  <input
                    type="text"
                    value={newStudent.rollNo}
                    onChange={(e) => setNewStudent({...newStudent, rollNo: e.target.value})}
                    className="w-full bg-gray-700 rounded-lg px-4 py-2 lg:py-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm lg:text-base"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-gray-300 text-sm lg:text-base">Batch</label>
                  <select
                    className="w-full bg-gray-700 rounded-lg px-4 py-2 lg:py-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm lg:text-base"
                    disabled
                  >
                    <option>{selectedBatch}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-gray-300 text-sm lg:text-base">Email Address</label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 lg:py-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm lg:text-base"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 lg:gap-4 mt-6 lg:mt-8">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-1.5 lg:px-6 lg:py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-sm lg:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 lg:px-6 lg:py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 transition-all flex items-center gap-1 lg:gap-2 text-sm lg:text-base"
                >
                  <PlusIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTracking;