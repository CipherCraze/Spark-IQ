import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'; // Added doc, getDoc
import { auth } from '../../firebase/firebaseConfig';
import {
  DocumentTextIcon,
  CalendarIcon,
  ChartBarIcon, // Represents the grade value
  XMarkIcon,
  ChevronRightIcon,
  ChatBubbleLeftEllipsisIcon, // For feedback
  LightBulbIcon, // For suggestions
  ExclamationTriangleIcon, // For pending grades or issues
} from '@heroicons/react/24/outline';

const GradesAndFeedback = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchStudentAssignments = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        console.warn('No authenticated user for Grades & Feedback.');
        // Optionally, redirect to login or show a message
        return;
      }
      try {
        setLoading(true);
        const submissionsRef = collection(db, 'submissions');
        const q = query(submissionsRef, where('studentId', '==', auth.currentUser.uid));
        const submissionsSnapshot = await getDocs(q);

        if (submissionsSnapshot.empty) {
          setAssignments([]);
          setLoading(false);
          return;
        }

        const assignmentsDataPromises = submissionsSnapshot.docs.map(async (subDoc) => {
          const submissionData = { subId: subDoc.id, ...subDoc.data() };
          const assignmentId = submissionData.assignmentId;

          if (!assignmentId) {
            console.warn('Submission found without an assignmentId:', submissionData.subId);
            return null;
          }

          const assignmentRef = doc(db, 'assignments', assignmentId);
          const assignmentSnap = await getDoc(assignmentRef);

          if (!assignmentSnap.exists()) {
            console.warn(`Assignment with ID ${assignmentId} not found for submission ${submissionData.subId}.`);
            return null;
          }

          const assignmentDetails = assignmentSnap.data();
          return {
            ...assignmentDetails,
            id: assignmentSnap.id,
            submission: {
              ...submissionData,
              grade: (submissionData.grade === undefined || submissionData.grade === null) ? null : submissionData.grade,
              feedback: submissionData.feedback || null, // Keep null if no feedback
              submittedAt: submissionData.submittedAt || new Date().toISOString(), // Fallback
              suggestions: submissionData.suggestions || [],
            },
            maxPoints: assignmentDetails.maxPoints > 0 ? assignmentDetails.maxPoints : 100,
          };
        });

        const resolvedAssignmentsData = (await Promise.all(assignmentsDataPromises)).filter(item => item !== null);
        setAssignments(resolvedAssignmentsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching assignments for student:', error);
        setLoading(false);
        // Consider setting an error state to display to the user
      }
    };

    fetchStudentAssignments();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const getGradeColor = (grade, maxPoints) => {
    if (grade === null || maxPoints <= 0) return 'text-slate-400'; // Neutral for pending/error
    const percentage = (grade / maxPoints) * 100;
    if (percentage >= 90) return 'text-emerald-400';
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 70) return 'text-yellow-400';
    if (percentage >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const AssignmentDetails = ({ assignment, onClose }) => {
    const hasFeedback = assignment.submission.feedback && assignment.submission.feedback.trim() !== "";
    const hasSuggestions = assignment.submission.suggestions && assignment.submission.suggestions.length > 0;

    return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto ring-1 ring-slate-700 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700/50">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent pr-4">
            {assignment.title}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-700/80 hover:bg-slate-600/80 rounded-full p-1.5 transition-colors flex-shrink-0"
            aria-label="Close details"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-8">
          {/* Key Information Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-slate-700/40 p-5 rounded-xl shadow-lg">
              <p className="text-sm text-sky-300/80 font-medium mb-1.5">Submitted On</p>
              <p className="text-slate-100 text-lg font-semibold">{formatDate(assignment.submission.submittedAt)}</p>
            </div>
            <div className="bg-slate-700/40 p-5 rounded-xl shadow-lg">
              <p className="text-sm text-sky-300/80 font-medium mb-1.5">Grade</p>
              {assignment.submission.grade !== null ? (
                <p className={`text-xl font-bold ${getGradeColor(assignment.submission.grade, assignment.maxPoints)}`}>
                  {assignment.submission.grade} / {assignment.maxPoints}
                  <span className="text-base font-normal text-slate-400 ml-2">
                    ({((assignment.submission.grade / assignment.maxPoints) * 100).toFixed(1)}%)
                  </span>
                </p>
              ) : (
                <p className="text-lg font-semibold text-slate-400 flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-amber-400"/>
                  Pending
                </p>
              )}
            </div>
          </div>

          {/* Assignment Description */}
          {assignment.instructions && (
            <div className="bg-slate-700/40 p-5 rounded-xl shadow-lg">
              <h4 className="text-lg font-semibold text-sky-300 mb-3">Assignment Description</h4>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{assignment.instructions}</p>
            </div>
          )}

          {/* Feedback Section */}
          <div className="bg-slate-700/40 p-5 rounded-xl shadow-lg">
            <h4 className="text-lg font-semibold text-sky-300 mb-3 flex items-center">
              <ChatBubbleLeftEllipsisIcon className="w-6 h-6 mr-2 text-sky-400" />
              Feedback from Teacher
            </h4>
            {hasFeedback ? (
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap italic">{assignment.submission.feedback}</p>
            ) : (
              <p className="text-slate-400 italic">No specific feedback has been provided for this submission yet.</p>
            )}
          </div>


          {/* Suggestions for Improvement */}
          {hasSuggestions && (
            <div className="bg-slate-700/40 p-5 rounded-xl shadow-lg">
              <h4 className="text-lg font-semibold text-sky-300 mb-3 flex items-center">
                <LightBulbIcon className="w-6 h-6 mr-2 text-yellow-400" />
                Suggestions for Improvement
              </h4>
              <ul className="list-disc list-inside space-y-2 text-slate-300 pl-2">
                {assignment.submission.suggestions.map((suggestion, index) => (
                  <li key={index} className="leading-relaxed">{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
          {!hasFeedback && !hasSuggestions && assignment.submission.grade !== null && (
            <div className="bg-slate-700/40 p-5 rounded-xl shadow-lg text-center">
              <p className="text-slate-400">Your assignment has been graded. No additional feedback or suggestions were provided.</p>
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
            Loading your assignments...
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-16">
            <DocumentTextIcon className="w-20 h-20 mx-auto text-slate-600 mb-6" />
            <h3 className="text-2xl font-semibold text-slate-300 mb-3">No Submissions Found</h3>
            <p className="text-slate-500 max-w-md mx-auto">It looks like you haven't submitted any assignments yet, or there's no graded work to display at the moment.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-slate-800 rounded-xl p-6 shadow-xl hover:shadow-sky-500/20 border border-slate-700 hover:border-sky-600/70 transition-all duration-300 ease-in-out transform hover:-translate-y-1 group cursor-pointer"
                onClick={() => {
                  setSelectedAssignment(assignment);
                  setShowDetails(true);
                }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-sky-400 group-hover:text-sky-300 transition-colors duration-200 mb-1.5">
                      {assignment.title}
                    </h3>
                    <div className="flex items-center text-sm text-slate-400">
                      <CalendarIcon className="w-4 h-4 mr-1.5 text-slate-500 flex-shrink-0" />
                      Submitted: {formatDate(assignment.submission.submittedAt)}
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end mt-3 sm:mt-0 gap-4">
                     <div className="text-left sm:text-right">
                      <p className="text-xs text-slate-500 mb-0.5">Grade</p>
                      {assignment.submission.grade !== null ? (
                        <p className={`text-lg font-bold ${getGradeColor(assignment.submission.grade, assignment.maxPoints)}`}>
                          {assignment.submission.grade} / {assignment.maxPoints}
                        </p>
                      ) : (
                        <p className="text-sm font-medium text-amber-400 flex items-center">
                          <ExclamationTriangleIcon className="w-4 h-4 mr-1"/>
                          Pending
                        </p>
                      )}
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
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};

export default GradesAndFeedback;