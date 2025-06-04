import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileUpload } from '../FileUpload.jsx'; // Assuming FileUpload accepts onSubmit and submitButtonText props
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
  ChatBubbleLeftRightIcon,
  UsersIcon,
  VideoCameraIcon,
  PresentationChartLineIcon,
  EnvelopeIcon,
  ArrowUpTrayIcon,
  DocumentMagnifyingGlassIcon,
  ChartBarIcon,
  FolderIcon,
  SparklesIcon,
  CalendarIcon,
  // XCircleIcon, // Not used
  PencilIcon,
  TrashIcon,
  ChatBubbleLeftEllipsisIcon, // For feedback display
  LightBulbIcon, // For suggestions display
} from '@heroicons/react/24/outline';
import { storage, db } from '../../firebase/firebaseConfig';
import { collection, getDocs, query, where, addDoc, updateDoc, doc, getDoc, orderBy, increment, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'; // Added deleteObject
import { auth } from '../../firebase/firebaseConfig';

const AssignmentSubmission = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [activeTab, setActiveTab] = useState('current');
  // const [isEvaluating, setIsEvaluating] = useState(false); // Replaced by submittingAssignments[id]
  // const [evaluationResult, setEvaluationResult] = useState(null); // Not used directly for display
  const [error, setError] = useState(null); // General error for the page
  const [assignments, setAssignments] = useState([]); // List of available assignments
  const [loading, setLoading] = useState(true); // For loading assignments list
  const [selectedFiles, setSelectedFiles] = useState({});
  const [submittingAssignments, setSubmittingAssignments] = useState({}); // Tracks submission/evaluation state per assignment
  // const [feedback, setFeedback] = useState(null); // Removed, feedback shown via submissionStatus
  const [submissionStatus, setSubmissionStatus] = useState({}); // Holds details of student's submissions for current assignments
  const [pastSubmissions, setPastSubmissions] = useState([]);
  const [editingAssignment, setEditingAssignment] = useState(null); // ID of assignment being edited
  const [isTeacher, setIsTeacher] = useState(false);

  // Sidebar and resize effect
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check Gemini API Key
  useEffect(() => {
    console.log('Gemini API Key configured:', !!import.meta.env.VITE_GEMINI_API_KEY);
  }, []);

  // Fetch assignments and existing submissions on mount
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        fetchAssignments(); // Fetches assignable items
        fetchSubmissions(); // Fetches student's existing submissions for current tab
        checkIfTeacher();
      } else {
        setLoading(false);
        setAssignments([]);
        setSubmissionStatus({});
        setPastSubmissions([]);
        setIsTeacher(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);


  // Fetch past submissions when tab changes
  useEffect(() => {
    if (activeTab === 'past' && auth.currentUser) {
      fetchPastSubmissions();
    }
  }, [activeTab, auth.currentUser]);


  const fetchAssignments = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const assignmentsRef = collection(db, 'assignments');
      // First get all published assignments
      const q = query(
        assignmentsRef,
        where('status', '==', 'published')
      );
      const querySnapshot = await getDocs(q);
      const assignmentsList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : new Date(data.dueDate),
          points: data.points || 100,
          status: data.status || 'published'
        };
      });
      // Sort the assignments by due date after fetching
      assignmentsList.sort((a, b) => a.dueDate - b.dueDate);
      console.log('Fetched assignments:', assignmentsList); // Debug log
      setAssignments(assignmentsList);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    if (!auth.currentUser) return;
    try {
      const submissionsRef = collection(db, 'submissions');
      const q = query(submissionsRef, where('studentId', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const newSubmissionStatus = {};
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        newSubmissionStatus[data.assignmentId] = {
          submissionId: docSnap.id,
          status: data.status,
          fileName: data.fileName,
          fileUrl: data.fileUrl,
          submittedAt: data.submittedAt?.toDate?.() || (data.submittedAt ? new Date(data.submittedAt) : null),
          grade: data.grade !== undefined ? data.grade : null,
          feedback: data.feedback || null,
          suggestions: data.suggestions || null,
          gradedAt: data.gradedAt?.toDate?.() || (data.gradedAt ? new Date(data.gradedAt) : null),
          maxPoints: data.maxPoints || 100, // Ensure this was saved with submission
        };
      });
      setSubmissionStatus(newSubmissionStatus);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      // setError('Failed to load your submission statuses.'); // Avoid too many error messages
    }
  };
  
  const fetchPastSubmissions = async () => {
    if (!auth.currentUser) return;
    setLoading(true); // Consider a different loading state for this tab if needed
    try {
      const submissionsRef = collection(db, 'submissions');
      const q = query(
        submissionsRef, 
        where('studentId', '==', auth.currentUser.uid),
        orderBy('submittedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const pastSubs = [];
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        const assignmentRef = doc(db, 'assignments', data.assignmentId); // Get original assignment details
        const assignmentSnap = await getDoc(assignmentRef);
        
        let assignmentTitle = data.title || "Unknown Assignment"; // Use title from submission first
        let assignmentDueDate = data.dueDate?.toDate ? data.dueDate.toDate() : (data.dueDate ? new Date(data.dueDate) : null); // Use due date from submission if available

        if (assignmentSnap.exists()) {
          assignmentTitle = assignmentSnap.data().title || assignmentTitle;
          if (assignmentSnap.data().dueDate) {
             assignmentDueDate = assignmentSnap.data().dueDate.toDate ? assignmentSnap.data().dueDate.toDate() : new Date(assignmentSnap.data().dueDate);
          }
        }

        pastSubs.push({
          id: docSnapshot.id, // Submission ID
          assignmentId: data.assignmentId,
          assignment: assignmentTitle,
          submittedOn: data.submittedAt?.toDate?.() || (data.submittedAt ? new Date(data.submittedAt) : null),
          dueDate: assignmentDueDate,
          status: data.status || 'Submitted',
          grade: data.grade !== undefined ? data.grade : null,
          feedback: data.feedback || null,
          suggestions: data.suggestions || null,
          file: data.fileName,
          fileUrl: data.fileUrl,
          maxPoints: data.maxPoints || 100,
        });
      }
      setPastSubmissions(pastSubs);
    } catch (err) {
      console.error('Error fetching past submissions:', err);
      setError('Failed to load past submissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (assignmentId, file) => {
    setSelectedFiles(prev => ({ ...prev, [assignmentId]: file }));
    setError(null); // Clear previous errors
  };

  const processSubmission = async (assignmentId, fileToSubmit, existingSubmissionRef = null) => {
    if (!auth.currentUser) {
      alert('Please sign in.');
      return false;
    }
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) {
      throw new Error('Assignment details not found.');
    }

    setSubmittingAssignments(prev => ({ ...prev, [assignmentId]: true }));
    setError(null);

    try {
      // 1. Upload file
      const timestamp = Date.now();
      const fileName = `${timestamp}_${fileToSubmit.name}`;
      const filePath = `submissions/${assignmentId}/${auth.currentUser.uid}/${fileName}`;
      const fileRef = ref(storage, filePath);
      await uploadBytes(fileRef, fileToSubmit);
      const downloadURL = await getDownloadURL(fileRef);

      // 2. Prepare file content for Gemini
      let fileContent = `[File: ${fileToSubmit.name} - Type: ${fileToSubmit.type}]`; // Default for non-text
      if (fileToSubmit.type === 'text/plain' || fileToSubmit.type === 'text/markdown') {
        fileContent = await fileToSubmit.text();
      } else if (fileToSubmit.type.startsWith('application/pdf') || fileToSubmit.type.startsWith('application/msword') || fileToSubmit.type.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        fileContent = `[Binary file: ${fileToSubmit.name}. Content not directly readable for this demo. Evaluation will be based on metadata and instructions.]`;
        // In a real scenario, you'd use a service to extract text from these files.
      }


      // 3. Call Gemini for evaluation
      let evaluationData = { grade: null, feedback: null, suggestions: null, status: 'submitted', gradedAt: null };
      try {
        const result = await evaluateAssignment(
          fileContent,
          fileToSubmit.type,
          assignment.title,
          assignment.instructions,
          assignment.points || 100
        );
        evaluationData = {
          grade: result.grade,
          feedback: result.feedback,
          suggestions: result.suggestions || [],
          status: 'graded',
          gradedAt: new Date(),
        };
        console.log('Gemini evaluation successful:', evaluationData);
      } catch (geminiError) {
        console.error('Gemini evaluation failed:', geminiError);
        // Decide if submission should still proceed or show error to user
        // For now, it will proceed as 'submitted' and teacher can grade
        alert(`Assignment submitted. Automatic evaluation by AI failed: ${geminiError.message}. Your teacher will review it.`);
      }

      // 4. Create or Update Submission Document in Firestore
      const submissionPayload = {
        studentId: auth.currentUser.uid,
        assignmentId,
        title: assignment.title, // Store for easy display
        instructions: assignment.instructions, // Store for context
        maxPoints: assignment.points || 100, // Store for grading context
        fileUrl: downloadURL,
        fileName: fileToSubmit.name,
        fileType: fileToSubmit.type,
        submittedAt: new Date(),
        ...evaluationData, // grade, feedback, suggestions, status, gradedAt
      };

      if (existingSubmissionRef) {
        await updateDoc(existingSubmissionRef, submissionPayload);
        console.log('Submission updated in Firestore.');
      } else {
        const newSubmissionRef = await addDoc(collection(db, 'submissions'), submissionPayload);
        console.log('New submission added to Firestore with ID:', newSubmissionRef.id);
        // Update total submissions count on the assignment (if it's a new submission)
        const assignmentDocRef = doc(db, 'assignments', assignmentId);
        await updateDoc(assignmentDocRef, { totalSubmissions: increment(1) });
      }
      
      alert(`Assignment ${existingSubmissionRef ? 'updated' : 'submitted'} ${evaluationData.status === 'graded' ? 'and auto-graded' : 'successfully. Pending AI or manual review.'}`);
      return true;

    } catch (err) {
      console.error(`Error during ${existingSubmissionRef ? 'updating' : 'submitting'} assignment:`, err);
      setError(err.message || `Failed to ${existingSubmissionRef ? 'update' : 'submit'}. Please try again.`);
      alert(`Error: ${err.message}`);
      return false;
    } finally {
      setSubmittingAssignments(prev => ({ ...prev, [assignmentId]: false }));
      setSelectedFiles(prev => ({ ...prev, [assignmentId]: null })); // Clear selected file
      fetchSubmissions(); // Refresh current submissions view
      if (activeTab === 'past') fetchPastSubmissions(); // Refresh past submissions if on that tab
      setEditingAssignment(null); // Exit editing mode
    }
  };

  const handleSubmit = async (assignmentId) => {
    const selectedFile = selectedFiles[assignmentId];
    if (!selectedFile) {
      alert('Please select a file to submit.');
      return;
    }
    // Basic file type validation (can be expanded)
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png', 'application/zip'];
    if (!allowedTypes.includes(selectedFile.type) && !selectedFile.type.startsWith('text/')) {
        alert('Invalid file type. Allowed: PDF, Word, TXT, JPG, PNG, ZIP.');
        return;
    }
    await processSubmission(assignmentId, selectedFile);
  };

  const handleEditSubmission = async (assignmentId) => {
    const selectedFile = selectedFiles[assignmentId];
    if (!selectedFile) {
      // This case should ideally be handled by UI: if editing, file input is shown
      alert('Please select a new file to update your submission.');
      setEditingAssignment(assignmentId); // Ensure editing mode is active to show file input
      return;
    }

    const currentSubmission = submissionStatus[assignmentId];
    if (!currentSubmission || !currentSubmission.submissionId) {
      alert('Original submission not found. Cannot edit.');
      return;
    }
    if (currentSubmission.grade !== null && currentSubmission.grade !== undefined) { // Check if already graded
        if (!window.confirm('This assignment has already been graded. Resubmitting will request a new AI evaluation. Continue?')) {
            return;
        }
    }
    
    const submissionDocRef = doc(db, 'submissions', currentSubmission.submissionId);

    // Delete old file from storage if URL exists
    if (currentSubmission.fileUrl) {
      try {
        const oldFileRef = ref(storage, currentSubmission.fileUrl);
        await deleteObject(oldFileRef);
        console.log('Old file deleted from storage.');
      } catch (storageError) {
        console.warn('Could not delete old file from storage, it might not exist or there was an error:', storageError);
        // Continue with submission update even if old file deletion fails
      }
    }
    
    await processSubmission(assignmentId, selectedFile, submissionDocRef);
  };

  const handleRemoveSubmission = async (assignmentId) => {
    const currentSubmission = submissionStatus[assignmentId];
    if (!currentSubmission || !currentSubmission.submissionId) {
      alert('Submission not found.');
      return;
    }
    if (currentSubmission.grade !== null && currentSubmission.grade !== undefined) {
      alert('Cannot remove a graded submission. Contact your teacher if changes are needed.');
      return;
    }
    if (!window.confirm('Are you sure you want to remove this submission? This cannot be undone.')) {
      return;
    }

    setSubmittingAssignments(prev => ({ ...prev, [assignmentId]: true })); // Use submitting state for loading
    try {
      // Delete file from storage
      if (currentSubmission.fileUrl) {
        const fileRef = ref(storage, currentSubmission.fileUrl);
        await deleteObject(fileRef);
      }
      // Delete submission document
      await deleteDoc(doc(db, 'submissions', currentSubmission.submissionId));

      // Decrement total submissions count on the assignment
      const assignmentDocRef = doc(db, 'assignments', assignmentId);
      await updateDoc(assignmentDocRef, { totalSubmissions: increment(-1) });
      
      alert('Submission removed successfully.');
    } catch (err) {
      console.error('Error removing submission:', err);
      alert(err.message || 'Error removing submission.');
    } finally {
      setSubmittingAssignments(prev => ({ ...prev, [assignmentId]: false }));
      fetchSubmissions(); // Refresh current list
      if (activeTab === 'past') fetchPastSubmissions(); // Refresh past list
    }
  };
  
  const checkIfTeacher = async () => {
    if (!auth.currentUser) return;
    try {
      const teacherRef = doc(db, 'users', auth.currentUser.uid); // Assuming teachers are in 'users' with a role
      const teacherSnap = await getDoc(teacherRef);
      if (teacherSnap.exists() && teacherSnap.data().role === 'teacher') {
        setIsTeacher(true);
      } else {
        setIsTeacher(false);
      }
    } catch (error) {
      console.error('Error checking teacher status:', error);
      setIsTeacher(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    // (This function is for teachers, ensure isTeacher check before showing button)
    if (!isTeacher) return;
    if (!window.confirm('TEACHER ACTION: Are you sure you want to delete this assignment? This will delete ALL student submissions as well and cannot be undone.')) {
      return;
    }
    setLoading(true); // General loading state for this operation
    try {
      // Delete all submissions for this assignment
      const submissionsQuery = query(collection(db, 'submissions'), where('assignmentId', '==', assignmentId));
      const submissionsSnapshot = await getDocs(submissionsQuery);
      const deletePromises = submissionsSnapshot.docs.map(async (subDoc) => {
        if (subDoc.data().fileUrl) {
          try {
            await deleteObject(ref(storage, subDoc.data().fileUrl));
          } catch (e) { console.warn("Failed to delete submission file from storage", e); }
        }
        return deleteDoc(doc(db, 'submissions', subDoc.id));
      });
      await Promise.all(deletePromises);
      // Delete the assignment document
      await deleteDoc(doc(db, 'assignments', assignmentId));
      alert('Assignment and all related submissions deleted successfully.');
      fetchAssignments(); // Refresh assignments list
      fetchSubmissions(); // Refresh student's view of submissions
    } catch (err) {
      console.error('Error deleting assignment:', err);
      alert(err.message || 'Error deleting assignment.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateInput, includeTime = true) => {
    if (!dateInput) return 'N/A';
    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      if (isNaN(date.getTime())) return 'Invalid Date';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
      }
      return date.toLocaleDateString('en-US', options);
    } catch (e) {
      console.error('Error formatting date:', e, 'Input:', dateInput);
      return 'Invalid Date';
    }
  };

  const getStatusIcon = (status) => {
    // This is for the assignment status (e.g., 'published'), not submission status
    if (status === 'published') return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
    return <ClockIcon className="w-5 h-5 text-gray-400" />;
  };


  // --- Render Logic ---
  const renderCurrentAssignments = () => {
    if (loading && assignments.length === 0) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
          <span className="ml-3 text-gray-400">Loading assignments...</span>
        </div>
      );
    }

    if (assignments.length === 0) {
      return (
        <div className="text-center py-12">
          <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-400">No current assignments</h3>
          <p className="text-gray-500 mt-1">Check back later for new assignments.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {assignments.map((assignment) => {
          const currentSubmission = submissionStatus[assignment.id];
          const isSubmitting = submittingAssignments[assignment.id];
          const isEditingThis = editingAssignment === assignment.id;

          return (
            <div key={assignment.id} className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1">{assignment.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Due: {formatDate(assignment.dueDate)}</span>
                      <span className="mx-1">•</span>
                      <span>Max Points: {assignment.points || 100}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isTeacher && (
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs bg-red-600/80 text-white hover:bg-red-500 transition-colors"
                        title="Delete Assignment (Teacher)"
                      >
                        <TrashIcon className="w-3.5 h-3.5" /> Delete
                      </button>
                    )}
                    {/* Assignment status (e.g. published) - not submission status */}
                    {/* <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-500/20 text-blue-400 h-fit">
                      {getStatusIcon(assignment.status)} {assignment.status}
                    </span> */}
                  </div>
                </div>

                <p className="text-gray-300 mb-4 text-sm whitespace-pre-wrap">{assignment.instructions}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  {/* Left Column: Submission Info / Grade & Feedback */}
                  <div className="bg-gray-900/30 p-4 rounded-lg">
                    <h4 className="text-gray-400 text-sm mb-2 font-medium">Your Submission Status</h4>
                    {currentSubmission ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <PaperClipIcon className="w-5 h-5 text-indigo-400" />
                          <a href={currentSubmission.fileUrl} target="_blank" rel="noopener noreferrer" className="text-white hover:text-indigo-300 truncate">
                            {currentSubmission.fileName}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <CalendarIcon className="w-4 h-4" />
                          <span>Submitted: {formatDate(currentSubmission.submittedAt)}</span>
                        </div>
                        {currentSubmission.grade !== null && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400">Grade:</span>
                            <span className="text-white font-medium">
                              {currentSubmission.grade} / {currentSubmission.maxPoints}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">No submission yet</p>
                    )}
                  </div>

                  {/* Right Column: File Upload */}
                  <div className="bg-gray-900/30 p-4 rounded-lg">
                    <h4 className="text-gray-400 text-sm mb-2 font-medium">Submit Assignment</h4>
                    {isEditingThis ? (
                      <div className="space-y-3">
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(assignment.id, e.target.files[0])}
                          className="block w-full text-sm text-gray-400
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-medium
                            file:bg-indigo-500/20 file:text-indigo-400
                            hover:file:bg-indigo-500/30"
                          accept=".pdf,.doc,.docx,.txt,.zip,.rar,.jpg,.jpeg,.png"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSubmit(assignment.id)}
                            disabled={isSubmitting || !selectedFiles[assignment.id]}
                            className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                          </button>
                          <button
                            onClick={() => setEditingAssignment(null)}
                            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingAssignment(assignment.id)}
                        disabled={isSubmitting}
                        className="w-full px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {currentSubmission ? 'Update Submission' : 'Submit Assignment'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPastSubmissions = () => {
    if (loading && pastSubmissions.length === 0) return <div className="text-center text-gray-400 py-8">Loading past submissions...</div>;
    if (pastSubmissions.length === 0) {
      return (
        <div className="text-center py-12">
          <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-400">No past submissions</h3>
          <p className="text-gray-500 mt-1">Your submitted assignments will appear here once processed.</p>
        </div>
      );
    }
    return pastSubmissions.map((submission) => (
      <div key={submission.id} className="bg-gray-800/50 rounded-lg border border-gray-700/50 overflow-hidden hover:bg-gray-800/70 transition-colors">
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{submission.assignment}</h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-400 mt-1">
                <span>Submitted: {formatDate(submission.submittedOn)}</span>
                <span className="hidden sm:inline">•</span>
                <span>Due: {formatDate(submission.dueDate)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              {submission.grade !== null && submission.grade !== undefined && (
                <span className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-400 text-xs font-medium">
                  Grade: {submission.grade} / {submission.maxPoints || 100}
                </span>
              )}
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                submission.status === 'graded' ? 'bg-green-500/20 text-green-400' :
                submission.status === 'submitted' ? 'bg-blue-500/20 text-blue-400' :
                'bg-yellow-500/20 text-yellow-400' // For other statuses like 'late'
              }`}>
                {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
              </span>
            </div>
          </div>

          {submission.feedback && (
            <div className="mt-3 pt-3 border-t border-gray-700/50">
              <h4 className="text-gray-400 text-xs mb-1 font-medium">Feedback:</h4>
              <p className="text-sm text-gray-200 italic whitespace-pre-wrap">{submission.feedback}</p>
            </div>
          )}
           {submission.suggestions && submission.suggestions.length > 0 && (
            <div className="mt-2">
              <h4 className="text-gray-400 text-xs mb-1 font-medium">Suggestions:</h4>
              <ul className="list-disc list-inside text-sm text-gray-200 pl-2">
                {submission.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div className="flex items-center gap-2 text-gray-400">
              <PaperClipIcon className="w-4 h-4" />
              <span className="text-sm">{submission.file}</span>
            </div>
            <a 
              href={submission.fileUrl} target="_blank" rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1"
            >
              <ArrowUpTrayIcon className="w-4 h-4 transform rotate-45" /> Download Submission
            </a>
          </div>
        </div>
      </div>
    ));
  };

  // --- Main Return ---
  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar (Mobile Overlay & Desktop Fixed) - Code from your example */}
      {isSidebarOpen && windowWidth < 768 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsSidebarOpen(false)} />
      )}
      <aside className={`fixed top-0 left-0 h-screen w-64 bg-gray-800 border-r border-gray-700/50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 z-50 flex flex-col`}>
        <div className="h-full flex flex-col">
          <div className="p-6 relative">
            {/* Decorative elements */}
            <div className="absolute w-32 h-32 bg-indigo-500/10 rounded-full -top-16 -right-16" />
            <div className="absolute w-48 h-48 bg-purple-500/10 rounded-full -bottom-24 -left-24" />
            <div className="flex items-center gap-3 mb-8 relative">
              <button onClick={() => setIsSidebarOpen(false)} className="md:hidden absolute -right-3 top-0 p-1.5 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
                <XMarkIcon className="w-5 h-5 text-gray-400" />
              </button>
              <ClipboardDocumentIcon className="w-8 h-8 text-indigo-400 animate-pulse" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">SPARK-IQ</h1>
            </div>
          </div>
          <div className="flex-1 px-6 pb-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            <nav>
              <ul className="space-y-1">
                {[
                  { title: 'Dashboard', link: '/dashboard', Icon: ClipboardDocumentIcon },
                  { title: 'Assignments', link: '/assignment-submission', Icon: DocumentTextIcon, active: true },
                  { title: 'Tests', Icon: ClipboardDocumentIcon, link: '/student-tests' },
                  { title: 'Resources', link: '/resource-utilization', Icon: FolderIcon, },
                  { title: 'Attendance', Icon: ChartBarIcon, link: '/attendance-monitoring' },
                  { title: 'Grades & Feedback', Icon: PresentationChartLineIcon, link: '/GradesAndFeedback' },
                  { title: 'Voice Chat', Icon: ChatBubbleLeftRightIcon, link: '/voice-chat' },
                  { title: 'Ask Sparky', Icon: ChatBubbleLeftRightIcon, link: '/chatbot-access' },
                  { title: 'AI Questions', Icon: SparklesIcon, link: '/ai-generated-questions' },
                  { title: 'News Feed', Icon: UsersIcon, link: '/educational-news' },
                  { title: 'Smart Review', Icon: DocumentMagnifyingGlassIcon, link: '/smart-review' },
                  { title: 'Meetings', Icon: VideoCameraIcon, link: '/meeting-participation' },
                  { title: 'Inbox', Icon: EnvelopeIcon, link: '/inbox-for-suggestions' },
                ].map((item) => (
                  <li key={item.title}>
                    <Link to={item.link} className={`flex items-center gap-3 p-3 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-all duration-300 group hover:translate-x-1 ${item.active ? 'bg-indigo-500/10 text-indigo-400' : ''}`}>
                      <item.Icon className="w-5 h-5 text-indigo-400 group-hover:text-purple-400 transition-colors" />
                      <span>{item.title}</span>
                      {/* <ArrowUpTrayIcon className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" /> */}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </aside>

      <main className={`flex-1 p-4 sm:p-8 overflow-y-auto relative transition-margin duration-300 ${isSidebarOpen && windowWidth >=768 ? 'ml-64' : 'ml-0'}`}>
        {/* Mobile Header & Toggle */}
        <header className="md:hidden sticky top-0 z-30 bg-gray-900/80 backdrop-blur p-4 border-b border-gray-700/50 mb-4 -mx-4 sm:-mx-8 -mt-4 sm:-mt-8">
          <div className="flex items-center justify-between max-w-6xl mx-auto px-4 sm:px-0">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-700">
              <Bars3Icon className="w-6 h-6 text-gray-400" />
            </button>
            <h1 className="text-xl font-bold text-white">Assignments</h1>
            <div className="w-8"></div> {/* Spacer */}
          </div>
        </header>
        
        {/* Desktop Header (only if sidebar is closed and on md+) or always visible */}
         {!isSidebarOpen && windowWidth >= 768 && (
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="fixed left-4 top-4 z-40 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
                <Bars3Icon className="w-6 h-6 text-gray-400" />
            </button>
        )}


        <div className="max-w-6xl mx-auto">
          <header className="mb-6 md:mb-8 hidden md:block">
            <h2 className="text-3xl font-bold text-white mb-2">
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Assignment Submission</span>
            </h2>
            <p className="text-gray-400">Submit your assignments, track your progress, and view AI-powered feedback.</p>
          </header>

          <div className="flex border-b border-gray-700 mb-6">
            {['current', 'past'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium capitalize ${activeTab === tab ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'}`}
              >
                {tab === 'current' ? 'Current Assignments' : 'Submission History'}
              </button>
            ))}
          </div>

          {activeTab === 'current' ? (
            <div className="space-y-6">{renderCurrentAssignments()}</div>
          ) : (
            <div className="space-y-4">{renderPastSubmissions()}</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AssignmentSubmission;