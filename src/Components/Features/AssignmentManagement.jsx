import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Added useLocation for active sidebar link
import { storage, db, auth } from '../../firebase/firebaseConfig';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, getDoc } from 'firebase/firestore'; // Removed orderBy as it's not used in main fetch
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import {
  ClipboardDocumentIcon,
  CalendarIcon,
  DocumentTextIcon,
  FolderIcon,
  UsersIcon,
  ChartBarIcon,
  AcademicCapIcon,
  PresentationChartLineIcon,
  UserGroupIcon as SolidUserGroupIcon,
  GlobeAltIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowTrendingUpIcon, // Consider ArrowRightOnRectangleIcon for logout
  ChevronUpDownIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  SparklesIcon,
  EnvelopeIcon,
  VideoCameraIcon,
  UserGroupIcon as EducatorUserGroupIcon,
  MegaphoneIcon,
  EyeIcon,
  ArrowUpTrayIcon, // For file upload
  ExclamationTriangleIcon, // For empty states or errors
  CheckCircleIcon, // For success messages
  Bars3Icon, // Hamburger icon
} from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'; // Added ResponsiveContainer and Tooltip

const AssignmentManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null); // General error
  const [success, setSuccess] = useState(null); // General success message

  const location = useLocation(); // For active sidebar link

  const initialNewAssignmentState = {
    title: '',
    subject: 'Mathematics',
    dueDate: '',
    instructions: '',
    maxPoints: 100,
    attachments: [],
    attachmentUrls: [],
    rubric: '',
    // totalSubmissions will be managed by server/other processes
    // createdAt will be set on creation
    status: 'draft', // Default status
    id: null,
  };
  const [newAssignment, setNewAssignment] = useState(initialNewAssignmentState);

  // State for submissions modal
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedAssignmentForSubmissions, setSelectedAssignmentForSubmissions] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsError, setSubmissionsError] = useState(null);


  const [selectedSubmissionForGrading, setSelectedSubmissionForGrading] = useState(null); // Renamed for clarity
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [newGrade, setNewGrade] = useState('');
  const [newFeedback, setNewFeedback] = useState('');

  const educatorMenu = [
    { title: 'Dashboard', Icon: PresentationChartLineIcon, link: '/educator-dashboard' },
    { title: 'Assignments', Icon: ClipboardDocumentIcon, link: '/assignment-management' },
    { title: 'Tests', Icon: DocumentTextIcon, link: '/teacher-tests' }, // Changed Icon for variety
    { title: 'Grades & Analytics', Icon: AcademicCapIcon, link: '/GradesAndAnalytics' },
    { title: 'Resources', Icon: FolderIcon, link: '/resource-management' },
    { title: 'Attendance', Icon: UsersIcon, link: '/attendance-tracking' }, // Changed Icon
    { title: 'Voice Chat', Icon: ChatBubbleLeftRightIcon, link: '/teacher-voice-chat' },
    { title: 'AI Chatbot (Ask Sparky)', Icon: LightBulbIcon, link: '/chatbot-education' }, // Changed Icon
    { title: 'AI Questions', Icon: SparklesIcon, link: '/ai-generated-questions' },
    { title: 'Social / Chat', Icon: SolidUserGroupIcon, link: '/chat-functionality' },
    { title: 'Educational News', Icon: GlobeAltIcon, link: '/educational-news' },
    { title: 'Student Suggestions', Icon: EnvelopeIcon, link: '/suggestions-to-students' },
    { title: 'Meetings & Conferences', Icon: VideoCameraIcon, link: '/meeting-host' },
    { title: 'Announcements', Icon: MegaphoneIcon, link: '/announcements' },
    { title: 'Upgrade to Pro', Icon: SparklesIcon, link: '/pricing', special: true },
  ];

  const performanceData = [ // Example data, should be dynamic
    { name: 'A (90+)', value: 24, color: '#34d399' }, // Emerald
    { name: 'B (80-89)', value: 30, color: '#60a5fa' }, // Sky
    { name: 'C (70-79)', value: 25, color: '#fbbf24' }, // Amber
    { name: 'D (60-69)', value: 15, color: '#f87171' }, // Red
    { name: 'F (<60)', value: 6, color: '#ec4899' },   // Pink
  ];

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Effect to close sidebar on route change on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) { // lg breakpoint
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!auth.currentUser) {
        console.warn("User not authenticated. Cannot fetch assignments.");
        setError("Authentication required to fetch assignments.");
        setLoading(false);
        return;
      }
      const assignmentsRef = collection(db, 'assignments');
      const q = query(assignmentsRef, where('teacherId', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const assignmentsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Ensure date fields are Date objects for consistent formatting/sorting
        dueDate: doc.data().dueDate ? new Date(doc.data().dueDate) : null,
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt),
      }));
      setAssignments(assignmentsList.sort((a,b) => b.createdAt - a.createdAt)); // Sort by creation date desc
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to load assignments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetNewAssignmentForm = () => {
    setNewAssignment(initialNewAssignmentState);
  };

  const displayMessage = (type, message) => {
    if (type === 'success') setSuccess(message);
    else setError(message);
    setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 3000);
  };

  const handleCreateOrUpdateAssignment = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError(null);
    
    if (!newAssignment.title || !newAssignment.instructions || !newAssignment.rubric || !newAssignment.dueDate) {
      displayMessage('error','Please fill all required fields: Title, Instructions, Rubric, and Due Date.');
      setUploading(false);
      return;
    }
    if (!auth.currentUser) {
      displayMessage('error',"User not authenticated. Please log in.");
      setUploading(false);
      return;
    }

    try {
      // Handle file uploads
      const uploadedAttachmentUrls = await Promise.all(
        newAssignment.attachments.map(async (file) => {
          if (typeof file === 'string') return file; // Already a URL
          const uniqueFileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`; // Ensure unique and web-safe names
          const storageRef = ref(storage, `assignments/${auth.currentUser.uid}/${uniqueFileName}`);
          await uploadBytes(storageRef, file);
          return getDownloadURL(storageRef);
        })
      );
      
      const finalAttachmentUrls = [...(newAssignment.attachmentUrls || []), ...uploadedAttachmentUrls];

      const assignmentData = {
        title: newAssignment.title,
        subject: newAssignment.subject,
        dueDate: newAssignment.dueDate, // Already a string from datetime-local
        instructions: newAssignment.instructions,
        maxPoints: Number(newAssignment.maxPoints),
        attachmentUrls: finalAttachmentUrls,
        rubric: newAssignment.rubric,
        teacherId: auth.currentUser.uid,
        teacherName: auth.currentUser.displayName || auth.currentUser.email || 'Teacher', // Fallback to email
        status: newAssignment.status || 'published', // Default to published if not set
      };

      if (newAssignment.id) { // Update
        assignmentData.updatedAt = new Date().toISOString();
        const assignmentDocRef = doc(db, 'assignments', newAssignment.id);
        await updateDoc(assignmentDocRef, assignmentData);
        // fetchAssignments(); // Re-fetch to get updated sorted list and consistent data types
        displayMessage('success','Assignment updated successfully!');
      } else { // Create
        assignmentData.createdAt = new Date().toISOString();
        assignmentData.totalSubmissions = 0; // Initialize
        assignmentData.gradedSubmissions = 0; // Initialize
        assignmentData.averageGrade = 0; // Initialize
        await addDoc(collection(db, 'assignments'), assignmentData);
        displayMessage('success', 'Assignment created successfully!');
      }
      fetchAssignments(); // Re-fetch for both create and update to ensure UI consistency
      setShowCreateModal(false);
      resetNewAssignmentForm();
    } catch (err) {
      console.error('Error saving assignment:', err);
      displayMessage('error',`Error saving assignment: ${err.message}`);
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
    // Note: Deleting from storage on removal here can be complex if the form isn't submitted.
    // Usually, storage deletion is handled if an existing assignment's attachment is removed and saved.
    // For simplicity, this just removes from the form state. Actual deletion of orphaned files needs a strategy.
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
  
  const handleEditAssignment = (assignmentToEdit) => {
    setNewAssignment({
      ...initialNewAssignmentState, // Start with defaults
      ...assignmentToEdit, // Override with existing data
      dueDate: assignmentToEdit.dueDate ? new Date(assignmentToEdit.dueDate).toISOString().substring(0, 16) : '', // Format for datetime-local
      attachments: [], // Clear file input; URLs are handled by attachmentUrls
      attachmentUrls: assignmentToEdit.attachmentUrls || [],
    });
    setShowCreateModal(true);
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment? This will permanently delete all associated student submissions and files.')) {
      return;
    }
    setLoading(true); // Indicate processing
    try {
      const assignmentToDelete = assignments.find(a => a.id === assignmentId);

      // 1. Delete all submissions for this assignment
      const submissionsQuery = query(collection(db, 'submissions'), where('assignmentId', '==', assignmentId));
      const submissionsSnapshot = await getDocs(submissionsQuery);

      for (const submissionDoc of submissionsSnapshot.docs) {
        const submissionData = submissionDoc.data();
        // Delete submission file from storage
        if (submissionData.fileUrl) {
          try {
            const fileRef = ref(storage, submissionData.fileUrl);
            await deleteObject(fileRef);
          } catch (storageError) {
            console.warn(`Could not delete submission file ${submissionData.fileUrl}:`, storageError);
            // Continue deletion even if a file fails
          }
        }
        // Delete submission document from Firestore
        await deleteDoc(doc(db, 'submissions', submissionDoc.id));
      }

      // 2. Delete assignment files from storage
      if (assignmentToDelete && assignmentToDelete.attachmentUrls) {
        for (const url of assignmentToDelete.attachmentUrls) {
          try {
            const fileRef = ref(storage, url);
            await deleteObject(fileRef);
          } catch (storageError) {
            console.warn(`Could not delete assignment file ${url}:`, storageError);
          }
        }
      }

      // 3. Delete the assignment document
      await deleteDoc(doc(db, 'assignments', assignmentId));

      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      displayMessage('success','Assignment and all related data deleted successfully.');
    } catch (err) {
      console.error('Error deleting assignment:', err);
      displayMessage('error','Error deleting assignment. Some resources may not have been fully cleaned up.');
    } finally {
      setLoading(false);
    }
  };


  const fetchSubmissions = async (assignmentId) => {
    if (!assignmentId) return;
    setSubmissionsLoading(true);
    setSubmissionsError(null);
    try {
      const submissionsRef = collection(db, 'submissions');
      const q = query(submissionsRef, where('assignmentId', '==', assignmentId));
      const querySnapshot = await getDocs(q);
      
      const submissionsData = await Promise.all(
        querySnapshot.docs.map(async (submissionDoc) => {
          const data = submissionDoc.data();
          let studentName = 'Anonymous';
          let studentEmail = 'N/A';
          
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
            submittedAt: data.submittedAt?.toDate ? data.submittedAt.toDate() : new Date(data.submittedAt),
            gradedAt: data.gradedAt?.toDate ? data.gradedAt.toDate() : (data.gradedAt ? new Date(data.gradedAt) : null),
            status: data.grade !== null && data.grade !== undefined ? 'graded' : data.status || 'submitted'
          };
        })
      );

      setSubmissions(submissionsData.sort((a, b) => b.submittedAt - a.submittedAt));
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setSubmissionsError('Failed to load submissions. Please try again.');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleViewSubmissions = (assignment) => {
    setSelectedAssignmentForSubmissions(assignment);
    fetchSubmissions(assignment.id);
    setShowSubmissionsModal(true);
  };

  const handleUpdateGradeAndFeedback = async () => {
    if (!selectedSubmissionForGrading) return;
    setUploading(true); // Use uploading state for this action too
    try {
      const submissionRef = doc(db, 'submissions', selectedSubmissionForGrading.id);
      const updatedData = {
        grade: Number(newGrade),
        feedback: newFeedback,
        gradedAt: new Date().toISOString(),
        status: 'graded'
      };
      
      await updateDoc(submissionRef, updatedData);
      
      // Update local submissions state
      setSubmissions(prevSubmissions => 
        prevSubmissions.map(sub => 
          sub.id === selectedSubmissionForGrading.id ? { ...sub, ...updatedData } : sub
        )
      );
      
      // Update assignment's gradedSubmissions count and averageGrade
      if (selectedAssignmentForSubmissions) {
          const assignmentSubmissions = submissions.map(sub => 
              sub.id === selectedSubmissionForGrading.id ? { ...sub, ...updatedData } : sub
          );
          const gradedSubmissions = assignmentSubmissions.filter(s => s.status === 'graded');
          const totalGradedPoints = gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0);
          const averageGrade = gradedSubmissions.length > 0 ? totalGradedPoints / gradedSubmissions.length : 0;

          const assignmentRef = doc(db, 'assignments', selectedAssignmentForSubmissions.id);
          await updateDoc(assignmentRef, {
              gradedSubmissions: gradedSubmissions.length,
              averageGrade: parseFloat(averageGrade.toFixed(2)),
              // Potentially update totalSubmissions if it's not accurate
          });
          // Optimistically update local assignment state for stats cards
          setAssignments(prevAssignments => prevAssignments.map(a => 
              a.id === selectedAssignmentForSubmissions.id ? {
                  ...a, 
                  gradedSubmissions: gradedSubmissions.length,
                  averageGrade: parseFloat(averageGrade.toFixed(2))
              } : a
          ));
      }
      
      setShowGradeModal(false);
      setSelectedSubmissionForGrading(null);
      setNewGrade('');
      setNewFeedback('');
      displayMessage('success', 'Grade and feedback updated successfully!');
    } catch (err) {
      console.error('Error updating grade:', err);
      displayMessage('error', 'Failed to update grade. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateInput, options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) => {
    if (!dateInput) return 'N/A';
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString(undefined, options);
  };

  const getGradeColorClass = (grade, maxPoints = 100) => {
    if (grade === null || grade === undefined) return 'bg-gray-500/20 text-gray-300';
    const percentage = (Number(grade) / Number(maxPoints)) * 100;
    if (percentage >= 90) return 'bg-emerald-500/20 text-emerald-400';
    if (percentage >= 80) return 'bg-sky-500/20 text-sky-400';
    if (percentage >= 70) return 'bg-amber-500/20 text-amber-400';
    if (percentage >= 60) return 'bg-orange-500/20 text-orange-400';
    return 'bg-red-500/20 text-red-400';
  };

  const getStatusColorClass = (status) => {
    if (status === 'graded') return 'bg-emerald-500/20 text-emerald-400';
    if (status === 'submitted') return 'bg-sky-500/20 text-sky-400';
    if (status === 'draft') return 'bg-amber-500/20 text-amber-400';
    return 'bg-gray-500/20 text-gray-300';
  };

  // Memoized Modals
  const CreateAssignmentModal = useMemo(() => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-gray-800 rounded-xl p-6 sm:p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700">
        <button
          onClick={() => { setShowCreateModal(false); resetNewAssignmentForm(); }}
          className="absolute top-4 right-4 text-gray-400 hover:text-sky-400 transition-colors"
        >
          <XMarkIcon className="w-7 h-7" />
        </button>
        <h3 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
          {newAssignment.id ? 'Edit Assignment' : 'Create New Assignment'}
        </h3>
        <form onSubmit={handleCreateOrUpdateAssignment} className="space-y-6">
          {/* Form fields (Inputs, Textareas, Selects) */}
          {/* Title and Subject */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Assignment Title *</label>
              <input id="title" type="text" value={newAssignment.title} onChange={e => handleInputChange('title', e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none placeholder-gray-500 transition-colors"
                placeholder="e.g., Chapter 5 Essay" required />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">Subject *</label>
              <select id="subject" value={newAssignment.subject} onChange={e => handleInputChange('subject', e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors" required>
                {['Mathematics', 'Science', 'Literature', 'History', 'Computer Science', 'Art', 'Music', 'Physical Education', 'Other'].map(subj => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Instructions */}
          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-300 mb-1">Instructions *</label>
            <textarea id="instructions" rows="4" value={newAssignment.instructions} onChange={e => handleInputChange('instructions', e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none placeholder-gray-500 transition-colors"
              placeholder="Provide clear instructions for the assignment..." required />
          </div>
          {/* Rubric */}
          <div>
            <label htmlFor="rubric" className="block text-sm font-medium text-gray-300 mb-1">Grading Rubric *</label>
            <textarea id="rubric" rows="4" value={newAssignment.rubric} onChange={e => handleInputChange('rubric', e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none placeholder-gray-500 transition-colors"
              placeholder="Enter grading criteria and expectations..." required />
          </div>
          {/* Due Date and Max Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-300 mb-1">Due Date *</label>
              <input id="dueDate" type="datetime-local" value={newAssignment.dueDate} onChange={e => handleInputChange('dueDate', e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors" required />
            </div>
            <div>
              <label htmlFor="maxPoints" className="block text-sm font-medium text-gray-300 mb-1">Max Points *</label>
              <input id="maxPoints" type="number" min="1" value={newAssignment.maxPoints} onChange={e => handleInputChange('maxPoints', e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none placeholder-gray-500 transition-colors"
                placeholder="e.g., 100" required />
            </div>
          </div>
           {/* Status (Optional, if you want to set it during creation/edit) */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <select id="status" value={newAssignment.status} onChange={e => handleInputChange('status', e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Attachments</label>
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-600 hover:border-sky-500 rounded-lg p-6 cursor-pointer bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
              <ArrowUpTrayIcon className="w-10 h-10 text-gray-400 group-hover:text-sky-400" />
              <span className="mt-2 text-sm text-gray-400">Click to Upload or Drag & Drop</span>
              <input id="file-upload" type="file" onChange={handleFileUpload} className="hidden" multiple />
            </label>
            {(newAssignment.attachmentUrls?.length > 0 || newAssignment.attachments?.length > 0) && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-gray-400">Attached files:</p>
                {newAssignment.attachmentUrls?.map((url, index) => (
                  <div key={`url-${index}`} className="flex items-center justify-between bg-gray-700 p-2 rounded-md text-sm">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline truncate" title={decodeURIComponent(url.substring(url.lastIndexOf('/') + 1).split('?')[0].split('%2F').pop())}>
                      <DocumentTextIcon className="w-4 h-4 inline mr-2" />
                      {decodeURIComponent(url.substring(url.lastIndexOf('/') + 1).split('?')[0].split('%2F').pop().substring(14))}
                    </a>
                    <button type="button" onClick={() => removeAttachment(index, true)} className="text-red-400 hover:text-red-300 ml-2 p-1 rounded-full hover:bg-red-500/20">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {newAssignment.attachments?.filter(file => typeof file !== 'string').map((file, index) => (
                    <div key={`file-${index}`} className="flex items-center justify-between bg-gray-700 p-2 rounded-md text-sm">
                      <span className="text-gray-300 truncate" title={file.name}><DocumentTextIcon className="w-4 h-4 inline mr-2" />{file.name}</span>
                      <button type="button" onClick={() => removeAttachment(index, false)} className="text-red-400 hover:text-red-300 ml-2 p-1 rounded-full hover:bg-red-500/20">
                          <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                ))}
              </div>
            )}
          </div>
          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={() => { setShowCreateModal(false); resetNewAssignmentForm(); }}
              className="px-6 py-2.5 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors text-white font-medium" disabled={uploading}>
              Cancel
            </button>
            <button type="submit"
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 transition-all flex items-center gap-2 text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={uploading}>
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
  ), [newAssignment, uploading, handleCreateOrUpdateAssignment, handleFileUpload, removeAttachment, handleInputChange]);

  const SubmissionsViewModal = useMemo(() => {
    if (!selectedAssignmentForSubmissions) return null;

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4 transition-opacity duration-300">
        <div className="bg-gray-800 rounded-xl p-6 sm:p-8 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700">
          <button
            onClick={() => setShowSubmissionsModal(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-teal-400 transition-colors z-10"
          >
            <XMarkIcon className="w-7 h-7" />
          </button>
          <h3 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Submissions: <span className="text-gray-200">{selectedAssignmentForSubmissions.title}</span>
          </h3>

          {submissionsLoading ? (
            <div className="flex flex-col justify-center items-center h-64 text-gray-300">
              <svg className="animate-spin h-10 w-10 text-teal-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading submissions...
            </div>
          ) : submissionsError ? (
            <div className="text-center py-12 text-red-400 bg-red-500/10 rounded-lg">
              <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-red-500 mb-4" />
              <p className="text-xl font-medium">{submissionsError}</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-gray-700/30 rounded-lg">
              <ClipboardDocumentIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
              <p className="text-xl font-medium">No submissions yet.</p>
              <p className="text-gray-500 mt-1">Student submissions will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div key={submission.id} className="bg-gray-700/50 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow border border-gray-600/50">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex items-center gap-3 flex-grow">
                      <div className={`w-10 h-10 rounded-full ${getGradeColorClass(submission.grade, selectedAssignmentForSubmissions.maxPoints).split(' ')[0]} opacity-50 flex items-center justify-center ring-2 ${getGradeColorClass(submission.grade, selectedAssignmentForSubmissions.maxPoints).split(' ')[1].replace('text-', 'ring-')}/50`}>
                        <span className="text-lg font-medium text-white">
                          {submission.studentName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-100">{submission.studentName}</h4>
                        <p className="text-sm text-gray-400">{submission.studentEmail}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Submitted: {formatDate(submission.submittedAt)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                       <div className="flex items-center gap-2">
                          {submission.grade !== null && submission.grade !== undefined && (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getGradeColorClass(submission.grade, selectedAssignmentForSubmissions.maxPoints)}`}>
                              {submission.grade}/{selectedAssignmentForSubmissions.maxPoints} pts
                            </span>
                          )}
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColorClass(submission.status)}`}>
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </span>
                        </div>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {submission.fileUrl && (
                          <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-medium transition-colors">
                            <EyeIcon className="w-4 h-4" /> View Work
                          </a>
                        )}
                        <button onClick={() => { setSelectedSubmissionForGrading(submission); setShowFeedbackModal(true); }}
                          className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-medium transition-colors">
                          <ChatBubbleLeftRightIcon className="w-4 h-4" /> Feedback
                        </button>
                        <button onClick={() => {
                            setSelectedSubmissionForGrading(submission);
                            setNewGrade(submission.grade?.toString() || '');
                            setNewFeedback(submission.feedback || '');
                            setShowGradeModal(true);
                          }}
                          className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 font-medium transition-colors">
                          <PencilIcon className="w-4 h-4" /> Grade/Revise
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
           <div className="mt-8 flex justify-end">
              <button type="button" onClick={() => setShowSubmissionsModal(false)}
                className="px-6 py-2.5 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors text-white font-medium">
                Close
              </button>
            </div>
        </div>
      </div>
    );
  }, [selectedAssignmentForSubmissions, submissions, submissionsLoading, submissionsError, setShowSubmissionsModal, fetchSubmissions, formatDate]);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 border-r border-gray-700/60 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } z-40 flex flex-col shadow-lg lg:translate-x-0`} // Always visible on lg+
      >
        <div className="p-5 border-b border-gray-700/60">
          <div className="flex items-center justify-between">
             <Link to="/educator-dashboard" className="flex items-center gap-2.5">
                <SparklesIcon className="w-8 h-8 text-sky-400" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-sky-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent">
                    SPARK IQ
                </h1>
             </Link>
             <button onClick={() => setIsSidebarOpen(false)} className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 lg:hidden">
                <XMarkIcon className="w-6 h-6"/>
             </button>
          </div>
        </div>
        <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
          {educatorMenu.map((item) => (
            <Link
              key={item.title}
              to={item.link}
              className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg transition-all duration-200 group
                ${item.link === location.pathname 
                  ? 'bg-gradient-to-r from-sky-500/80 to-purple-500/80 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-sky-300'}
                ${item.special ? 'mt-4 border-t border-gray-700/60 pt-3' : ''}
              `}
              onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} // Close sidebar on mobile nav
            >
              <item.Icon className={`w-5 h-5 ${item.link === location.pathname ? 'text-white' : 'text-sky-400 group-hover:text-purple-400'}`} />
              <span className="font-medium text-sm">{item.title}</span>
            </Link>
          ))}
        </nav>
        
      </aside>

      {/* Main Content */}
      <main className={`flex-1 p-6 sm:p-8 overflow-y-auto transition-all duration-300 ${
        isSidebarOpen ? 'lg:ml-64' : 'ml-0' // Adjust margin for responsive sidebar
      }`}>
         {/* Hamburger for mobile to open sidebar */}
        <button 
            onClick={() => setIsSidebarOpen(true)} 
            className={`fixed top-4 left-4 z-30 p-2 rounded-md bg-gray-800/80 backdrop-blur-sm text-gray-200 hover:bg-gray-700 lg:hidden shadow-md ${isSidebarOpen ? 'hidden' : 'block'}`}
        >
            <Bars3Icon className="w-6 h-6"/>
        </button>

        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  Assignment Hub
                </span>
              </h2>
              <p className="text-gray-400 text-base sm:text-lg mt-1">
                Create, manage, and track all your class assignments.
              </p>
            </div>
            <button 
              onClick={() => { resetNewAssignmentForm(); setShowCreateModal(true); }}
              className="flex items-center gap-2.5 px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 rounded-lg shadow-md hover:shadow-lg transition-all text-sm sm:text-base font-semibold text-white"
            >
              <PlusIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              New Assignment
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { title: 'Total Assignments', value: assignments.length, icon: DocumentTextIcon, color: 'sky' },
            { 
              title: 'Total Submissions', 
              value: assignments.reduce((sum, a) => sum + (a.totalSubmissions || 0), 0), 
              icon: ClipboardDocumentIcon, color: 'purple' 
            },
            { 
              title: 'Avg. Class Grade',
              value: (() => {
                const gradedAssignments = assignments.filter(a => (a.gradedSubmissions || 0) > 0);
                if (gradedAssignments.length === 0) return 'N/A';
                const totalWeightedGrade = gradedAssignments.reduce((sum, a) => sum + (a.averageGrade || 0) * (a.gradedSubmissions || 0), 0);
                const totalGradedSubs = gradedAssignments.reduce((sum, a) => sum + (a.gradedSubmissions || 0), 0);
                return totalGradedSubs > 0 ? `${Math.round(totalWeightedGrade / totalGradedSubs)}%` : 'N/A';
              })(),
              icon: AcademicCapIcon, color: 'emerald' 
            },
            { 
              title: 'Upcoming Due',
              value: assignments.filter(a => a.dueDate && new Date(a.dueDate) > new Date() && a.status !== 'archived').length, 
              icon: CalendarIcon, color: 'amber' 
            },
          ].map((stat) => (
            <div key={stat.title} className={`bg-gray-800 p-5 rounded-xl border border-gray-700/80 shadow-lg hover:shadow-sky-500/10 hover:border-${stat.color}-500/50 transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs sm:text-sm font-medium text-gray-400 mb-1`}>{stat.title}</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-500/10`}>
                    <stat.icon className={`w-7 h-7 text-${stat.color}-400`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assignment List */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl border border-gray-700/80 p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2.5">
                  <ClipboardDocumentIcon className="w-6 h-6 text-purple-400" />
                  Assignments Overview
                </h3>
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Search title or subject..."
                    className="bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-2.5 pr-10 w-full focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none placeholder-gray-500 transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <ChevronUpDownIcon className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-5">
                {loading ? (
                  <div className="text-center text-gray-400 py-16">
                    <svg className="animate-spin h-8 w-8 text-sky-400 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading assignments...
                  </div>
                ) : assignments.length === 0 && !error ? (
                  <div className="text-center py-16 bg-gray-700/30 rounded-lg border border-dashed border-gray-600">
                    <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-300">No assignments yet.</h3>
                    <p className="text-gray-400 mt-1 text-sm">Create your first assignment to get started!</p>
                  </div>
                ) : error && assignments.length === 0 ? (
                    <div className="text-center py-16 bg-red-700/10 rounded-lg border border-dashed border-red-600/50">
                        <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-red-400 mb-4" />
                        <h3 className="text-lg font-medium text-red-300">Error Loading Assignments</h3>
                        <p className="text-red-400 mt-1 text-sm">{error}</p>
                    </div>
                ) : (
                  assignments
                    .filter(assignment => 
                      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      assignment.subject.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    // Sorting is now done in fetchAssignments
                    .map((assignment) => (
                      <div key={assignment.id} className="bg-gray-700/40 hover:bg-gray-700/60 border border-gray-600/70 rounded-xl p-5 shadow-lg transition-all duration-300 ease-in-out hover:shadow-sky-500/5">
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-3">
                          <div>
                            <h4 className="text-lg font-semibold text-sky-300 hover:text-sky-200 transition-colors">{assignment.title}</h4>
                            <p className="text-xs text-gray-400 mt-0.5">{assignment.subject} • Max Points: {assignment.maxPoints}</p>
                          </div>
                          <span className={`mt-2 sm:mt-0 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColorClass(assignment.status)}`}>
                            {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-300 line-clamp-2 mb-3 h-10">{assignment.instructions}</p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-4">
                            <div>
                                <span className="text-gray-500 block">Due Date</span>
                                <p className="font-medium text-gray-200">{formatDate(assignment.dueDate)}</p>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Created</span>
                                <p className="font-medium text-gray-200">{formatDate(assignment.createdAt, {month: 'short', day: 'numeric'})}</p>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Submissions</span>
                                <p className="font-medium text-gray-200">{assignment.totalSubmissions || 0}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 items-center border-t border-gray-600/50 pt-3 mt-3">
                            <button onClick={() => handleViewSubmissions(assignment)}
                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 font-medium transition-colors">
                                <EyeIcon className="w-4 h-4" /> View Submissions
                            </button>
                            <button onClick={() => handleEditAssignment(assignment)}
                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-medium transition-colors">
                                <PencilIcon className="w-4 h-4" /> Edit
                            </button>
                            <button onClick={() => handleDeleteAssignment(assignment.id)}
                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-red-500/20 hover:bg-red-500/30 text-red-300 font-medium transition-colors">
                                <TrashIcon className="w-4 h-4" /> Delete
                            </button>
                        </div>
                      </div>
                    ))
                )}
                {!loading && assignments.length > 0 && assignments.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.subject.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                     <div className="text-center py-10 text-gray-500">
                        No assignments match your search criteria.
                     </div>
                )}
              </div>
            </div>
          </div>

          {/* Analytics Sidebar */}
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-xl border border-gray-700/80 p-6 shadow-xl">
              <h3 className="text-xl font-semibold text-white mb-1 flex items-center gap-2.5">
                <ChartBarIcon className="w-6 h-6 text-emerald-400" />
                Class Performance
              </h3>
              <p className="text-xs text-gray-400 mb-4">Overall grade distribution (example)</p>
              <div style={{ width: '100%', height: 260 }}> {/* ResponsiveContainer needs explicit parent dimensions */}
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={performanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent, x, y, midAngle }) => (
                        <text x={x} y={y} fill="white" textAnchor={x > Pie.defaultProps.cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px">
                           {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      )}
                    >
                      {performanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} strokeWidth={0.5}/>
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: '1px solid #4B5563', borderRadius: '0.5rem' }} itemStyle={{ color: '#E5E7EB' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-5">
                {performanceData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-gray-300">{entry.name}:</span>
                    <span className="text-white font-medium">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700/80 p-6 shadow-xl">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2.5">
                <ArrowTrendingUpIcon className="w-6 h-6 text-sky-400" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                {[
                  { title: 'Manage Classes', Icon: EducatorUserGroupIcon, color: 'sky', link: '#' },
                  { title: 'Full Gradebook', Icon: AcademicCapIcon, color: 'purple', link: '/grading-system' },
                  { title: 'Generate Reports', Icon: ChartBarIcon, color: 'emerald', link: '#' },
                ].map(action => (
                  <Link 
                    to={action.link} 
                    key={action.title} 
                    className={`w-full flex items-center gap-3.5 p-3.5 bg-gray-700/40 hover:bg-${action.color}-500/20 rounded-lg transition-colors duration-200 group border border-transparent hover:border-${action.color}-500/50`}
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

      {/* Feedback Modal */}
      {showFeedbackModal && selectedSubmissionForGrading && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[70] p-4">
          <div className="bg-gray-800 rounded-xl p-6 sm:p-8 max-w-lg w-full mx-4 shadow-2xl border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Feedback for {selectedSubmissionForGrading.studentName}
              </h3>
              <button onClick={() => { setShowFeedbackModal(false); setSelectedSubmissionForGrading(null);}}
                className="text-gray-400 hover:text-purple-400 transition-colors">
                <XMarkIcon className="w-7 h-7" />
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-400 mb-1 font-medium">Grade:</p>
                <p className={`text-gray-200 p-2 rounded-md bg-gray-700/50 border border-gray-600 ${getGradeColorClass(selectedSubmissionForGrading.grade, selectedAssignmentForSubmissions?.maxPoints)}`}>
                  {selectedSubmissionForGrading.grade !== null && selectedSubmissionForGrading.grade !== undefined 
                    ? `${selectedSubmissionForGrading.grade} / ${selectedAssignmentForSubmissions?.maxPoints || 100} points` 
                    : 'Not Graded Yet'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 mb-1 font-medium">Feedback:</p>
                <p className="text-gray-200 whitespace-pre-wrap p-3 bg-gray-700/50 border border-gray-600 rounded-md min-h-[80px]">
                  {selectedSubmissionForGrading.feedback || <span className="italic text-gray-500">No feedback provided.</span>}
                </p>
              </div>
            </div>
             <div className="mt-8 flex justify-end">
                <button type="button" onClick={() => { setShowFeedbackModal(false); setSelectedSubmissionForGrading(null); }}
                    className="px-6 py-2.5 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors text-white font-medium">
                    Close
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {showGradeModal && selectedSubmissionForGrading && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[70] p-4">
          <div className="bg-gray-800 rounded-xl p-6 sm:p-8 max-w-lg w-full mx-4 shadow-2xl border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Grade: {selectedSubmissionForGrading.studentName}
              </h3>
              <button onClick={() => { setShowGradeModal(false); setSelectedSubmissionForGrading(null); setNewGrade(''); setNewFeedback(''); }}
                className="text-gray-400 hover:text-teal-400 transition-colors">
                <XMarkIcon className="w-7 h-7" />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label htmlFor="gradeInput" className="block text-sm font-medium text-gray-300 mb-1">
                  Grade (Points out of {selectedAssignmentForSubmissions?.maxPoints || 100})
                </label>
                <input id="gradeInput" type="number" min="0" max={selectedAssignmentForSubmissions?.maxPoints || 100} value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none placeholder-gray-500 transition-colors" />
              </div>
              <div>
                <label htmlFor="feedbackInput" className="block text-sm font-medium text-gray-300 mb-1">Feedback</label>
                <textarea id="feedbackInput" value={newFeedback} onChange={(e) => setNewFeedback(e.target.value)} rows="5"
                  className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none placeholder-gray-500 transition-colors"
                  placeholder="Provide constructive feedback..."/>
              </div>
              <div className="flex justify-end gap-4 pt-3">
                <button type="button" onClick={() => { setShowGradeModal(false); setSelectedSubmissionForGrading(null); setNewGrade(''); setNewFeedback(''); }}
                  className="px-6 py-2.5 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors text-white font-medium" disabled={uploading}>
                  Cancel
                </button>
                <button onClick={handleUpdateGradeAndFeedback}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 transition-all flex items-center gap-2 text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={uploading}>
                  {uploading ? (
                     <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Saving...
                     </>
                  ) : 'Save Grade'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        {/* Success/Error Toasts */}
        {success && (
            <div className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 bg-emerald-500/90 backdrop-blur-sm text-white px-5 py-3 rounded-lg shadow-2xl z-[80] flex items-center gap-3 border border-emerald-400">
            <CheckCircleIcon className="w-6 h-6" />
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="ml-2 text-emerald-100 hover:text-white"><XMarkIcon className="w-5 h-5"/></button>
            </div>
        )}
        {error && !success && ( // Show error only if no success message is active
            <div className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 bg-red-500/90 backdrop-blur-sm text-white px-5 py-3 rounded-lg shadow-2xl z-[80] flex items-center gap-3 border border-red-400">
            <ExclamationTriangleIcon className="w-6 h-6" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-2 text-red-100 hover:text-white"><XMarkIcon className="w-5 h-5"/></button>
            </div>
        )}
    </div>
  );
};

export default AssignmentManagement;