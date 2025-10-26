import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUpload } from '../FileUpload.jsx'; // Assuming FileUpload accepts onSubmit and submitButtonText props
import { evaluateAssignment } from '../../services/geminiService';
import {
  HomeIcon,
  FolderIcon,
  ClipboardDocumentIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PresentationChartLineIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  LightBulbIcon,
  NewspaperIcon,
  WrenchScrewdriverIcon,
  VideoCameraIcon,
  EnvelopeIcon,
  SparklesIcon,
  XMarkIcon,
  Bars3Icon,
  ClockIcon,
  CheckCircleIcon,
  PaperClipIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  ChatBubbleLeftEllipsisIcon,
  ArrowUpTrayIcon,
  DocumentMagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { storage, db, auth } from '../../firebase/firebaseConfig';
import { collection, getDocs, query, where, addDoc, updateDoc, doc, getDoc, orderBy, increment, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const studentMenu = [
  { title: 'Dashboard', Icon: HomeIcon, link: '/dashboard', description: "Overview of your progress." },
  { title: 'My Resources', Icon: FolderIcon, link: '/resource-utilization', description: "Access course materials." },
  { title: 'Tests', Icon: ClipboardDocumentIcon, link: '/student-tests', description: "Take and view your test results." },
  { title: 'Attendance', Icon: ChartBarIcon, link: '/attendance-monitoring', description: "Track your attendance." },
  { title: 'Assignments', Icon: DocumentTextIcon, link: '/assignment-submission', description: "View & submit assignments." },
  { title: 'Grades & Feedback', Icon: PresentationChartLineIcon, link: '/GradesAndFeedback', description: "Check your grades." },
  { title: 'AI Feedback', Icon: DocumentMagnifyingGlassIcon, link: '/personalized-feedback-students', description: "Get AI-powered insights on your progress." },
  { title: 'Voice Chat', Icon: ChatBubbleLeftRightIcon, link: '/voice-chat', description: "Discuss with peers." },
  { title: ' Ask Iko ', Icon: QuestionMarkCircleIcon, link: '/chatbot-access', description: "Your AI study assistant." },
  { title: 'AI Questions', Icon: LightBulbIcon, link: '/ai-generated-questions', description: "Practice with AI questions." },
  { title: 'Educational News', Icon: NewspaperIcon, link: '/educational-news', description: "Latest in education." },
  { title: 'Smart Review', Icon: WrenchScrewdriverIcon, link: '/smart-review', description: "Enhance your writing." },
  { title: 'Virtual Meetings', Icon: VideoCameraIcon, link: '/meeting-participation', description: "Join online classes." },
  { title: 'Chat Platform', Icon: ChatBubbleLeftRightIcon, link: '/chat-functionality', description: "Connect with peers." },
  { title: 'My Inbox', Icon: EnvelopeIcon, link: '/inbox-for-suggestions', description: "Messages & suggestions." },
  { title: 'Upgrade to Pro', Icon: SparklesIcon, link: '/pricing', special: true, description: "Unlock premium features." },
];

const AssignmentSubmission = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  const [error, setError] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [submittingAssignments, setSubmittingAssignments] = useState({});
  const [submissionStatus, setSubmissionStatus] = useState({});
  const [pastSubmissions, setPastSubmissions] = useState([]);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [showFeedback, setShowFeedback] = useState({});

  const isDesktop = useMediaQuery({ minWidth: 768 });
  const location = useLocation();

  useEffect(() => {
    if (isDesktop) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  }, [isDesktop]);

  useEffect(() => {
    console.log('Gemini API Key configured:', !!import.meta.env.VITE_GEMINI_API_KEY);
  }, []);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        fetchAssignments();
        fetchSubmissions();
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
      const q = query(assignmentsRef, where('status', '==', 'published'));
      const querySnapshot = await getDocs(q);
      const assignmentsList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : new Date(data.dueDate),
          points: data.points || 100,
          status: data.status || 'published',
        };
      });
      assignmentsList.sort((a, b) => a.dueDate - b.dueDate);
      console.log('Fetched assignments:', assignmentsList);
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
          maxPoints: data.maxPoints || 100,
        };
      });
      setSubmissionStatus(newSubmissionStatus);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  };
  
  const fetchPastSubmissions = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const submissionsRef = collection(db, 'submissions');
      const q = query(submissionsRef, where('studentId', '==', auth.currentUser.uid), orderBy('submittedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const pastSubs = [];
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        const assignmentRef = doc(db, 'assignments', data.assignmentId);
        const assignmentSnap = await getDoc(assignmentRef);
        
        let assignmentTitle = data.title || "Unknown Assignment";
        let assignmentDueDate = data.dueDate?.toDate ? data.dueDate.toDate() : (data.dueDate ? new Date(data.dueDate) : null);

        if (assignmentSnap.exists()) {
          assignmentTitle = assignmentSnap.data().title || assignmentTitle;
          if (assignmentSnap.data().dueDate) {
             assignmentDueDate = assignmentSnap.data().dueDate.toDate ? assignmentSnap.data().dueDate.toDate() : new Date(assignmentSnap.data().dueDate);
          }
        }

        pastSubs.push({
          id: docSnapshot.id,
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
    setError(null);
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
      const timestamp = Date.now();
      const fileName = `${timestamp}_${fileToSubmit.name}`;
      const filePath = `submissions/${assignmentId}/${auth.currentUser.uid}/${fileName}`;
      const fileRef = ref(storage, filePath);
      await uploadBytes(fileRef, fileToSubmit);
      const downloadURL = await getDownloadURL(fileRef);

      // Enhanced file content processing for different file types
      let fileContent = `[File: ${fileToSubmit.name} - Type: ${fileToSubmit.type}]`;
      let fileData = null;

      if (fileToSubmit.type === 'text/plain' || fileToSubmit.type === 'text/markdown') {
        // Handle text files
        fileContent = await fileToSubmit.text();
      } else if (fileToSubmit.type.startsWith('image/')) {
        // Handle image files - convert to base64 for AI vision analysis
        try {
          // Check if the image is too large for processing
          const maxImageSizeForAI = 4 * 1024 * 1024; // 4MB limit for AI processing
          if (fileToSubmit.size > maxImageSizeForAI) {
            console.warn('Image too large for AI processing, will submit without AI evaluation');
            fileContent = `[Image file: ${fileToSubmit.name} - Size: ${fileToSubmit.size} bytes - Too large for AI analysis]`;
            // Don't set fileData, so it won't be processed by AI
          } else {
            const arrayBuffer = await fileToSubmit.arrayBuffer();
            const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
            fileContent = `[Image file: ${fileToSubmit.name} - Size: ${fileToSubmit.size} bytes]`;
            fileData = {
              type: 'image',
              base64: base64String,
              mimeType: fileToSubmit.type,
              fileName: fileToSubmit.name
            };
          }
        } catch (imageError) {
          console.error('Error processing image file:', imageError);
          fileContent = `[Image file: ${fileToSubmit.name} - Error processing image content for AI analysis]`;
          // Continue without AI processing
        }
      } else if (fileToSubmit.type.startsWith('application/pdf') || 
                 fileToSubmit.type.startsWith('application/msword') || 
                 fileToSubmit.type.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        // Handle document files
        fileContent = `[Document file: ${fileToSubmit.name} - Type: ${fileToSubmit.type} - Size: ${fileToSubmit.size} bytes. Content not directly readable for this demo. Evaluation will be based on metadata and instructions.]`;
      } else if (fileToSubmit.type === 'application/zip') {
        // Handle zip files
        fileContent = `[Archive file: ${fileToSubmit.name} - Type: ZIP - Size: ${fileToSubmit.size} bytes. Contains multiple files that need to be extracted for evaluation.]`;
      } else {
        // Handle other file types
        fileContent = `[File: ${fileToSubmit.name} - Type: ${fileToSubmit.type} - Size: ${fileToSubmit.size} bytes]`;
      }

      let evaluationData = { grade: null, feedback: null, suggestions: null, status: 'submitted', gradedAt: null };
      try {
        const result = await evaluateAssignment(
          fileContent,
          fileToSubmit.type,
          assignment.title,
          assignment.instructions,
          assignment.points || 100,
          fileData // Pass the file data for image processing
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
        const errorMessage = fileToSubmit.type.startsWith('image/') 
          ? `Image analysis failed: ${geminiError.message}. Your image has been submitted and will be reviewed by your teacher.`
          : `Automatic evaluation by AI failed: ${geminiError.message}. Your teacher will review it.`;
        alert(errorMessage);
      }

      const submissionPayload = {
        studentId: auth.currentUser.uid,
        assignmentId,
        title: assignment.title,
        instructions: assignment.instructions,
        maxPoints: assignment.points || 100,
        fileUrl: downloadURL,
        fileName: fileToSubmit.name,
        fileType: fileToSubmit.type,
        submittedAt: new Date(),
        ...evaluationData,
      };

      if (existingSubmissionRef) {
        await updateDoc(existingSubmissionRef, submissionPayload);
        console.log('Submission updated in Firestore.');
      } else {
        const newSubmissionRef = await addDoc(collection(db, 'submissions'), submissionPayload);
        console.log('New submission added to Firestore with ID:', newSubmissionRef.id);
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
      setSelectedFiles(prev => ({ ...prev, [assignmentId]: null }));
      fetchSubmissions();
      if (activeTab === 'past') fetchPastSubmissions();
      setEditingAssignment(null);
    }
  };

  const handleSubmit = async (assignmentId) => {
    const selectedFile = selectedFiles[assignmentId];
    if (!selectedFile) {
      alert('Please select a file to submit.');
      return;
    }
    
    // Enhanced file type validation with better feedback
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'text/plain', 
      'text/markdown',
      'image/jpeg', 
      'image/jpg',
      'image/png', 
      'image/gif',
      'image/webp',
      'application/zip'
    ];
    
    if (!allowedTypes.includes(selectedFile.type) && !selectedFile.type.startsWith('text/')) {
        alert('Invalid file type. Allowed formats:\n\n• Documents: PDF, DOC, DOCX, TXT, MD\n• Images: JPG, JPEG, PNG, GIF, WEBP\n• Archives: ZIP\n\nPlease select a supported file type.');
        return;
    }
    
    // Additional validation for image files
    if (selectedFile.type.startsWith('image/')) {
      const maxImageSize = 10 * 1024 * 1024; // 10MB for images
      if (selectedFile.size > maxImageSize) {
        alert(`Image file is too large. Maximum size for images is 10MB. Your file is ${(selectedFile.size / 1024 / 1024).toFixed(1)}MB.`);
        return;
      }
    }
    
    await processSubmission(assignmentId, selectedFile);
  };

  const handleEditSubmission = async (assignmentId) => {
    const selectedFile = selectedFiles[assignmentId];
    if (!selectedFile) {
      alert('Please select a new file to update your submission.');
      setEditingAssignment(assignmentId);
      return;
    }

    const currentSubmission = submissionStatus[assignmentId];
    if (!currentSubmission || !currentSubmission.submissionId) {
      alert('Original submission not found. Cannot edit.');
      return;
    }
    if (currentSubmission.grade !== null && currentSubmission.grade !== undefined) {
        if (!window.confirm('This assignment has already been graded. Resubmitting will request a new AI evaluation. Continue?')) {
            return;
        }
    }
    
    const submissionDocRef = doc(db, 'submissions', currentSubmission.submissionId);

    if (currentSubmission.fileUrl) {
      try {
        const oldFileRef = ref(storage, currentSubmission.fileUrl);
        await deleteObject(oldFileRef);
        console.log('Old file deleted from storage.');
      } catch (storageError) {
        console.warn('Could not delete old file from storage, it might not exist or there was an error:', storageError);
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

    setSubmittingAssignments(prev => ({ ...prev, [assignmentId]: true }));
    try {
      if (currentSubmission.fileUrl) {
        const fileRef = ref(storage, currentSubmission.fileUrl);
        await deleteObject(fileRef);
      }
      await deleteDoc(doc(db, 'submissions', currentSubmission.submissionId));

      const assignmentDocRef = doc(db, 'assignments', assignmentId);
      await updateDoc(assignmentDocRef, { totalSubmissions: increment(-1) });
      
      alert('Submission removed successfully.');
    } catch (err) {
      console.error('Error removing submission:', err);
      alert(err.message || 'Error removing submission.');
    } finally {
      setSubmittingAssignments(prev => ({ ...prev, [assignmentId]: false }));
      fetchSubmissions();
      if (activeTab === 'past') fetchPastSubmissions();
    }
  };
  
  const checkIfTeacher = async () => {
    if (!auth.currentUser) return;
    try {
      const teacherRef = doc(db, 'users', auth.currentUser.uid);
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
    if (!isTeacher) return;
    if (!window.confirm('TEACHER ACTION: Are you sure you want to delete this assignment? This will delete ALL student submissions as well and cannot be undone.')) {
      return;
    }
    setLoading(true);
    try {
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
      await deleteDoc(doc(db, 'assignments', assignmentId));
      alert('Assignment and all related submissions deleted successfully.');
      fetchAssignments();
      fetchSubmissions();
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
    if (status === 'published') return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
    return <ClockIcon className="w-5 h-5 text-gray-400" />;
  };

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
                  </div>
                </div>

                <p className="text-gray-300 mb-4 text-sm whitespace-pre-wrap">{assignment.instructions}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
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
                        {currentSubmission.feedback && (
                          <div className="mt-2">
                            <button
                              onClick={() => setShowFeedback(prev => ({ ...prev, [assignment.id]: !prev[assignment.id] }))}
                              className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-medium transition-colors"
                            >
                              {showFeedback[assignment.id] ? 'Hide Feedback' : 'Show Feedback'}
                            </button>
                            {showFeedback[assignment.id] && (
                              <div className="mt-2">
                                <h5 className="text-gray-400 text-xs mb-1 font-medium">Feedback:</h5>
                                <p className="text-sm text-gray-200 italic whitespace-pre-wrap">{currentSubmission.feedback}</p>
                              </div>
                            )}
                          </div>
                        )}
                        {currentSubmission.suggestions && currentSubmission.suggestions.length > 0 && showFeedback[assignment.id] && (
                          <div className="mt-2">
                            <h5 className="text-gray-400 text-xs mb-1 font-medium">Suggestions:</h5>
                            <ul className="list-disc list-inside text-sm text-gray-200 pl-2">
                              {currentSubmission.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">No submission yet</p>
                    )}
                  </div>

                  <div className="bg-gray-900/30 p-4 rounded-lg">
                    <h4 className="text-gray-400 text-sm mb-2 font-medium">Submit Assignment</h4>
                    {selectedFiles[assignment.id]?.type?.startsWith('image/') && (
                      <div className="mb-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded-md">
                        <p className="text-xs text-blue-300">
                          📸 <strong>Image detected!</strong> Your image will be analyzed by AI for visual content, composition, and adherence to assignment requirements.
                        </p>
                        {selectedFiles[assignment.id]?.size > 4 * 1024 * 1024 && (
                          <p className="text-xs text-yellow-300 mt-1">
                            ⚠️ <strong>Note:</strong> Your image is larger than 4MB and may not be processed by AI. It will still be submitted for teacher review.
                          </p>
                        )}
                      </div>
                    )}
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
                          accept=".pdf,.doc,.docx,.txt,.md,.zip,.jpg,.jpeg,.png,.gif,.webp"
                        />
                        
                        {/* Image Preview */}
                        {selectedFiles[assignment.id]?.type?.startsWith('image/') && (
                          <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-600/30">
                            <h5 className="text-gray-300 text-xs mb-2 font-medium">Image Preview:</h5>
                            <div className="relative">
                              <img 
                                src={URL.createObjectURL(selectedFiles[assignment.id])} 
                                alt="Preview" 
                                className="max-w-full h-auto max-h-48 rounded-md border border-gray-600/30"
                                onLoad={(e) => {
                                  // Clean up the object URL after the image loads
                                  setTimeout(() => URL.revokeObjectURL(e.target.src), 1000);
                                }}
                              />
                              <div className="mt-2 text-xs text-gray-400">
                                Size: {(selectedFiles[assignment.id].size / 1024 / 1024).toFixed(2)} MB
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => currentSubmission ? handleEditSubmission(assignment.id) : handleSubmit(assignment.id)}
                            disabled={isSubmitting || !selectedFiles[assignment.id]}
                            className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {isSubmitting ? (
                              <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {selectedFiles[assignment.id]?.type?.startsWith('image/') ? 'Analyzing Image...' : 'Submitting...'}
                              </>
                            ) : (
                              currentSubmission ? 'Update' : 'Submit'
                            )}
                          </button>
                          <button
                            onClick={() => setEditingAssignment(null)}
                            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                        {currentSubmission && !currentSubmission.grade && (
                          <button
                            onClick={() => handleRemoveSubmission(assignment.id)}
                            disabled={isSubmitting}
                            className="w-full px-4 py-2 bg-red-600/80 text-white rounded-md hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? 'Removing...' : 'Remove Submission'}
                          </button>
                        )}
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
                'bg-yellow-500/20 text-yellow-400'
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

  return (
    <div className="min-h-screen bg-gray-900 flex text-gray-200">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside 
            key="sidebar"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.3 }}
            className={`fixed top-0 left-0 h-full w-64 bg-gray-800/80 backdrop-blur-xl border-r border-gray-700/60 shadow-2xl z-50 flex flex-col md:h-screen md:z-40 md:fixed md:translate-x-0`}
          >
            <div className="p-5 flex items-center gap-3.5 border-b border-gray-700/60 relative">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
                <SparklesIcon className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">IGNITIA</h1>
              {!isDesktop && (
                <button onClick={() => setIsSidebarOpen(false)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/50 transition-colors">
                  <XMarkIcon className="w-5 h-5"/>
                </button>
              )}
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 scrollbar-track-gray-800/50 scrollbar-thumb-rounded-md">
              {studentMenu.map(item => {
                const isActive = location.pathname === item.link;
                return (
                  <Link
                    key={item.title}
                    to={item.link}
                    onClick={() => !isDesktop && setIsSidebarOpen(false)}
                    className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-gray-300 transition-all group
                              ${isActive ? 'bg-indigo-500/30 text-indigo-200 font-semibold shadow-inner' : 'hover:bg-indigo-500/10 hover:text-indigo-300'}
                              ${item.special ? `mt-auto mb-1 bg-gradient-to-r from-purple-600/90 to-indigo-600/90 !text-white shadow-md hover:shadow-lg hover:opacity-90 ${isActive ? 'ring-2 ring-purple-400' : ''}` : ''}`}
                  >
                    <item.Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-300' : 'text-indigo-400'} group-hover:scale-110 transition-transform`} />
                    <span className="text-sm font-medium">{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
      {isSidebarOpen && !isDesktop && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      <main className={`flex-1 p-4 sm:p-8 overflow-y-auto relative transition-margin duration-300 ease-in-out md:ml-64 max-w-6xl mx-auto`}>
        {!isDesktop && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed left-4 top-4 z-40 p-2 bg-gray-800/80 backdrop-blur-sm rounded-lg hover:bg-gray-700 transition-colors shadow-lg"
          >
            <Bars3Icon className="w-6 h-6 text-gray-300" />
          </button>
        )}

        <div className="max-w-6xl mx-auto">
          <header className="mb-6 md:mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Assignment Submission</span>
            </h2>
            <p className="text-gray-400">Submit your assignments, track your progress, and view AI-powered feedback.</p>
          </header>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-md">
              {error}
            </div>
          )}

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

      <style>{`
        .styled-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .styled-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.5);
          border-radius: 10px;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.7);
          border-radius: 10px;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.9);
        }
        .styled-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(107, 114, 128, 0.7) rgba(55, 65, 81, 0.5);
        }
      `}</style>
    </div>
  );
};

export default AssignmentSubmission;


