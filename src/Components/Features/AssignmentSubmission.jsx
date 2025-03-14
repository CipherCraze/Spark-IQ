import { useState } from 'react';
import { Link } from 'react-router';
import {
  ClipboardDocumentIcon,
  CalendarIcon,
  DocumentTextIcon,
  PaperClipIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { FolderIcon } from '@heroicons/react/24/outline';

const AssignmentSubmission = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [file, setFile] = useState(null);
  const [submissionHistory, setSubmissionHistory] = useState([
    {
      id: 1,
      assignment: 'Math Assignment 1',
      submittedOn: '2023-10-15',
      status: 'Submitted',
      file: 'math_assignment_1.pdf',
    },
    {
      id: 2,
      assignment: 'Science Project',
      submittedOn: '2023-10-10',
      status: 'Graded',
      file: 'science_project.zip',
    },
  ]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = () => {
    if (file) {
      const newSubmission = {
        id: submissionHistory.length + 1,
        assignment: 'New Assignment',
        submittedOn: new Date().toISOString().split('T')[0],
        status: 'Submitted',
        file: file.name,
      };
      setSubmissionHistory([newSubmission, ...submissionHistory]);
      setFile(null);
      alert('Assignment submitted successfully!');
    } else {
      alert('Please select a file to submit.');
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
                  { title: 'Assignments', link: '/assignment-submission', Icon: DocumentTextIcon },
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
          <h2 className="text-4xl font-bold text-white mb-3">
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Assignment Submission
            </span>
          </h2>
          <p className="text-gray-400 text-lg">
            Submit your assignments and track your progress effortlessly.
          </p>
        </header>

        {/* Assignment Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Assignment Info */}
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <DocumentTextIcon className="w-7 h-7 text-blue-400" />
              <h3 className="text-xl font-semibold text-white">Assignment Details</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400">Assignment Title:</p>
                <p className="text-white text-lg">Math Assignment 1</p>
              </div>
              <div>
                <p className="text-gray-400">Due Date:</p>
                <p className="text-white text-lg">2023-10-20</p>
              </div>
              <div>
                <p className="text-gray-400">Instructions:</p>
                <p className="text-white text-lg">
                  Solve the problems in the attached PDF and submit your solutions.
                </p>
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <PaperClipIcon className="w-7 h-7 text-green-400" />
              <h3 className="text-xl font-semibold text-white">Submit Assignment</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
                >
                  <ArrowUpTrayIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-gray-400">
                    {file ? file.name : 'Click to upload or drag and drop'}
                  </p>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              <button
                onClick={handleSubmit}
                className="w-full py-3 bg-indigo-500/90 rounded-xl text-white hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircleIcon className="w-5 h-5" />
                Submit Assignment
              </button>
            </div>
          </div>
        </div>

        {/* Submission History */}
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6">
            <ClipboardDocumentIcon className="w-7 h-7 text-purple-400" />
            <h3 className="text-xl font-semibold text-white">Submission History</h3>
          </div>
          <div className="space-y-4">
            {submissionHistory.map((submission) => (
              <div
                key={submission.id}
                className="flex items-center p-4 bg-gray-900/30 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-white">{submission.assignment}</p>
                  <p className="text-sm text-gray-400">Submitted on: {submission.submittedOn}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    submission.status === 'Submitted'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}
                >
                  {submission.status}
                </span>
                <a
                  href={`/files/${submission.file}`}
                  download
                  className="ml-4 p-2 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <PaperClipIcon className="w-5 h-5 text-gray-400" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AssignmentSubmission;