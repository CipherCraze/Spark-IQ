import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { storage, db, auth } from '../../firebase/firebaseConfig';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc } from 'firebase/firestore';
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
    try {
      // --- ACTUAL FIREBASE IMPLEMENTATION (Commented out to use mock data) ---
      // const submissionsRef = collection(db, 'submissions');
      // // Assuming student submissions are stored with assignmentId and potentially studentId
      // const q = query(submissionsRef, where('assignmentId', '==', assignmentId));
      // const querySnapshot = await getDocs(q);
      // const subs = querySnapshot.docs.map(doc => ({
      //   id: doc.id,
      //   ...doc.data(),
      //   // Ensure submittedAt is a string or convert if it's a Firestore Timestamp
      //   submittedAt: doc.data().submittedAt?.toDate ? doc.data().submittedAt.toDate().toISOString() : doc.data().submittedAt,
      // }));
      // setSubmissions(subs);

      // --- MOCK DATA Implementation ---
      console.log(`Fetching submissions for assignmentId: ${assignmentId}`);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockSubmissions = [
        { id: 'sub1', studentId: 'studentA', studentName: 'Alice Wonderland', submittedAt: new Date(Date.now() - Math.random()*100000000).toISOString(), status: 'Submitted', files: [{name: 'Alice_Report_Final.pdf', url: '#'}, {name: 'Presentation.pptx', url: '#'}], grade: null, feedback: '' },
        { id: 'sub2', studentId: 'studentB', studentName: 'Bob The Builder', submittedAt: new Date(Date.now() - Math.random()*100000000 - 86400000).toISOString(), status: 'Graded', files: [{name: 'Bob_Project.zip', url: '#'}], grade: 85, feedback: 'Good effort, Bob! Some areas for improvement.' },
        { id: 'sub3', studentId: 'studentC', studentName: 'Charlie Brown', submittedAt: new Date(Date.now() - Math.random()*100000000 - 172800000).toISOString(), status: 'Late', files: [{name: 'charlie_essay_late.docx', url: '#'}], grade: null, feedback: '' },
        { id: 'sub4', studentId: 'studentD', studentName: 'Diana Prince', submittedAt: new Date(Date.now() - Math.random()*100000000).toISOString(), status: 'Submitted', files: [], grade: null, feedback: '' }, // No files submitted example
      ];
      setSubmissions(mockSubmissions.filter(() => Math.random() > 0.3)); // Randomly show some for variety
      // --- End MOCK DATA ---

    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissions([]); 
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
              {submissions.map(sub => (
                <div key={sub.id} className="bg-gray-700/70 p-4 rounded-lg shadow-md transition-all hover:bg-gray-700">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-white">{sub.studentName}</p>
                      <p className="text-sm text-gray-400">
                        Submitted: {new Date(sub.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-left sm:text-right">
                       <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          sub.status === 'Graded' ? 'bg-green-500/30 text-green-300' : 
                          sub.status === 'Submitted' ? 'bg-blue-500/30 text-blue-300' :
                          sub.status === 'Late' ? 'bg-yellow-500/30 text-yellow-300' :
                          'bg-gray-500/30 text-gray-300' // Other statuses
                        }`}>
                        {sub.status}
                      </span>
                      {sub.grade !== null && typeof sub.grade !== 'undefined' && (
                        <p className="text-sm text-gray-300 mt-1">Grade: <span className="font-semibold">{sub.grade}</span>/{selectedAssignmentForSubmissions.maxPoints}</p>
                      )}
                    </div>
                  </div>
                  {sub.files && sub.files.length > 0 && (
                    <div className="mt-3 border-t border-gray-600 pt-3">
                      <p className="text-sm text-gray-300 mb-1 font-medium">Submitted Files:</p>
                      <ul className="space-y-1">
                        {sub.files.map((file, index) => (
                          <li key={index} className="text-sm flex items-center">
                            <DocumentTextIcon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0"/>
                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline truncate" title={file.name}>
                              {file.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(!sub.files || sub.files.length === 0) && (
                     <div className="mt-3 border-t border-gray-600 pt-3">
                        <p className="text-sm text-gray-400 italic">No files were submitted.</p>
                     </div>
                  )}
                  {/* Placeholder for grading/feedback actions */}
                  <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2 border-t border-gray-600 pt-3">
                      <button className="text-xs px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white transition-colors font-medium flex items-center justify-center gap-1.5">
                        <PencilIcon className="w-4 h-4"/> Grade / Feedback
                      </button>
                      <button className="text-xs px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white transition-colors font-medium flex items-center justify-center gap-1.5">
                        <EyeIcon className="w-4 h-4"/> View Details
                      </button>
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
                    .map(assignment => (
                      <div key={assignment.id} className="group p-4 bg-gray-900/40 rounded-lg hover:bg-gray-800/70 transition-colors shadow-md border border-gray-700/50">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="text-lg font-medium text-blue-300 hover:text-blue-200 transition-colors">{assignment.title}</h4>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs sm:text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <FolderIcon className="w-4 h-4 text-purple-400"/> {assignment.subject}
                              </span>
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4 text-red-400" />
                                Due: {new Date(assignment.dueDate).toLocaleDateString()} {new Date(assignment.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${assignment.status === 'published' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                {assignment.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3 sm:mt-0 self-start sm:self-center">
                            <button 
                              onClick={() => handleViewSubmissions(assignment)}
                              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                              title="View Submissions"
                            >
                              <EyeIcon className="w-5 h-5 text-teal-400 hover:text-teal-300" />
                            </button>
                            <button 
                              onClick={() => handleEditAssignment(assignment)}
                              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                              title="Edit Assignment"
                            >
                              <PencilIcon className="w-5 h-5 text-blue-400 hover:text-blue-300" />
                            </button>
                            <button 
                              onClick={() => handleDeleteAssignment(assignment.id)}
                              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                              title="Delete Assignment"
                            >
                              <TrashIcon className="w-5 h-5 text-red-400 hover:text-red-300" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 border-t border-gray-700/50 pt-3">
                          <div className="text-center p-2 bg-gray-800/40 rounded-lg">
                            <p className="text-xs text-gray-400">Submissions</p>
                            <p className="text-lg font-bold text-white">{assignment.totalSubmissions || 0}</p>
                          </div>
                          <div className="text-center p-2 bg-gray-800/40 rounded-lg">
                            <p className="text-xs text-gray-400">Avg Grade</p>
                            <p className="text-lg font-bold text-white">
                              {typeof assignment.averageGrade === 'number' ? `${assignment.averageGrade}%` : '--'}
                            </p>
                          </div>
                          <div className="text-center p-2 bg-gray-800/40 rounded-lg">
                            <p className="text-xs text-gray-400">Max Points</p>
                            <p className="text-lg font-bold text-white">{assignment.maxPoints || 0}</p>
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
    </div>
  );
};

export default AssignmentManagement;