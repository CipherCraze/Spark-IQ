import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { storage, db, auth } from '../../firebase/firebaseConfig';
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  ClipboardDocumentIcon,
  CalendarIcon,
  DocumentTextIcon,
  FolderIcon,
  UsersIcon,
  ChartBarIcon,
  AcademicCapIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowTrendingUpIcon,
  ChevronUpDownIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  SparklesIcon,
  EnvelopeIcon,
  VideoCameraIcon,
  UserGroupIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell } from 'recharts';

const AssignmentManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    subject: 'Mathematics',
    dueDate: '',
    instructions: '',
    maxPoints: 100,
    attachments: [],
    rubric: '',
    totalSubmissions: 0,
    createdAt: new Date(),
    status: 'draft'
  });

  const educatorMenu = [
    { title: 'Dashboard', Icon: AcademicCapIcon, link: '/educator-dashboard' },
    { title: 'Grades', Icon: DocumentTextIcon, link: '/grading-system' },
    { title: 'Resources', Icon: FolderIcon, link: '/resource-management' },
    { title: 'Attendance', Icon: ChartBarIcon, link: '/attendance-tracking' },
    { title: 'Ask Sparky', Icon: ChatBubbleLeftRightIcon, link: '/chatbot-education' },
    { title: 'Feedback', Icon: LightBulbIcon, link: '/feedback-dashboard' },
    { title: 'Questions', Icon: SparklesIcon, link: '/ai-generated-questions' },
    { title: 'News', Icon: UsersIcon, link: '/educational-news' },
    { title: 'Suggestions', Icon: EnvelopeIcon, link: '/suggestions-to-students' },
    { title: 'Meetings', Icon: VideoCameraIcon, link: '/meeting-host' },  
    { title: 'Announcements', Icon: MegaphoneIcon, link: '/announcements' },
  ];

  const performanceData = [
    { name: 'A', value: 24 },
    { name: 'B', value: 30 },
    { name: 'C', value: 25 },
    { name: 'D', value: 15 },
    { name: 'F', value: 6 },
  ];

  const COLORS = ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'];

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const assignmentsRef = collection(db, 'assignments');
      const q = query(assignmentsRef, where('teacherId', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const assignmentsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAssignments(assignmentsList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      // Validate required fields
      if (!newAssignment.title || !newAssignment.instructions || !newAssignment.rubric || !newAssignment.dueDate) {
        throw new Error('Please fill all required fields');
      }

      // Upload attachments to Firebase Storage
      const attachmentUrls = await Promise.all(
        newAssignment.attachments.map(async (file) => {
          const storageRef = ref(storage, `assignments/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
          await uploadBytes(storageRef, file);
          return getDownloadURL(storageRef);
        })
      );

      // Create assignment document in Firestore
      const assignmentData = {
        title: newAssignment.title,
        subject: newAssignment.subject,
        dueDate: newAssignment.dueDate,
        instructions: newAssignment.instructions,
        maxPoints: Number(newAssignment.maxPoints),
        attachmentUrls,
        rubric: newAssignment.rubric,
        teacherId: auth.currentUser.uid,
        teacherName: auth.currentUser.displayName || 'Teacher',
        createdAt: new Date().toISOString(),
        status: 'published',
        totalSubmissions: 0,
        averageGrade: 0
      };

      const docRef = await addDoc(collection(db, 'assignments'), assignmentData);
      
      // Update local state with new assignment
      setAssignments([{ id: docRef.id, ...assignmentData }, ...assignments]);
      setShowCreateModal(false);
      
      // Reset form
      setNewAssignment({
        title: '',
        subject: 'Mathematics',
        dueDate: '',
        instructions: '',
        maxPoints: 100,
        attachments: [],
        rubric: '',
        totalSubmissions: 0,
        createdAt: new Date(),
        status: 'draft'
      });
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setNewAssignment(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...files]
      }));
    }
  };

  const removeAttachment = (index) => {
    setNewAssignment(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleInputChange = (field, value) => {
    setNewAssignment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Memoize the modal to avoid recreation on every render
  const CreateAssignmentModal = useMemo(() => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setShowCreateModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Create New Assignment
        </h3>
        <form onSubmit={handleCreateAssignment} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-gray-300">Assignment Title *</label>
              <input
                type="text"
                value={newAssignment.title}
                onChange={e => handleInputChange('title', e.target.value)}
                className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-gray-300">Subject *</label>
              <select
                value={newAssignment.subject}
                onChange={e => handleInputChange('subject', e.target.value)}
                className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="Literature">Literature</option>
                <option value="History">History</option>
                <option value="Computer Science">Computer Science</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-gray-300">Instructions *</label>
            <textarea
              rows="4"
              value={newAssignment.instructions}
              onChange={e => handleInputChange('instructions', e.target.value)}
              className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-gray-300">Grading Rubric *</label>
            <textarea
              rows="4"
              value={newAssignment.rubric}
              onChange={e => handleInputChange('rubric', e.target.value)}
              className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter grading criteria and expectations..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-gray-300">Due Date *</label>
              <input
                type="datetime-local"
                value={newAssignment.dueDate}
                onChange={e => handleInputChange('dueDate', e.target.value)}
                className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-gray-300">Max Points *</label>
              <input
                type="number"
                min="1"
                value={newAssignment.maxPoints}
                onChange={e => handleInputChange('maxPoints', e.target.value)}
                className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-gray-300">Attachments</label>
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                multiple
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center h-full border-2 border-dashed border-gray-600 rounded-lg py-4 hover:border-blue-400 transition-colors cursor-pointer"
              >
                <PlusIcon className="w-6 h-6 text-gray-400" />
                <span className="ml-2 text-gray-400">Upload Files</span>
              </label>
              
              {newAssignment.attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {newAssignment.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-700/50 p-2 rounded">
                      <span className="text-sm text-gray-300 truncate">{file.name}</span>
                      <button 
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-6 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-2 disabled:opacity-50"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <PlusIcon className="w-5 h-5" />
                  Create Assignment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  ), [
    newAssignment, uploading, handleCreateAssignment, handleFileUpload, removeAttachment
  ]);

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-800 border-r border-gray-700/50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } z-50 flex flex-col`}
      >
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
      <main className={`flex-1 p-8 overflow-y-auto relative transition-margin duration-300 ${
        isSidebarOpen ? 'ml-64' : 'ml-0'
      }`}>
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Assignment Management
                </span>
              </h2>
              <p className="text-gray-400 text-lg">
                Manage assignments, track progress, and analyze student performance
              </p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              New Assignment
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Assignments', value: assignments.length, icon: DocumentTextIcon, color: 'blue' },
            { 
              title: 'Pending Submissions', 
              value: assignments.reduce((sum, a) => sum + a.totalSubmissions, 0), 
              icon: ClipboardDocumentIcon, 
              color: 'purple' 
            },
            { 
              title: 'Average Grade', 
              value: assignments.length > 0 
                ? `${Math.round(assignments.reduce((sum, a) => sum + (a.averageGrade || 0), 0) / assignments.length)}%` 
                : '0%', 
              icon: AcademicCapIcon, 
              color: 'green' 
            },
            { 
              title: 'Completion Rate', 
              value: '82%', 
              icon: ChartBarIcon, 
              color: 'indigo' 
            },
          ].map((stat, index) => (
            <div key={index} className={`bg-gradient-to-br from-${stat.color}-600/20 to-${stat.color}-600/10 p-6 rounded-xl border border-${stat.color}-500/20 hover:shadow-lg transition-all`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <stat.icon className={`w-12 h-12 p-2.5 rounded-full bg-${stat.color}-500/20 text-${stat.color}-400`} />
              </div>
              <div className="mt-4">
                <div className="h-1 bg-gray-700 rounded-full">
                  <div 
                    className={`h-full bg-${stat.color}-500 rounded-full transition-all duration-500`}
                    style={{ width: `${typeof stat.value === 'number' ? Math.min(100, (stat.value/100)*100) : 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assignment List */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <ClipboardDocumentIcon className="w-6 h-6 text-purple-400" />
                  Recent Assignments
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search assignments..."
                    className="bg-gray-700 rounded-lg px-4 py-2 pr-8 w-64 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <ChevronUpDownIcon className="w-4 h-4 absolute right-3 top-3 text-gray-400" />
                </div>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="text-center text-gray-400">Loading assignments...</div>
                ) : assignments.length === 0 ? (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-400">No assignments created yet</h3>
                    <p className="text-gray-500 mt-1">Click "New Assignment" to create your first one</p>
                  </div>
                ) : (
                  assignments
                    .filter(assignment => 
                      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      assignment.subject.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(assignment => (
                      <div key={assignment.id} className="group p-4 bg-gray-900/30 rounded-lg hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-medium text-white">{assignment.title}</h4>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                Due: {new Date(assignment.dueDate).toLocaleDateString()}
                              </span>
                              <span className={`px-2 py-1 rounded-full ${assignment.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                {assignment.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <button 
                              className="p-2 hover:bg-gray-700 rounded-lg"
                              onClick={() => {
                                setNewAssignment({
                                  ...assignment,
                                  attachments: []
                                });
                                setShowCreateModal(true);
                              }}
                            >
                              <PencilIcon className="w-5 h-5 text-blue-400" />
                            </button>
                            <button className="p-2 hover:bg-gray-700 rounded-lg">
                              <TrashIcon className="w-5 h-5 text-red-400" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Assignment Metrics */}
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                            <p className="text-sm text-gray-400">Submissions</p>
                            <p className="text-xl font-bold text-white">{assignment.totalSubmissions}</p>
                          </div>
                          <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                            <p className="text-sm text-gray-400">Avg Grade</p>
                            <p className="text-xl font-bold text-white">
                              {assignment.averageGrade || '--'}%
                            </p>
                          </div>
                          <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                            <p className="text-sm text-gray-400">Attachments</p>
                            <p className="text-xl font-bold text-white">{assignment.attachmentUrls?.length || 0}</p>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Analytics Sidebar */}
          <div className="space-y-8">
            {/* Performance Chart */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-6 h-6 text-green-400" />
                Class Performance
              </h3>
              <div className="flex items-center justify-center">
                <PieChart width={240} height={240}>
                  <Pie
                    data={performanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {performanceData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {performanceData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-sm text-gray-300">{entry.name}: {entry.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <ArrowTrendingUpIcon className="w-6 h-6 text-purple-400" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors">
                  <UsersIcon className="w-5 h-5 text-blue-400" />
                  <span>Manage Classes</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors">
                  <AcademicCapIcon className="w-5 h-5 text-purple-400" />
                  <span>Gradebook</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-green-600/20 hover:bg-green-600/30 rounded-lg transition-colors">
                  <ChartBarIcon className="w-5 h-5 text-green-400" />
                  <span>Generate Reports</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      {showCreateModal && CreateAssignmentModal}
    </div>
  );
};

export default AssignmentManagement;