import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileUpload } from '../FileUpload.jsx';
import { evaluateAssignment } from '../../services/geminiService';
import {
  ClipboardDocumentIcon,
  DocumentTextIcon,
  PaperClipIcon,
  Bars3Icon,
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowUpTrayIcon,
  ChartBarIcon,
  FolderIcon,
  SparklesIcon,
  CalendarIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { storage, db } from '../../firebase/firebaseConfig';
import { collection, getDocs, query, where, addDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../../firebase/firebaseConfig';

const AssignmentSubmission = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [activeTab, setActiveTab] = useState('current');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [error, setError] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const submissionHistory = [
    {
      id: 1,
      assignment: 'Math Assignment 1',
      submittedOn: '2023-10-15',
      dueDate: '2023-10-20',
      status: 'Submitted',
      grade: null,
      file: 'math_assignment_1.pdf',
      instructions: 'Solve the problems in the attached PDF and submit your solutions.'
    },
    {
      id: 2,
      assignment: 'Science Project',
      submittedOn: '2023-10-10',
      dueDate: '2023-10-15',
      status: 'Graded',
      grade: 'A-',
      file: 'science_project.zip',
      feedback: 'Excellent work on the experimental design!'
    },
    {
      id: 3,
      assignment: 'History Essay',
      submittedOn: '2023-09-28',
      dueDate: '2023-10-05',
      status: 'Late',
      grade: 'B+',
      file: 'history_essay.docx',
      feedback: 'Good analysis but could use more primary sources.'
    }
  ];

  const currentAssignments = submissionHistory.filter(a => a.status === 'Submitted');
  const pastAssignments = submissionHistory.filter(a => a.status !== 'Submitted');

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Check if API key is configured
    console.log('Gemini API Key configured:', !!import.meta.env.VITE_GEMINI_API_KEY);
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const assignmentsRef = collection(db, 'assignments');
      const q = query(assignmentsRef, where('status', '==', 'published'));
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

  const handleFileChange = (selectedFile) => {
    setFile(selectedFile);
  };

  const handleSubmit = async (assignmentId) => {
    if (!selectedFile) {
      alert('Please select a file to submit');
      return;
    }

    setSubmitting(true);
    try {
      // Upload submission file to Firebase Storage
      const storageRef = ref(storage, `submissions/${assignmentId}/${auth.currentUser.uid}/${selectedFile.name}`);
      await uploadBytes(storageRef, selectedFile);
      const fileUrl = await getDownloadURL(storageRef);

      // Create submission document in Firestore
      const submissionData = {
        assignmentId,
        studentId: auth.currentUser.uid,
        studentName: auth.currentUser.displayName,
        fileUrl,
        fileName: selectedFile.name,
        submittedAt: new Date(),
        status: 'pending',
        feedback: null,
        grade: null
      };

      const submissionRef = await addDoc(collection(db, 'submissions'), submissionData);

      // Update assignment's total submissions count
      const assignmentRef = doc(db, 'assignments', assignmentId);
      await updateDoc(assignmentRef, {
        totalSubmissions: assignments.find(a => a.id === assignmentId).totalSubmissions + 1
      });

      // Process submission with Gemini
      const response = await fetch('/api/grade-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: submissionRef.id,
          assignmentId,
          fileUrl,
          rubric: assignments.find(a => a.id === assignmentId).rubric
        }),
      });

      const result = await response.json();
      setFeedback(result);

      // Update submission with feedback
      await updateDoc(doc(db, 'submissions', submissionRef.id), {
        status: 'graded',
        feedback: result.feedback,
        grade: result.grade
      });

      setSelectedFile(null);
      fetchAssignments(); // Refresh assignments list
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Error submitting assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Submitted':
        return <ClockIcon className="w-5 h-5 text-blue-400" />;
      case 'Graded':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'Late':
        return <ExclamationCircleIcon className="w-5 h-5 text-yellow-400" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && windowWidth < 768 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar with same design as ResourceUtilization */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-800 border-r border-gray-700/50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } z-50 flex flex-col`}
      >
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
                <XMarkIcon className="w-5 h-5 text-gray-400" />
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
                  { title: 'Assignments', link: '/assignment-submission', Icon: DocumentTextIcon, active: true },
                  { title: 'Grades', link: '/grading-access', Icon: ChartBarIcon },
                  { title: 'Resources', link: '/resource-utilization', Icon: FolderIcon },
                ].map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.link}
                      className={`flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-all duration-300 group hover:translate-x-1 ${
                        item.active ? 'bg-indigo-500/10 text-indigo-400' : ''
                      }`}
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

        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-30 bg-gray-900/80 backdrop-blur p-4 border-b border-gray-700/50 mb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-700"
            >
              <Bars3Icon className="w-6 h-6 text-gray-400" />
            </button>
            <h1 className="text-xl font-bold text-white">Assignments</h1>
            <div className="w-6"></div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto">
          {/* Desktop Header */}
          <header className="mb-8 hidden md:block">
            <h2 className="text-3xl font-bold text-white mb-2">
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Assignment Submission
              </span>
            </h2>
            <p className="text-gray-400">
              Submit your assignments and track your progress
            </p>
          </header>

          {/* Assignment Tabs */}
          <div className="flex border-b border-gray-700 mb-6">
            <button
              onClick={() => setActiveTab('current')}
              className={`px-4 py-2 font-medium ${activeTab === 'current' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'}`}
            >
              Current Assignments
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-4 py-2 font-medium ${activeTab === 'past' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'}`}
            >
              Past Submissions
            </button>
          </div>

          {/* Current Assignments */}
          {activeTab === 'current' && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center text-gray-400">Loading assignments...</div>
              ) : (
                assignments.length > 0 ? (
                  assignments.map((assignment) => (
                    <div key={assignment.id} className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-white mb-1">
                              {assignment.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <CalendarIcon className="w-4 h-4" />
                              <span>Due: {formatDate(assignment.dueDate)}</span>
                            </div>
                          </div>
                          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-500/20 text-blue-400 h-fit">
                            {getStatusIcon(assignment.status)}
                            {assignment.status}
                          </span>
                        </div>

                        <div className="mt-4">
                          <p className="text-gray-300 mb-4">{assignment.instructions}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-900/30 p-4 rounded-lg">
                              <h4 className="text-gray-400 text-sm mb-2">Your Submission</h4>
                              {assignment.file ? (
                                <div className="flex items-center gap-2">
                                  <PaperClipIcon className="w-5 h-5 text-gray-400" />
                                  <span className="text-white truncate">{assignment.file}</span>
                                </div>
                              ) : (
                                <p className="text-gray-400">No file submitted yet</p>
                              )}
                            </div>

                            <div className="bg-gray-900/30 p-4 rounded-lg">
                              <FileUpload 
                                onFileChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    setSelectedFile(file);
                                  }
                                }}
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handleSubmit(assignment.id);
                                }}
                                file={selectedFile}
                                isEvaluating={submitting}
                              />
                            </div>
                          </div>

                          {submitting && (
                            <div className="mt-4 p-4 bg-blue-500/10 rounded-lg flex items-center gap-3">
                              <ClockIcon className="w-5 h-5 animate-spin" />
                              <p className="text-blue-400">Submitting...</p>
                            </div>
                          )}

                          {error && (
                            <div className="mt-4 p-4 bg-red-500/10 rounded-lg flex items-center gap-3">
                              <ExclamationCircleIcon className="w-5 h-5 text-red-400" />
                              <p className="text-red-400">{error}</p>
                            </div>
                          )}

                          {feedback && feedback.assignmentId === assignment.id && (
                            <div className="mt-4 p-6 bg-gray-900/30 rounded-lg border border-gray-700/50">
                              <h4 className="text-xl font-semibold text-white mb-4">Feedback</h4>
                              <div className="space-y-6">
                                <div className="flex items-center justify-between bg-gray-800/50 p-4 rounded-lg">
                                  <span className="text-gray-300">Grade:</span>
                                  <span className="text-2xl font-bold text-white">{feedback.grade}/{assignment.maxPoints}</span>
                                </div>
                                
                                <div className="space-y-4">
                                  <h5 className="text-lg font-medium text-white">Feedback:</h5>
                                  <div className="prose prose-invert max-w-none">
                                    {feedback.feedback.split('\n').map((paragraph, index) => (
                                      paragraph.trim() ? (
                                        <p key={index} className="text-white mb-3 leading-relaxed">
                                          {paragraph}
                                        </p>
                                      ) : null
                                    ))}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                  <ClockIcon className="w-4 h-4" />
                                  <span>Evaluated on: {new Date(feedback.timestamp).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-400">No current assignments</h3>
                    <p className="text-gray-500 mt-1">Check back later for new assignments</p>
                  </div>
                )
              )}
            </div>
          )}

          {/* Past Submissions */}
          {activeTab === 'past' && (
            <div className="space-y-4">
              {pastAssignments.length > 0 ? (
                pastAssignments.map((assignment) => (
                  <div key={assignment.id} className="bg-gray-800/50 rounded-lg border border-gray-700/50 overflow-hidden hover:bg-gray-800/70 transition-colors">
                    <div className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">{assignment.assignment}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                            <span>Submitted: {assignment.submittedOn}</span>
                            <span>•</span>
                            <span>Due: {assignment.dueDate}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {assignment.grade && (
                            <span className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-400 text-sm font-medium">
                              {assignment.grade}
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-md text-sm font-medium ${
                            assignment.status === 'Graded' 
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {assignment.status}
                          </span>
                        </div>
                      </div>

                      {assignment.feedback && (
                        <div className="mt-4 bg-gray-900/30 p-3 rounded-lg">
                          <h4 className="text-gray-400 text-sm mb-1">Instructor Feedback</h4>
                          <p className="text-white">{assignment.feedback}</p>
                        </div>
                      )}

                      <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                        <div className="flex items-center gap-2 text-gray-400">
                          <PaperClipIcon className="w-4 h-4" />
                          <span className="text-sm">{assignment.file}</span>
                        </div>
                        <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                          Download Submission
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-400">No past submissions</h3>
                  <p className="text-gray-500 mt-1">Your submitted assignments will appear here</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AssignmentSubmission;