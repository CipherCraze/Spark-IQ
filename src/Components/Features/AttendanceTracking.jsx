import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardDocumentIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  // FunnelIcon, // Not used in final merged version
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, orderBy, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebaseConfig'; // Ensure this path is correct
import { onAuthStateChanged } from 'firebase/auth';

// Educator menu from the original UI (first file)
const educatorMenu = [
  { title: 'Dashboard', Icon: AcademicCapIcon, link: '/educator-dashboard' },
  { title: 'Assignments', Icon: ClipboardDocumentIcon, link: '/assignment-management' },
  { title: 'Grades', Icon: DocumentTextIcon, link: '/grading-system' },
  { title: 'Resources', Icon: FolderIcon, link: '/resource-management' },
  { title: 'Ask Sparky', Icon: ChatBubbleLeftRightIcon, link: '/chatbot-education' },
  { title: 'Feedback', Icon: LightBulbIcon, link: '/feedback-dashboard' },
  { title: 'Questions', Icon: SparklesIcon, link: '/ai-generated-questions' },
  { title: 'News', Icon: UsersIcon, link: '/educational-news' }, // Original used UsersIcon
  { title: 'Suggestions', Icon: EnvelopeIcon, link: '/suggestions-to-students' },
  { title: 'Meetings', Icon: VideoCameraIcon, link: '/meeting-host' },  
  { title: 'Announcements', Icon: MegaphoneIcon, link: '/announcements' },
  // Adding Attendance to this menu if it's part of the educator's tools
  { title: 'Attendance', Icon: ClipboardDocumentIcon, link: '/attendance-tracking' }, // Assuming this page's link
];


const AttendanceTracking = () => {
  // State management
  const [students, setStudents] = useState([]); // All students fetched
  const [filteredStudents, setFilteredStudents] = useState([]); // Students for selected batch
  const [attendanceRecords, setAttendanceRecords] = useState([]); // Attendance for selected batch & date
  
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showBatchSelector, setShowBatchSelector] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', rollNo: '', email: '' });
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  
  const [batches, setBatches] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false); // For individual attendance save
  // const [saveSuccess, setSaveSuccess] = useState(false); // Optional: for UX feedback

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

  // Firebase Auth listener and initial data fetch
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchStudentsAndBatches();
      } else {
        setStudents([]);
        setBatches([]);
        setFilteredStudents([]);
        setAttendanceRecords([]);
        setSelectedBatch('');
        setLoading(false);
        setError("Please log in to view attendance data.");
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchStudentsAndBatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const studentsRef = collection(db, 'students');
      // TODO: If students are teacher-specific, add a where clause for teacherId
      const q = query(studentsRef, orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      const studentsData = [];
      const batchesSet = new Set();
      
      querySnapshot.forEach((docSnap) => {
        const student = { id: docSnap.id, ...docSnap.data() };
        studentsData.push(student);
        if (student.batch) {
          batchesSet.add(student.batch);
        }
      });

      setStudents(studentsData);
      const sortedBatches = Array.from(batchesSet).sort();
      setBatches(sortedBatches);
      
      if (sortedBatches.length > 0 && !selectedBatch) {
        setSelectedBatch(sortedBatches[0]);
      } else if (sortedBatches.length === 0) {
        setSelectedBatch('');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to fetch students. Please try again.');
    } finally {
      setLoading(false); // Loading for students/batches done here
    }
  };

  // Filter students when selectedBatch or all students change
  useEffect(() => {
    if (selectedBatch) {
      setFilteredStudents(students.filter(s => s.batch === selectedBatch));
    } else {
      setFilteredStudents([]);
    }
  }, [selectedBatch, students]);

  // Fetch attendance records when selectedBatch or selectedDate changes
  useEffect(() => {
    if (!selectedBatch || !selectedDate) {
      setAttendanceRecords([]);
      return;
    }

    const fetchAttendance = async () => {
      setLoading(true); // Consider a more granular loading state if preferred
      setError(null);
      try {
        const attendanceRef = collection(db, 'attendance');
        const q = query(
          attendanceRef,
          where('batch', '==', selectedBatch),
          where('date', '==', selectedDate)
        );
        const querySnapshot = await getDocs(q);
        
        const records = [];
        querySnapshot.forEach((docSnap) => {
          records.push({ id: docSnap.id, ...docSnap.data() });
        });
        setAttendanceRecords(records);
      } catch (err) {
        console.error('Error fetching attendance records:', err);
        setError('Failed to fetch attendance records.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedBatch, selectedDate]);


  // Toggle attendance status (Firebase update)
  const handleAttendanceChange = async (studentId, currentIsPresent) => {
    if (saving) return; // Prevent multiple quick clicks
    setSaving(true);
    const newIsPresent = !currentIsPresent;

    try {
      const attendanceRef = collection(db, 'attendance');
      const q = query(
        attendanceRef,
        where('studentId', '==', studentId),
        where('date', '==', selectedDate),
        where('batch', '==', selectedBatch) // Ensure batch is part of the query
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Create new attendance record
        const newRecordRef = await addDoc(attendanceRef, {
          studentId,
          batch: selectedBatch,
          date: selectedDate,
          isPresent: newIsPresent,
          markedAt: serverTimestamp()
        });
        // Update local state optimistically or after fetch
        setAttendanceRecords(prev => [...prev, { id: newRecordRef.id, studentId, batch: selectedBatch, date: selectedDate, isPresent: newIsPresent }]);
      } else {
        // Update existing record
        const docRef = doc(db, 'attendance', querySnapshot.docs[0].id);
        await updateDoc(docRef, { isPresent: newIsPresent, markedAt: serverTimestamp() });
        // Update local state
        setAttendanceRecords(prev => prev.map(r => 
          r.id === querySnapshot.docs[0].id ? { ...r, isPresent: newIsPresent } : r
        ));
      }
      // setSaveSuccess(true); // Optional UX
      // setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Error updating attendance:', err);
      setError('Failed to update attendance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Add new student (Firebase add)
  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.rollNo || !newStudent.email) {
      setError("All fields are required to add a student.");
      return;
    }
    setLoading(true); // Use a specific loading for modal if preferred
    try {
      await addDoc(collection(db, 'students'), {
        name: newStudent.name,
        rollNo: newStudent.rollNo,
        email: newStudent.email,
        batch: selectedBatch, // Assign to current selected batch
        // Add other default fields if necessary, e.g., year, photoURL: null
        createdAt: serverTimestamp(),
      });
      setShowAddStudentModal(false);
      setNewStudent({ name: '', rollNo: '', email: '' });
      await fetchStudentsAndBatches(); // Re-fetch students to include the new one
    } catch (err) {
      console.error('Error adding student:', err);
      setError('Failed to add student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Derived data for UI
  const studentsToDisplay = filteredStudents.filter(student => 
    student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const presentCount = attendanceRecords.filter(r => r.isPresent).length;
  const absentCount = filteredStudents.length - presentCount; // Assumes all students in batch should have a record or are implicitly absent

  const attendanceStatsPie = [
    { name: 'Present', value: presentCount },
    { name: 'Absent', value: absentCount > 0 ? absentCount : 0 }, // Ensure non-negative
  ];
  const COLORS = ['#10b981', '#ef4444'];

  // Static monthly trend data from original UI
  const monthlyTrendData = [
    { name: 'Week 1', present: 85, absent: 15 },
    { name: 'Week 2', present: 78, absent: 22 },
    { name: 'Week 3', present: 92, absent: 8 },
    { name: 'Week 4', present: 88, absent: 12 },
  ];

  if (loading && students.length === 0) { // Show full page loading only on initial load
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <ArrowPathIcon className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-white text-xl ml-3">Loading Attendance Data...</p>
      </div>
    );
  }
  
  // Removed overallAttendance from students, this was dummy.
  // Stats will be based on current day or need more complex aggregation.

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed top-0 left-0 h-screen w-64 bg-gray-800 border-r border-gray-700/50 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
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
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 group ${
                      // Example active link styling (customize as needed)
                      window.location.pathname === item.link 
                      ? 'bg-gray-700 text-white' 
                      : 'text-gray-300 hover:bg-gray-700/50'
                    }`}
                    onClick={() => isMobile && setSidebarOpen(false)}
                  >
                    <item.Icon className={`w-5 h-5 transition-colors ${
                       window.location.pathname === item.link 
                       ? 'text-purple-400'
                       : 'text-indigo-400 group-hover:text-purple-400'
                    }`} />
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      <main className={`flex-1 p-4 lg:p-8 transition-all duration-300 ${
        !isMobile ? 'ml-64' : ''
      }`}>
        <div className="lg:hidden flex items-center justify-between mb-6">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-gray-800/50 text-white hover:bg-gray-700"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Attendance
          </h1>
          <div className="w-10"></div>
        </div>

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
                className="flex items-center gap-2 px-4 py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 rounded-lg transition-all text-sm lg:text-base"
              >
                <PlusIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="hidden sm:inline">Add Student</span>
              </button>
            </div>
          </div>
        </header>
        
        {error && (
          <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-sm">
            Error: {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="relative">
            <button 
              onClick={() => setShowBatchSelector(!showBatchSelector)}
              className="w-full flex items-center justify-between bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 lg:px-4 lg:py-3 text-white hover:bg-gray-700/30 transition-colors text-sm lg:text-base"
              disabled={batches.length === 0}
            >
              <div className="flex items-center gap-2">
                <UserGroupIcon className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
                <span className="truncate">{selectedBatch || "No Batches"}</span>
              </div>
              {showBatchSelector ? (
                <ChevronUpIcon className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
              )}
            </button>
            {showBatchSelector && batches.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-20 mt-2 w-full bg-gray-800 border border-gray-700/50 rounded-lg shadow-lg text-sm lg:text-base max-h-60 overflow-y-auto"
              >
                {batches.map(batch => (
                  <button
                    key={batch}
                    onClick={() => {
                      setSelectedBatch(batch);
                      setShowBatchSelector(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-700/50 transition-colors ${
                      selectedBatch === batch ? 'text-blue-400 font-semibold' : 'text-gray-300'
                    }`}
                  >
                    {batch}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 lg:px-4 lg:py-3 text-sm lg:text-base text-white">
            <CalendarIcon className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent outline-none w-full text-gray-300"
              style={{ colorScheme: 'dark' }} // For better date picker appearance in dark mode
            />
          </div>

          <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 lg:px-4 lg:py-3 sm:col-span-2 lg:col-span-2 text-sm lg:text-base">
            <MagnifyingGlassIcon className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
            <input
              type="text"
              placeholder="Search students by name or roll no..."
              className="bg-transparent outline-none w-full text-white placeholder-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {[
            { 
              title: 'Total Students', 
              value: filteredStudents.length, 
              icon: UserGroupIcon,
              color: 'blue'
            },
            { 
              title: 'Present Today', 
              value: presentCount, 
              icon: CheckCircleIcon,
              color: 'green'
            },
            { 
              title: 'Absent Today', 
              value: absentCount < 0 ? 0 : absentCount, // Ensure non-negative
              icon: XCircleIcon,
              color: 'red'
            },
            { 
              title: "Today's Rate", 
              value: `${filteredStudents.length > 0 ? Math.round((presentCount / filteredStudents.length) * 100) : 0}%`, 
              icon: ChartBarIcon,
              color: 'purple'
            },
          ].map((stat, index) => (
            <div key={index} className={`bg-gradient-to-br from-${stat.color}-600/20 to-${stat.color}-600/10 p-4 lg:p-6 rounded-xl border border-${stat.color}-500/20 hover:shadow-${stat.color}-500/30 hover:shadow-lg transition-all`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs lg:text-sm mb-1">{stat.title}</p>
                  <p className="text-lg lg:text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 lg:w-12 lg:h-12 p-1.5 lg:p-2.5 rounded-full bg-${stat.color}-500/20 text-${stat.color}-400`} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 lg:p-6 overflow-x-auto">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h3 className="text-lg lg:text-xl font-semibold text-white flex items-center gap-2">
                  <ClipboardDocumentIcon className="w-5 h-5 lg:w-6 lg:h-6 text-purple-400" />
                  {selectedBatch || "No Batch Selected"} Attendance
                </h3>
                <div className="flex gap-2">
                  <button className="p-1.5 lg:p-2 text-blue-400 hover:bg-gray-700/50 rounded-lg disabled:opacity-50" title="Print Report" disabled={studentsToDisplay.length === 0}>
                    <PrinterIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                  <button className="p-1.5 lg:p-2 text-blue-400 hover:bg-gray-700/50 rounded-lg disabled:opacity-50" title="Email Report" disabled={studentsToDisplay.length === 0}>
                    <EnvelopeIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                  <button className="p-1.5 lg:p-2 text-gray-400 hover:bg-gray-700/50 rounded-lg" title="More options">
                    <EllipsisVerticalIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                </div>
              </div>

              {loading && <p className="text-center text-gray-400 py-4">Loading attendance...</p>}
              {!loading && studentsToDisplay.length === 0 && selectedBatch && (
                <p className="text-center text-gray-400 py-4">
                  No students found for {selectedBatch} {searchQuery && "matching your search."}
                </p>
              )}
              {!selectedBatch && !loading && (
                 <p className="text-center text-gray-400 py-4">Please select a batch to view attendance.</p>
              )}

              {studentsToDisplay.length > 0 && (
                <div className="min-w-[600px] lg:min-w-0">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-400 border-b border-gray-700/50 text-sm lg:text-base">
                        <th className="pb-3 pl-2">Roll No</th>
                        <th className="pb-3">Student</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Today's Record</th>
                        <th className="pb-3 pr-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsToDisplay.map(student => {
                        const record = attendanceRecords.find(r => r.studentId === student.id);
                        const isPresent = record ? record.isPresent : false; // Default to absent if no record
                        
                        return (
                          <tr key={student.id} className="border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors text-sm lg:text-base">
                            <td className="py-3 pl-2 text-blue-400 font-medium">{student.rollNo || 'N/A'}</td>
                            <td className="py-3">
                              <div className="flex items-center gap-2 lg:gap-3">
                                <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 uppercase">
                                  {student.name ? student.name.charAt(0) : '?'}
                                </div>
                                <div>
                                  <p className="text-white">{student.name || 'Unnamed Student'}</p>
                                  <p className="text-xs text-gray-400 truncate max-w-[120px] lg:max-w-none">{student.email || 'No email'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                isPresent 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {isPresent ? 'Present' : 'Absent'}
                              </span>
                            </td>
                            <td className="py-3">
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${isPresent ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-red-500'}`}
                                  style={{ width: record ? `100%` : '0%' }} // Show 100% if present/absent recorded, 0 if no record
                                />
                              </div>
                              <p className="text-xs text-gray-400 mt-1">{record ? (isPresent ? 'Recorded Present' : 'Recorded Absent') : 'No Record Yet'}</p>
                            </td>
                            <td className="py-3 pr-2">
                              <button
                                onClick={() => handleAttendanceChange(student.id, isPresent)}
                                disabled={saving}
                                className={`px-2 py-1 rounded-lg text-xs disabled:opacity-50 ${
                                  isPresent 
                                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                                    : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                                }`}
                              >
                                {isPresent ? 'Mark Absent' : 'Mark Present'}
                              </button>
                              {/* Placeholder for history button if needed later */}
                              {/* <button className="ml-2 px-2 py-1 rounded-lg text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400">History</button> */}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 lg:space-y-8">
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-semibold text-white mb-3 lg:mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 lg:w-6 lg:h-6 text-green-400" />
                Today's Attendance ({selectedDate})
              </h3>
              {filteredStudents.length > 0 ? (
                <>
                  <div className="flex items-center justify-center h-[200px] lg:h-[240px]">
                    <PieChart width={isMobile ? 180 : 200} height={isMobile ? 180 : 200}>
                      <Pie
                        data={attendanceStatsPie}
                        cx="50%"
                        cy="50%"
                        innerRadius={isMobile ? 40: 50}
                        outerRadius={isMobile ? 60: 70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {attendanceStatsPie.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                        itemStyle={{ color: '#e5e7eb' }}
                        cursor={{ fill: 'rgba(255,255,255,0.1)'}}
                      />
                    </PieChart>
                  </div>
                  <div className="flex flex-col lg:flex-row lg:justify-center lg:gap-6 mt-3 lg:mt-4 space-y-2 lg:space-y-0">
                    {attendanceStatsPie.map((stat, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                        <span className="text-xs lg:text-sm text-gray-300">
                          {stat.name}: {stat.value} ({filteredStudents.length > 0 ? Math.round(stat.value / filteredStudents.length * 100) : 0}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-400 py-10">No student data for pie chart.</p>
              )}
            </div>

            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-semibold text-white mb-3 lg:mb-4 flex items-center gap-2">
                <ArrowPathIcon className="w-5 h-5 lg:w-6 lg:h-6 text-blue-400" />
                Monthly Trend (Sample)
              </h3>
              <div className='h-[200px] flex justify-center items-center'>
                <BarChart 
                  width={isMobile ? Math.min(300, window.innerWidth - 80) : 280} 
                  height={200} 
                  data={monthlyTrendData}
                  className="mx-auto"
                  margin={{ top: 5, right: 0, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                    itemStyle={{ color: '#e5e7eb' }}
                    cursor={{ fill: 'rgba(255,255,255,0.1)'}}
                  />
                  <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} barSize={isMobile ? 15 : 20} />
                  <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={isMobile ? 15 : 20} />
                </BarChart>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-semibold text-white mb-3 lg:mb-4 flex items-center gap-2">
                <BellIcon className="w-5 h-5 lg:w-6 lg:h-6 text-purple-400" />
                Quick Actions
              </h3>
              <div className="space-y-2 lg:space-y-3">
                <button className="w-full flex items-center gap-2 lg:gap-3 p-2 lg:p-3 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors text-sm lg:text-base text-blue-300">
                  <EnvelopeIcon className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
                  <span>Notify Absentees</span>
                </button>
                <button className="w-full flex items-center gap-2 lg:gap-3 p-2 lg:p-3 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors text-sm lg:text-base text-purple-300">
                  <DocumentTextIcon className="w-4 h-4 lg:w-5 lg:h-5 text-purple-400" />
                  <span>Generate Report</span>
                </button>
                {/* <button className="w-full flex items-center gap-2 lg:gap-3 p-2 lg:p-3 bg-green-600/20 hover:bg-green-600/30 rounded-lg transition-colors text-sm lg:text-base text-green-300">
                  <UserGroupIcon className="w-4 h-4 lg:w-5 lg:h-5 text-green-400" />
                  <span>View All Batches</span>
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </main>

      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-800 rounded-xl p-6 lg:p-8 w-full max-w-md relative max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl"
          >
            <button
              onClick={() => setShowAddStudentModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            
            <h3 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Add New Student to {selectedBatch || "Current Batch"}
            </h3>
            
            <form onSubmit={handleAddStudentSubmit} className="space-y-4 lg:space-y-6">
              <div className="space-y-1">
                <label htmlFor="studentName" className="block text-gray-300 text-sm lg:text-base">Full Name</label>
                <input
                  id="studentName"
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-2 lg:py-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm lg:text-base transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-1">
                  <label htmlFor="rollNo" className="block text-gray-300 text-sm lg:text-base">Roll Number</label>
                  <input
                    id="rollNo"
                    type="text"
                    value={newStudent.rollNo}
                    onChange={(e) => setNewStudent({...newStudent, rollNo: e.target.value})}
                    className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-2 lg:py-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm lg:text-base transition-colors"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="batchName" className="block text-gray-300 text-sm lg:text-base">Batch</label>
                  <input
                    id="batchName"
                    type="text"
                    className="w-full bg-gray-700/50 border border-gray-600 text-gray-400 rounded-lg px-4 py-2 lg:py-3 outline-none text-sm lg:text-base"
                    value={selectedBatch || "Select a batch first"}
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="studentEmail" className="block text-gray-300 text-sm lg:text-base">Email Address</label>
                <input
                  id="studentEmail"
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-2 lg:py-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm lg:text-base transition-colors"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 lg:gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-1.5 lg:px-6 lg:py-2.5 rounded-lg bg-gray-600 hover:bg-gray-500 text-white transition-colors text-sm lg:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedBatch || loading}
                  className="px-4 py-1.5 lg:px-6 lg:py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 transition-all flex items-center gap-1 lg:gap-2 text-sm lg:text-base disabled:opacity-60"
                >
                  {loading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <PlusIcon className="w-4 h-4 lg:w-5 lg:h-5" /> }
                  Add Student
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTracking;