import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth } from '../../firebase/firebaseConfig';
import {
  DocumentTextIcon,
  CalendarIcon,
  // ChartBarIcon, // Not directly used for grade value here, color logic handles it
  XMarkIcon,
  ChevronRightIcon,
  ChatBubbleLeftEllipsisIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  SparklesIcon, // For AI-Graded
} from '@heroicons/react/24/outline';

const GradesAndFeedback = () => {
  const [assignments, setAssignments] = useState([]); // Holds submission data
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const getStatusText = (status) => {
    switch (status) {
      case 'graded':
        return 'Graded';
      case 'pending':
        return 'Pending Grading';
      case 'submitted':
        return 'Submitted';
      default:
        return 'Not Graded';
    }
  };

  useEffect(() => {
    const fetchStudentAssignments = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        console.warn('No authenticated user for Grades & Feedback.');
        return;
      }
      try {
        setLoading(true);
        const submissionsRef = collection(db, 'submissions');
        const q = query(
          submissionsRef,
          where('studentId', '==', auth.currentUser.uid),
          orderBy('submittedAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const submissionsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const submittedAt = data.submittedAt?.toDate?.() || (data.submittedAt ? new Date(data.submittedAt) : new Date());
          const gradedAt = data.gradedAt?.toDate?.() || (data.gradedAt ? new Date(data.gradedAt) : null);
          
          // Determine submission status
          let status = data.status || 'submitted';
          if (data.grade !== null && data.grade !== undefined) {
            status = 'graded';
          } else if (data.status === 'submitted') {
            status = 'pending';
          }
          
          return {
            id: doc.id,
            ...data,
            submittedAt,
            gradedAt,
            maxPoints: data.maxPoints || 100,
            grade: data.grade !== undefined ? data.grade : null,
            status
          };
        });
        setAssignments(submissionsData);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (auth.currentUser) {
        fetchStudentAssignments();
    } else {
        // Handle case where user might not be immediately available,
        // or set up an auth state listener. For now, simple check.
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                fetchStudentAssignments();
            } else {
                setLoading(false);
                console.warn('No authenticated user for Grades & Feedback after auth state change.');
            }
        });
        return () => unsubscribe(); // Cleanup listener
    }
  }, []);

  const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';
    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e, 'Input:', dateInput);
      return 'Invalid Date';
    }
  };

  const getGradeColor = (grade, maxPoints) => {
    if (grade === null || grade === undefined || maxPoints <= 0) return 'text-slate-400';
    const percentage = (grade / maxPoints) * 100;
    if (percentage >= 90) return 'text-emerald-400';
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 70) return 'text-yellow-400';
    if (percentage >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const AssignmentDetails = ({ assignment, onClose }) => {
    if (!assignment) return null;

    const hasFeedback = assignment.feedback && assignment.feedback.trim() !== "";
    const hasSuggestions = assignment.suggestions && Array.isArray(assignment.suggestions) && assignment.suggestions.length > 0;
    const isAIGraded = assignment.gradedAt && assignment.status === 'graded';

    return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
            {assignment.title || "Assignment Details"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-700/80 hover:bg-slate-600/80 rounded-full p-1.5"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-slate-700/40 p-5 rounded-xl shadow-lg">
              <p className="text-sm text-sky-300/80 font-medium mb-1.5">Submitted On</p>
              <p className="text-slate-100 text-lg font-semibold">
                {formatDate(assignment.submittedAt)}
              </p>
            </div>
            <div className="bg-slate-700/40 p-5 rounded-xl shadow-lg">
              <p className="text-sm text-sky-300/80 font-medium mb-1.5">Status</p>
              <div className="flex items-center justify-between">
                <p className={`text-lg font-semibold ${
                  assignment.status === 'graded' ? 'text-emerald-400' :
                  assignment.status === 'pending' ? 'text-amber-400' :
                  'text-slate-400'
                }`}>
                  {getStatusText(assignment.status)}
                </p>
                {assignment.grade !== null && assignment.grade !== undefined && (
                  <p className={`text-xl font-bold ${getGradeColor(assignment.grade, assignment.maxPoints)}`}>
                    {assignment.grade} / {assignment.maxPoints}
                    {assignment.maxPoints > 0 && (
                      <span className="text-base font-normal text-slate-400 ml-2">
                        ({((assignment.grade / assignment.maxPoints) * 100).toFixed(1)}%)
                      </span>
                    )}
                  </p>
                )}
              </div>
              {isAIGraded && (
                <p className="text-xs text-slate-400 mt-1 flex items-center">
                  <SparklesIcon className="w-4 h-4 mr-1 text-yellow-400" />
                  AI-Graded {assignment.gradedAt ? `on ${formatDate(assignment.gradedAt)}` : ''}
                </p>
              )}
            </div>
          </div>

          {assignment.instructions && (
            <div className="bg-slate-700/40 p-5 rounded-xl shadow-lg">
              <h4 className="text-lg font-semibold text-sky-300 mb-3">Assignment Description</h4>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {assignment.instructions}
              </p>
            </div>
          )}

          <div className="bg-slate-700/40 p-5 rounded-xl shadow-lg">
            <h4 className="text-lg font-semibold text-sky-300 mb-3 flex items-center">
              <ChatBubbleLeftEllipsisIcon className="w-6 h-6 mr-2 text-sky-400" />
              {isAIGraded ? 'AI Feedback' : 'Feedback'}
            </h4>
            {hasFeedback ? (
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap italic">
                {assignment.feedback}
              </p>
            ) : (
              <p className="text-slate-400 italic">
                {assignment.status === 'graded' ? 'No specific feedback was provided.' : 'Feedback will be available after grading.'}
              </p>
            )}
          </div>

          { (hasSuggestions || (isAIGraded && !hasSuggestions && hasFeedback) ) && ( // Show suggestions section if AI graded, even if suggestions are empty but feedback exists
            <div className="bg-slate-700/40 p-5 rounded-xl shadow-lg">
              <h4 className="text-lg font-semibold text-sky-300 mb-3 flex items-center">
                <LightBulbIcon className="w-6 h-6 mr-2 text-yellow-400" />
                Suggestions for Improvement
              </h4>
              {hasSuggestions ? (
                <ul className="list-disc list-inside space-y-2 text-slate-300 pl-2">
                  {assignment.suggestions.map((suggestion, index) => (
                    <li key={index} className="leading-relaxed">{suggestion}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400 italic">
                  No specific suggestions were provided.
                </p>
              )}
            </div>
          )}

          {!hasFeedback && !hasSuggestions && assignment.grade !== null && assignment.grade !== undefined && !isAIGraded && (
            <div className="bg-slate-700/40 p-5 rounded-xl shadow-lg text-center">
              <p className="text-slate-400">
                Your assignment has been graded. No additional AI feedback or suggestions were generated for this submission.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
              Your Grades & Feedback
            </span>
          </h1>
          <p className="text-slate-400 text-lg">Review your performance and feedback on submitted assignments.</p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-lg">
            <svg className="animate-spin h-8 w-8 text-sky-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading your grades and feedback...
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-16">
            <DocumentTextIcon className="w-20 h-20 mx-auto text-slate-600 mb-6" />
            <h3 className="text-2xl font-semibold text-slate-300 mb-3">No Submissions Found</h3>
            <p className="text-slate-500 max-w-md mx-auto">It looks like you haven't submitted any assignments yet, or there's no graded work to display at the moment.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {assignments.map((submission) => (
              <div
                key={submission.id}
                className="bg-slate-800 rounded-xl p-6 shadow-xl hover:shadow-sky-500/20 border border-slate-700 hover:border-sky-600/70 transition-all duration-300 ease-in-out transform hover:-translate-y-1 group cursor-pointer"
                onClick={() => {
                  setSelectedAssignment(submission);
                  setShowDetails(true);
                }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-sky-400 group-hover:text-sky-300 transition-colors duration-200 mb-1.5">
                      {submission.title || "Untitled Assignment"}
                    </h3>
                    <div className="flex items-center text-sm text-slate-400">
                      <CalendarIcon className="w-4 h-4 mr-1.5 text-slate-500 flex-shrink-0" />
                      Submitted: {formatDate(submission.submittedAt)}
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end mt-3 sm:mt-0 gap-4">
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-slate-500 mb-0.5">Status</p>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-md text-sm font-medium ${
                          submission.status === 'graded' ? 'bg-emerald-500/20 text-emerald-400' :
                          submission.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {getStatusText(submission.status)}
                        </span>
                        {submission.grade !== null && submission.grade !== undefined && (
                          <span className={`text-lg font-bold ${getGradeColor(submission.grade, submission.maxPoints)}`}>
                            {submission.grade} / {submission.maxPoints}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRightIcon className="w-7 h-7 text-slate-500 group-hover:text-sky-400 transition-colors duration-200 flex-shrink-0" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDetails && selectedAssignment && (
        <AssignmentDetails
          assignment={selectedAssignment}
          onClose={() => {
            setShowDetails(false);
            setSelectedAssignment(null);
          }}
        />
      )}
    </div>
  );
};

export default GradesAndFeedback;