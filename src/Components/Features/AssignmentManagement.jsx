import { useState } from 'react';
import { Link } from 'react-router';
import {
  ClipboardDocumentIcon,
  CalendarIcon,
  DocumentTextIcon,
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
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: 'Algebra Basics',
      subject: 'Mathematics',
      dueDate: '2023-11-15',
      status: 'Published',
      submissions: 45,
      averageGrade: 78,
      attachments: 3,
    },
    {
      id: 2,
      title: 'Chemical Reactions Lab',
      subject: 'Chemistry',
      dueDate: '2023-11-18',
      status: 'Draft',
      submissions: 0,
      averageGrade: null,
      attachments: 1,
    },
  ]);

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    subject: 'Mathematics',
    dueDate: '',
    instructions: '',
    maxPoints: 100,
    attachments: [],
  });

  const educatorMenu = [
    { title: 'Dashboard', Icon: ClipboardDocumentIcon, link: '/educator-dashboard' },
    { title: 'Grading System', Icon: AcademicCapIcon, link: '/grading-system' },
    { title: 'Attendance Tracking', Icon: ChartBarIcon, link: '/attendance-tracking' },
    { title: 'Chatbot Interaction', Icon: ChatBubbleLeftRightIcon, link: '/chatbot-interaction' },
    { title: 'Feedback Provision', Icon: LightBulbIcon, link: '/feedback-provision' },
    { title: 'Question Generation', Icon: SparklesIcon, link: '/question-generation' },
    { title: 'Suggestions to Students', Icon: EnvelopeIcon, link: '/suggestions-to-students' },
    { title: 'Meeting Hosting', Icon: VideoCameraIcon, link: '/meeting-hosting' },
    { title: 'Collaboration', Icon: UserGroupIcon, link: '/collaboration' },
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

  const handleCreateAssignment = (e) => {
    e.preventDefault();
    const assignment = {
      id: assignments.length + 1,
      title: newAssignment.title,
      subject: newAssignment.subject,
      dueDate: newAssignment.dueDate,
      status: 'Draft',
      submissions: 0,
      averageGrade: null,
      attachments: newAssignment.attachments.length,
    };
    setAssignments([assignment, ...assignments]);
    setShowCreateModal(false);
    setNewAssignment({
      title: '',
      subject: 'Mathematics',
      dueDate: '',
      instructions: '',
      maxPoints: 100,
      attachments: [],
    });
    alert('Assignment created successfully!');
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewAssignment({ ...newAssignment, attachments: files });
  };

  const CreateAssignmentModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-2xl relative">
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
              <label className="block text-gray-300">Assignment Title</label>
              <input
                type="text"
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-gray-300">Subject</label>
              <select
                value={newAssignment.subject}
                onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option>Mathematics</option>
                <option>Science</option>
                <option>Literature</option>
                <option>History</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-gray-300">Instructions</label>
            <textarea
              rows="4"
              value={newAssignment.instructions}
              onChange={(e) => setNewAssignment({ ...newAssignment, instructions: e.target.value })}
              className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-gray-300">Due Date</label>
              <input
                type="date"
                value={newAssignment.dueDate}
                onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-gray-300">Max Points</label>
              <input
                type="number"
                value={newAssignment.maxPoints}
                onChange={(e) => setNewAssignment({ ...newAssignment, maxPoints: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
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
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-6 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Create Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );

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
              { title: 'Total Assignments', value: 24, icon: DocumentTextIcon, color: 'blue' },
              { title: 'Pending Submissions', value: 156, icon: ClipboardDocumentIcon, color: 'purple' },
              { title: 'Average Grade', value: '78%', icon: AcademicCapIcon, color: 'green' },
              { title: 'Completion Rate', value: '82%', icon: ChartBarIcon, color: 'indigo' },
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
                      style={{ width: `${Math.min(100, (stat.value/100)*100)}%` }}
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
                  {assignments.map(assignment => (
                    <div key={assignment.id} className="group p-4 bg-gray-900/30 rounded-lg hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-medium text-white">{assignment.title}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-4 h-4" />
                              Due: {assignment.dueDate}
                            </span>
                            <span className={`px-2 py-1 rounded-full ${assignment.status === 'Published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                              {assignment.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button className="p-2 hover:bg-gray-700 rounded-lg">
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
                          <p className="text-xl font-bold text-white">{assignment.submissions}</p>
                        </div>
                        <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                          <p className="text-sm text-gray-400">Avg Grade</p>
                          <p className="text-xl font-bold text-white">
                            {assignment.averageGrade || '--'}%
                          </p>
                        </div>
                        <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                          <p className="text-sm text-gray-400">Attachments</p>
                          <p className="text-xl font-bold text-white">{assignment.attachments}</p>
                        </div>
                      </div>
                    </div>
                  ))}
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

        {showCreateModal && <CreateAssignmentModal />}
    </div>
  );
};

export default AssignmentManagement;