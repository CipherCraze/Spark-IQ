import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { storage, db, auth } from '../../firebase/firebaseConfig';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, orderBy, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
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
  UserGroupIcon as EducatorUserGroupIcon, // Renamed to avoid conflict if another UserGroupIcon is used locally
  MegaphoneIcon,
  EyeIcon, // Added for viewing submissions
} from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell } from 'recharts';

const AssignmentManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    subject: 'Mathematics',
    dueDate: '',
    instructions: '',
    maxPoints: 100,
    attachments: [], // For file objects during creation
    attachmentUrls: [], // For storing URLs after upload (used if editing)
    rubric: '',
    totalSubmissions: 0,
    createdAt: new Date(),
    status: 'draft',
    id: null, // For editing
  });

  // State for submissions modal
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedAssignmentForSubmissions, setSelectedAssignmentForSubmissions] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  const [showSubmissions, setShowSubmissions] = useState(false);

  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [newGrade, setNewGrade] = useState('');
  const [newFeedback, setNewFeedback] = useState('');

  const educatorMenu = [
    { title: 'Dashboard', Icon: AcademicCapIcon, link: '/educator-dashboard' },
    { title: 'Grades', Icon: DocumentTextIcon, link: '/grading-system' },
    { title: 'Resources', Icon: FolderIcon, link: '/resource-management' },
    { title: 'Attendance', Icon: ChartBarIcon, link: '/attendance-tracking' },
    { title: 'Ask Sparky', Icon: ChatBubbleLeftRightIcon, link: '/chatbot-education' },
    { title: 'Feedback', Icon: LightBulbIcon, link: '/feedback-dashboard' },
    { title: 'Questions', Icon: SparklesIcon, link: '/ai-generated-questions' },
    { title: 'News', Icon: UsersIcon, link: '/educational-news' }, // UsersIcon for News
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
    setLoading(true);
    try {
      if (!auth.currentUser) {
        console.warn("User not authenticated. Cannot fetch assignments.");
        setLoading(false);
        return;
      }
      const assignmentsRef = collection(db, 'assignments');
      const q = query(assignmentsRef, where('teacherId', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const assignmentsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAssignments(assignmentsList);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetNewAssignmentForm = () => {
    setNewAssignment({
      title: '',
      subject: 'Mathematics',
      dueDate: '',
      instructions: '',
      maxPoints: 100,
      attachments: [],
      attachmentUrls: [],
      rubric: '',
      totalSubmissions: 0,
      createdAt: new Date(),
      status: 'draft',
      id: null,
    });
  };

  const handleCreateOrUpdateAssignment = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      if (!newAssignment.title || !newAssignment.instructions || !newAssignment.rubric || !newAssignment.dueDate) {
        alert('Please fill all required fields: Title, Instructions, Rubric, and Due Date.');
        setUploading(false);
        return;
      }
      if (!auth.currentUser) {
        throw new Error("User not authenticated.");
      }

      const attachmentUrls = await Promise.all(
        newAssignment.attachments.map(async (file) => {
          if (typeof file === 'string') return file; // Already a URL (from editing)
          const storageRef = ref(storage, `assignments/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
          await uploadBytes(storageRef, file);
          return getDownloadURL(storageRef);
        })
      );
      // Combine with existing URLs if any (e.g. when editing and not changing files)
      const finalAttachmentUrls = [...(newAssignment.attachmentUrls || []), ...attachmentUrls];


      const assignmentData = {
        title: newAssignment.title,
        subject: newAssignment.subject,
        dueDate: newAssignment.dueDate,
        instructions: newAssignment.instructions,
        maxPoints: Number(newAssignment.maxPoints),
        attachmentUrls: finalAttachmentUrls,
        rubric: newAssignment.rubric,
        teacherId: auth.currentUser.uid,
        teacherName: auth.currentUser.displayName || 'Teacher',
        status: 'published', // Or derive from form if needed
        // totalSubmissions and averageGrade are typically updated by other processes
      };

      if (newAssignment.id) { // Update existing assignment
        assignmentData.updatedAt = new Date().toISOString();
        const assignmentDocRef = doc(db, 'assignments', newAssignment.id);
        await updateDoc(assignmentDocRef, assignmentData);
        setAssignments(assignments.map(a => a.id === newAssignment.id ? { ...a, ...assignmentData } : a));
        alert('Assignment updated successfully!');
      } else { // Create new assignment
        assignmentData.createdAt = new Date().toISOString();
        assignmentData.totalSubmissions = 0;
        assignmentData.averageGrade = 0;
        const docRef = await addDoc(collection(db, 'assignments'), assignmentData);
        setAssignments([{ id: docRef.id, ...assignmentData }, ...assignments]);
        alert('Assignment created successfully!');
      }
      
      setShowCreateModal(false);
      resetNewAssignmentForm();
    } catch (error) {
      console.error('Error saving assignment:', error);
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

  const removeAttachment = (index, isUrl = false) => {
    if (isUrl) {
        setNewAssignment(prev => ({
            ...prev,
            attachmentUrls: prev.attachmentUrls.filter((_, i) => i !== index)
        }));
    } else {
        setNewAssignment(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    }
  };

  const handleInputChange = (field, value) => {
    setNewAssignment(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleEditAssignment = (assignment) => {
    setNewAssignment({
      ...assignment,
      attachments: [], // Clear file input, URLs are separate
      attachmentUrls: assignment.attachmentUrls || [], // Keep existing URLs
    });
    setShowCreateModal(true);
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment? This will delete all student submissions as well.')) {
      return;
    }

    try {
      // First, get all submissions for this assignment
      const submissionsRef = collection(db, 'submissions');
      const q = query(submissionsRef, where('assignmentId', '==', assignmentId));
      const submissionsSnapshot = await getDocs(q);

      // Delete all submission documents from Firestore first
      const deleteSubmissionDocs = submissionsSnapshot.docs.map(async (submissionDoc) => {
        return deleteDoc(doc(db, 'submissions', submissionDoc.id));
      });

      // Attempt to delete submission files from storage, but don't let failures stop the process
      const submissionData = submissionsSnapshot.docs.map(doc => doc.data());
      for (const submission of submissionData) {
        if (submission.fileUrl) {
          try {
            const fileRef = ref(storage, submission.fileUrl);
            await deleteObject(fileRef);
          } catch (error) {
            // Log the error but continue with deletion process
            console.warn('Could not delete submission file:', error);
          }
        }
      }

      // Delete assignment files from storage
      const assignment = assignments.find(a => a.id === assignmentId);
      if (assignment && assignment.attachmentUrls) {
        for (const url of assignment.attachmentUrls) {
          try {
            const fileRef = ref(storage, url);
            await deleteObject(fileRef);
          } catch (error) {
            // Log the error but continue with deletion process
            console.warn('Could not delete assignment file:', error);
          }
        }
      }

      // Wait for all submission document deletions to complete
      await Promise.all(deleteSubmissionDocs);

      // Delete the assignment document
      await deleteDoc(doc(db, 'assignments', assignmentId));

      // Update local state to remove the assignment
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      
      alert('Assignment deleted successfully');
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('Error deleting assignment. Some resources may not have been fully cleaned up.');
    }
  };


  // --- Submissions Feature ---
  const fetchSubmissions = async (assignmentId) => {
    if (!assignmentId) return;
    setSubmissionsLoading(true);
    setError(null);
    try {
      const submissionsRef = collection(db, 'submissions');
      const q = query(
        submissionsRef,
        where('assignmentId', '==', assignmentId)
      );
      const querySnapshot = await getDocs(q);
      
      // Get all submissions and fetch student names
      const submissionsData = await Promise.all(
        querySnapshot.docs.map(async (submissionDoc) => {
          const data = submissionDoc.data();
          let studentName = 'Anonymous Student';
          let studentEmail = '';
          
          // Fetch student name from students collection
          if (data.studentId) {
            try {
              // First try to get from students collection
              const studentRef = doc(db, 'students', data.studentId);
              const studentSnap = await getDoc(studentRef);
              
              if (studentSnap.exists()) {
                const studentData = studentSnap.data();
                studentName = studentData.name || studentData.email || 'Anonymous Student';
                studentEmail = studentData.email || '';
              } else {
                // If not found in students, try users collection
                const userRef = doc(db, 'users', data.studentId);
                const userSnap = await getDoc(userRef);
                
                if (userSnap.exists()) {
                  const userData = userSnap.data();
                  studentName = userData.displayName || userData.email || 'Anonymous Student';
                  studentEmail = userData.email || '';
                }
              }
            } catch (error) {
              console.error('Error fetching student data:', error);
            }
          }

          return {
            id: submissionDoc.id,
            ...data,
            studentName,
            studentEmail,
            submittedAt: data.submittedAt?.toDate?.() || new Date(data.submittedAt),
            gradedAt: data.gradedAt?.toDate?.() || (data.gradedAt ? new Date(data.gradedAt) : null),
            status: data.grade !== null && data.grade !== undefined ? 'graded' : data.status || 'submitted'
          };
        })
      );

      // Sort the submissions by submittedAt date in memory
      submissionsData.sort((a, b) => b.submittedAt - a.submittedAt);
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError('Failed to load submissions');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleViewSubmissions = (assignment) => {
    setSelectedAssignmentForSubmissions(assignment);
    fetchSubmissions(assignment.id);
    setShowSubmissionsModal(true);
  };

  const SubmissionsViewModal = useMemo(() => {
    if (!selectedAssignmentForSubmissions) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4"> {/* Increased z-index */}
        <div className="bg-gray-800 rounded-xl p-6 sm:p-8 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto shadow-2xl">
          <button
            onClick={() => setShowSubmissionsModal(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-7 h-7" />
          </button>
          <h3 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Submissions for: <span className="text-white">{selectedAssignmentForSubmissions.title}</span>
          </h3>

          {submissionsLoading ? (
            <div className="flex flex-col justify-center items-center h-64">
              <svg className="animate-spin h-10 w-10 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="ml-3 mt-4 text-lg text-gray-300">Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ClipboardDocumentIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
              <p className="text-xl font-medium">No submissions yet for this assignment.</p>
              <p className="text-gray-500 mt-1">Students will appear here once they submit their work.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div key={submission.id} className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                          <span className="text-indigo-400 font-medium">
                            {submission.studentName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-200">{submission.studentName}</h4>
                          <p className="text-sm text-gray-400">{submission.studentEmail}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {submission.fileUrl && (
                          <a
                            href={submission.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-400 font-medium"
                          >
                            View Submission
                          </a>
                        )}
                        <button
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setShowFeedbackModal(true);
                          }}
                          className="text-blue-500 hover:text-blue-400 font-medium"
                        >
                          View Feedback
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setNewGrade(submission.grade?.toString() || '');
                            setNewFeedback(submission.feedback || '');
                            setShowGradeModal(true);
                          }}
                          className="text-blue-500 hover:text-blue-400 font-medium"
                        >
                          Edit Grade
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">
                          {submission.submittedAt.toLocaleDateString()}
                        </span>
                        <span className="text-sm text-gray-400">
                          {submission.submittedAt.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {submission.grade !== null && (
                          <span className={`px-2 py-1 rounded text-sm font-medium ${
                            submission.grade >= 90 ? 'bg-green-500/20 text-green-400' :
                            submission.grade >= 80 ? 'bg-blue-500/20 text-blue-400' :
                            submission.grade >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            Grade: {submission.grade}%
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          submission.status === 'graded' ? 'bg-green-500/20 text-green-400' :
                          submission.status === 'submitted' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
           <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSubmissionsModal(false)}
                className="px-6 py-2.5 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors text-white font-medium"
              >
                Close
              </button>
            </div>
        </div>
      </div>
    );
  }, [selectedAssignmentForSubmissions, submissions, submissionsLoading, setShowSubmissionsModal]);
  // --- End Submissions Feature ---


  const CreateAssignmentModal = useMemo(() => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 sm:p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto shadow-xl">
        <button
          onClick={() => { setShowCreateModal(false); resetNewAssignmentForm(); }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {newAssignment.id ? 'Edit Assignment' : 'Create New Assignment'}
        </h3>
        <form onSubmit={handleCreateOrUpdateAssignment} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Assignment Title *</label>
              <input
                type="text"
                value={newAssignment.title}
                onChange={e => handleInputChange('title', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500"
                placeholder="e.g., Chapter 5 Essay"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Subject *</label>
              <select
                value={newAssignment.subject}
                onChange={e => handleInputChange('subject', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="Literature">Literature</option>
                <option value="History">History</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Art">Art</option>
                <option value="Music">Music</option>
                <option value="Physical Education">Physical Education</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Instructions *</label>
            <textarea
              rows="4"
              value={newAssignment.instructions}
              onChange={e => handleInputChange('instructions', e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500"
              placeholder="Provide clear instructions for the assignment..."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Grading Rubric *</label>
            <textarea
              rows="4"
              value={newAssignment.rubric}
              onChange={e => handleInputChange('rubric', e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500"
              placeholder="Enter grading criteria and expectations..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Due Date *</label>
              <input
                type="datetime-local"
                value={newAssignment.dueDate}
                onChange={e => handleInputChange('dueDate', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Max Points *</label>
              <input
                type="number"
                min="1"
                value={newAssignment.maxPoints}
                onChange={e => handleInputChange('maxPoints', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500"
                placeholder="e.g., 100"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Attachments</label>
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              multiple
            />
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center w-full border-2 border-dashed border-gray-600 rounded-lg py-4 hover:border-blue-400 transition-colors cursor-pointer bg-gray-700/50"
            >
              <PlusIcon className="w-6 h-6 text-gray-400" />
              <span className="ml-2 text-gray-400">Click to Upload Files</span>
            </label>
            
            {(newAssignment.attachmentUrls?.length > 0 || newAssignment.attachments?.length > 0) && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-gray-400">Current files:</p>
                {newAssignment.attachmentUrls?.map((url, index) => (
                  <div key={`url-${index}`} className="flex items-center justify-between bg-gray-700/50 p-2 rounded text-sm">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate" title={url.substring(url.lastIndexOf('/') + 1).split('?')[0].split('%2F').pop()}>
                      {decodeURIComponent(url.substring(url.lastIndexOf('/') + 1).split('?')[0].split('%2F').pop().substring(14))} {/* Attempt to decode and clean up Firebase URL */}
                    </a>
                    <button type="button" onClick={() => removeAttachment(index, true)} className="text-red-400 hover:text-red-300 ml-2">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {newAssignment.attachments?.map((file, index) => (
                    typeof file !== 'string' && // Ensure it's a File object, not a URL string already handled
                    <div key={`file-${index}`} className="flex items-center justify-between bg-gray-700/50 p-2 rounded text-sm">
                    <span className="text-gray-300 truncate" title={file.name}>{file.name}</span>
                    <button type="button" onClick={() => removeAttachment(index, false)} className="text-red-400 hover:text-red-300 ml-2">
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                    </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => { setShowCreateModal(false); resetNewAssignmentForm(); }}
              className="px-6 py-2.5 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors text-white"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-2 text-white disabled:opacity-50"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {newAssignment.id ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                <>
                  <PlusIcon className="w-5 h-5" />
                  {newAssignment.id ? 'Save Changes' : 'Create Assignment'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  ), [
    newAssignment, uploading, handleCreateOrUpdateAssignment, handleFileUpload, removeAttachment, handleInputChange
  ]);

  const handleUpdateGrade = async (submissionId, grade, feedback) => {
    try {
      const submissionRef = doc(db, 'submissions', submissionId);
      const updatedData = {
        grade: Number(grade),
        feedback,
        gradedAt: new Date(),
        status: 'graded'
      };
      
      // Update in Firebase
      await updateDoc(submissionRef, updatedData);
      
      // Update local state while preserving all other submissions
      setSubmissions(prevSubmissions => 
        prevSubmissions.map(sub => 
          sub.id === submissionId 
            ? { 
                ...sub, 
                ...updatedData
              }
            : sub
        )
      );

      // Update the assignment's submissions count if needed
      if (selectedAssignmentForSubmissions) {
        const updatedSubmissions = submissions.map(sub => 
          sub.id === submissionId 
            ? { ...sub, ...updatedData }
            : sub
        );
        
        // Update the assignment's graded submissions count
        const gradedCount = updatedSubmissions.filter(sub => sub.status === 'graded').length;
        const assignmentRef = doc(db, 'assignments', selectedAssignmentForSubmissions.id);
        await updateDoc(assignmentRef, {
          gradedSubmissions: gradedCount
        });

        // Update the local assignment state
        setSelectedAssignmentForSubmissions(prev => ({
          ...prev,
          gradedSubmissions: gradedCount
        }));
      }
      
      // Close the modal and reset form
      setShowGradeModal(false);
      setSelectedSubmission(null);
      setNewGrade('');
      setNewFeedback('');

      // Show success message
      setSuccess('Grade updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating grade:', error);
      setError('Failed to update grade');
    }
  };

  const SubmissionsView = ({ assignment, onClose }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchSubmissions2 = async () => {
        try {
          const submissionsRef = collection(db, 'submissions');
          // Query without ordering to avoid needing a composite index
          const q = query(
            submissionsRef,
            where('assignmentId', '==', assignment.id)
          );
          const querySnapshot = await getDocs(q);
          
          // Get all submissions and fetch student names
          const submissionsData = await Promise.all(
            querySnapshot.docs.map(async (submissionDoc) => {
              const data = submissionDoc.data();
              let studentName = 'Anonymous Student';
              let studentEmail = '';
              
              // Fetch student name from students collection
              if (data.studentId) {
                const studentRef = doc(db, 'students', data.studentId);
                const studentSnap = await getDoc(studentRef);
                if (studentSnap.exists()) {
                  const studentData = studentSnap.data();
                  studentName = studentData.name || studentData.email || 'Anonymous Student';
                  studentEmail = studentData.email || '';
                }
              }

              return {
                id: submissionDoc.id,
                ...data,
                studentName,
                studentEmail,
                submittedAt: data.submittedAt?.toDate?.() || new Date(data.submittedAt),
                gradedAt: data.gradedAt?.toDate?.() || (data.gradedAt ? new Date(data.gradedAt) : null),
                status: data.grade !== null && data.grade !== undefined ? 'graded' : data.status || 'submitted'
              };
            })
          );

          // Sort the submissions by submittedAt date in memory
          submissionsData.sort((a, b) => b.submittedAt - a.submittedAt);
          setSubmissions(submissionsData);
        } catch (error) {
          console.error('Error fetching submissions:', error);
          setError('Failed to load submissions');
        } finally {
          setLoading(false);
        }
      };

      fetchSubmissions2();
    }, [assignment.id]);

    const formatDate = (date) => {
      if (!date) return 'N/A';
      const d = new Date(date);
      if (isNaN(d.getTime())) return 'Invalid Date';
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const getGradeColor = (grade, maxPoints) => {
      if (!grade || !maxPoints) return 'text-gray-400';
      const percentage = (grade / maxPoints) * 100;
      if (percentage >= 90) return 'text-green-400';
      if (percentage >= 80) return 'text-blue-400';
      if (percentage >= 70) return 'text-yellow-400';
      if (percentage >= 60) return 'text-orange-400';
      return 'text-red-400';
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">Submissions for {assignment.title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">
              <p>{error}</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No submissions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div key={submission.id} className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                          <span className="text-indigo-400 font-medium">
                            {submission.studentName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-200">{submission.studentName}</h4>
                          <p className="text-sm text-gray-400">{submission.studentEmail}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {submission.fileUrl && (
                          <a
                            href={submission.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-400 font-medium"
                          >
                            View Submission
                          </a>
                        )}
                        <button
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setShowFeedbackModal(true);
                          }}
                          className="text-blue-500 hover:text-blue-400 font-medium"
                        >
                          View Feedback
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setNewGrade(submission.grade?.toString() || '');
                            setNewFeedback(submission.feedback || '');
                            setShowGradeModal(true);
                          }}
                          className="text-blue-500 hover:text-blue-400 font-medium"
                        >
                          Edit Grade
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">
                          {submission.submittedAt.toLocaleDateString()}
                        </span>
                        <span className="text-sm text-gray-400">
                          {submission.submittedAt.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {submission.grade !== null && (
                          <span className={`px-2 py-1 rounded text-sm font-medium ${
                            submission.grade >= 90 ? 'bg-green-500/20 text-green-400' :
                            submission.grade >= 80 ? 'bg-blue-500/20 text-blue-400' :
                            submission.grade >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            Grade: {submission.grade}%
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          submission.status === 'graded' ? 'bg-green-500/20 text-green-400' :
                          submission.status === 'submitted' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Add formatDate function
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const GradesAndAnalysis = ({ assignment }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchSubmissions = async () => {
        if (!assignment?.id) return;
        
        setLoading(true);
        setError(null);
        
        try {
          const submissionsRef = collection(db, 'submissions');
          const q = query(
            submissionsRef,
            where('assignmentId', '==', assignment.id)
          );
          const querySnapshot = await getDocs(q);
          
          // Get all submissions and fetch student names
          const submissionsData = await Promise.all(
            querySnapshot.docs.map(async (submissionDoc) => {
              const data = submissionDoc.data();
              let studentName = 'Anonymous Student';
              let studentEmail = '';
              
              // Fetch student name from students collection
              if (data.studentId) {
                try {
                  // First try to get from students collection
                  const studentRef = doc(db, 'students', data.studentId);
                  const studentSnap = await getDoc(studentRef);
                  
                  if (studentSnap.exists()) {
                    const studentData = studentSnap.data();
                    studentName = studentData.name || studentData.email || 'Anonymous Student';
                    studentEmail = studentData.email || '';
                  } else {
                    // If not found in students, try users collection
                    const userRef = doc(db, 'users', data.studentId);
                    const userSnap = await getDoc(userRef);
                    
                    if (userSnap.exists()) {
                      const userData = userSnap.data();
                      studentName = userData.displayName || userData.email || 'Anonymous Student';
                      studentEmail = userData.email || '';
                    }
                  }
                } catch (error) {
                  console.error('Error fetching student data:', error);
                }
              }

              return {
                id: submissionDoc.id,
                ...data,
                studentName,
                studentEmail,
                submittedAt: data.submittedAt?.toDate?.() || new Date(data.submittedAt),
                gradedAt: data.gradedAt?.toDate?.() || (data.gradedAt ? new Date(data.gradedAt) : null),
                status: data.grade !== null && data.grade !== undefined ? 'graded' : data.status || 'submitted'
              };
            })
          );

          // Sort the submissions by submittedAt date in memory
          submissionsData.sort((a, b) => b.submittedAt - a.submittedAt);
          setSubmissions(submissionsData);
        } catch (error) {
          console.error('Error fetching submissions:', error);
          setError('Failed to load submissions');
        } finally {
          setLoading(false);
        }
      };

      fetchSubmissions();
    }, [assignment?.id]);

    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-red-500 p-4 text-center">
          {error}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Submission Statistics</h3>
            <div className="space-y-2">
              <p className="text-gray-400">Total Submissions: {submissions.length}</p>
              <p className="text-gray-400">Graded: {submissions.filter(s => s.status === 'graded').length}</p>
              <p className="text-gray-400">Pending: {submissions.filter(s => s.status === 'submitted').length}</p>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Grade Distribution</h3>
            <div className="space-y-2">
              <p className="text-green-400">A (90-100): {submissions.filter(s => s.grade >= 90).length}</p>
              <p className="text-blue-400">B (80-89): {submissions.filter(s => s.grade >= 80 && s.grade < 90).length}</p>
              <p className="text-yellow-400">C (70-79): {submissions.filter(s => s.grade >= 70 && s.grade < 80).length}</p>
              <p className="text-red-400">Below 70: {submissions.filter(s => s.grade < 70).length}</p>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Average Grade</h3>
            <p className="text-2xl font-bold text-indigo-400">
              {submissions.length > 0
                ? (submissions.reduce((acc, s) => acc + (s.grade || 0), 0) / submissions.length).toFixed(1)
                : 0}%
            </p>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Detailed Grades</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="pb-2">Student</th>
                  <th className="pb-2">Grade</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id} className="border-b border-gray-700/50">
                    <td className="py-3">
                      <div>
                        <p className="text-gray-200">
                          {submission.studentName !== 'Anonymous Student' 
                            ? submission.studentName 
                            : submission.studentEmail || 'Unknown Student'}
                        </p>
                        {submission.studentEmail && (
                          <p className="text-sm text-gray-400">{submission.studentEmail}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        submission.grade >= 90 ? 'bg-green-500/20 text-green-400' :
                        submission.grade >= 80 ? 'bg-blue-500/20 text-blue-400' :
                        submission.grade >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {submission.grade || 'Not Graded'}%
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        submission.status === 'graded' ? 'bg-green-500/20 text-green-400' :
                        submission.status === 'submitted' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400">
                      {submission.submittedAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-800 border-r border-gray-700/50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } z-40 flex flex-col`} // z-index lower than modals
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
             {/* Button to toggle sidebar, can be placed here or in main content header */}
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 lg:hidden">
                <XMarkIcon className="w-6 h-6"/>
             </button>
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
        <div className="mt-auto p-6">
          <button 
            onClick={() => auth.signOut()} 
            className="w-full flex items-center gap-3 p-3 text-gray-300 hover:bg-red-600/30 hover:text-red-300 rounded-lg transition-all duration-300 group"
          >
            <ArrowTrendingUpIcon className="w-5 h-5 transform rotate-180" /> {/* Placeholder for LogoutIcon */}
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 p-6 sm:p-8 overflow-y-auto relative transition-margin duration-300 ${
        isSidebarOpen ? 'ml-0 lg:ml-64' : 'ml-0' // Adjust margin for responsive sidebar
      }`}>
         {/* Hamburger for mobile to open sidebar */}
        <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className={`fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 lg:hidden ${isSidebarOpen ? 'hidden' : 'block'}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
        </button>

        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Assignment Management
                </span>
              </h2>
              <p className="text-gray-400 text-base sm:text-lg">
                Manage assignments, track progress, and analyze student performance.
              </p>
            </div>
            <button 
              onClick={() => { resetNewAssignmentForm(); setShowCreateModal(true); }}
              className="flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-sm sm:text-base font-medium"
            >
              <PlusIcon className="w-5 h-5" />
              New Assignment
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Assignments', value: assignments.length, icon: DocumentTextIcon, color: 'blue' },
            { 
              title: 'Total Submissions', // Changed from Pending Submissions for clarity
              value: assignments.reduce((sum, a) => sum + (a.totalSubmissions || 0), 0), 
              icon: ClipboardDocumentIcon, 
              color: 'purple' 
            },
            { 
              title: 'Avg. Class Grade', // Assuming this is overall average
              value: assignments.length > 0 
                ? `${Math.round(assignments.reduce((sum, a) => sum + (a.averageGrade || 0) * (a.totalSubmissions || 0), 0) / Math.max(1, assignments.reduce((sum, a) => sum + (a.totalSubmissions || 0), 0)) ) || 0}%` 
                : 'N/A', 
              icon: AcademicCapIcon, 
              color: 'green' 
            },
            { 
              title: 'Upcoming Due Dates', // Example different stat
              value: assignments.filter(a => new Date(a.dueDate) > new Date()).length, 
              icon: CalendarIcon, 
              color: 'indigo' 
            },
          ].map((stat, index) => (
            <div key={index} className={`bg-gradient-to-br from-${stat.color}-600/30 to-${stat.color}-600/10 p-5 sm:p-6 rounded-xl border border-${stat.color}-500/30 hover:shadow-xl transition-all`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">{stat.title}</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <stat.icon className={`w-10 h-10 sm:w-12 sm:h-12 p-2 sm:p-2.5 rounded-full bg-${stat.color}-500/20 text-${stat.color}-400`} />
              </div>
              {/* Optional: Progress bar example - not directly applicable to all stats here
              <div className="mt-4">
                <div className="h-1.5 bg-gray-700 rounded-full">
                  <div 
                    className={`h-full bg-${stat.color}-500 rounded-full transition-all duration-500`}
                    style={{ width: `...%` }} // Calculate width based on stat if applicable
                  />
                </div>
              </div>
              */}
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assignment List */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-6 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <ClipboardDocumentIcon className="w-6 h-6 text-purple-400" />
                  Assignments Overview
                </h3>
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search by title or subject..."
                    className="bg-gray-700 text-white rounded-lg px-4 py-2.5 pr-10 w-full focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <ChevronUpDownIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="text-center text-gray-400 py-10">Loading assignments...</div>
                ) : assignments.length === 0 ? (
                  <div className="text-center py-12 bg-gray-700/30 rounded-lg">
                    <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-300">No assignments found.</h3>
                    <p className="text-gray-400 mt-1 text-sm">Click "New Assignment" to create your first one.</p>
                  </div>
                ) : (
                  assignments
                    .filter(assignment => 
                      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      assignment.subject.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)) // Sort by most recent
                    .map((assignment) => (
                      <div key={assignment.id} className="bg-white rounded-lg shadow-md p-6 mb-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-800">{assignment.title}</h3>
                            <p className="text-gray-600 mt-1">{assignment.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedSubmission(assignment);
                                setShowSubmissions(true);
                              }}
                              className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                              title="View Submissions"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAssignment(assignment);
                                setShowEditModal(true);
                              }}
                              className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                              title="Edit Assignment"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAssignment(assignment.id)}
                              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                              title="Delete Assignment"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Due Date:</span>
                            <p className="font-medium">{formatDate(assignment.dueDate)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Total Points:</span>
                            <p className="font-medium">{assignment.totalPoints}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Status:</span>
                            <p className="font-medium">{assignment.status}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Submissions:</span>
                            <p className="font-medium">{assignment.submissions?.length || 0}</p>
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
            <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-6 h-6 text-green-400" />
                Class Performance
              </h3>
              <div className="flex items-center justify-center h-56 sm:h-60"> {/* Fixed height for PieChart container */}
                <PieChart width={240} height={240}> {/* Adjust size as needed */}
                  <Pie
                    data={performanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55} // Adjusted for better look
                    outerRadius={85} // Adjusted for better look
                    fill="#8884d8"
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
                {performanceData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-gray-300">{entry.name}:</span>
                    <span className="text-white font-medium">{entry.value} students</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <ArrowTrendingUpIcon className="w-6 h-6 text-indigo-400" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                {[
                  { title: 'Manage Classes', Icon: EducatorUserGroupIcon, color: 'blue', link: '#' },
                  { title: 'Full Gradebook', Icon: AcademicCapIcon, color: 'purple', link: '/grading-system' },
                  { title: 'Generate Reports', Icon: ChartBarIcon, color: 'green', link: '#' },
                ].map(action => (
                  <Link 
                    to={action.link} 
                    key={action.title} 
                    className={`w-full flex items-center gap-3 p-3 bg-${action.color}-600/20 hover:bg-${action.color}-600/30 rounded-lg transition-colors group`}
                  >
                    <action.Icon className={`w-5 h-5 text-${action.color}-400 group-hover:text-${action.color}-300`} />
                    <span className={`text-sm font-medium text-gray-200 group-hover:text-${action.color}-300`}>{action.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      {showCreateModal && CreateAssignmentModal}
      {showSubmissionsModal && SubmissionsViewModal}
      {showSubmissions && selectedSubmission && (
        <SubmissionsView
          assignment={selectedSubmission}
          onClose={() => {
            setShowSubmissions(false);
            setSelectedSubmission(null);
          }}
        />
      )}
      {showFeedbackModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-200">Feedback for {selectedSubmission.studentName}</h3>
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setSelectedSubmission(null);
                }}
                className="text-gray-400 hover:text-gray-300"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Grade</p>
                <p className="text-gray-200">{selectedSubmission.grade}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Feedback</p>
                <p className="text-gray-200 whitespace-pre-wrap">{selectedSubmission.feedback || 'No feedback provided'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {showGradeModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-200">Edit Grade for {selectedSubmission.studentName}</h3>
              <button
                onClick={() => {
                  setShowGradeModal(false);
                  setSelectedSubmission(null);
                  setNewGrade('');
                  setNewFeedback('');
                }}
                className="text-gray-400 hover:text-gray-300"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Grade (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Feedback</label>
                <textarea
                  value={newFeedback}
                  onChange={(e) => setNewFeedback(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowGradeModal(false);
                    setSelectedSubmission(null);
                    setNewGrade('');
                    setNewFeedback('');
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateGrade(selectedSubmission.id, newGrade, newFeedback)}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {success && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {success}
        </div>
      )}
    </div>
  );
};

export default AssignmentManagement;