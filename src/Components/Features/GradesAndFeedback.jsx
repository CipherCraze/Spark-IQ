import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth } from '../../firebase/firebaseConfig';
import {
  DocumentTextIcon,
  CalendarIcon,
  ChartBarIcon,
  XMarkIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const GradesAndFeedback = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      // Fetch submissions for the current student
      const submissionsRef = collection(db, 'submissions');
      const q = query(submissionsRef, where('studentId', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      // Get all assignment IDs from submissions
      const assignmentIds = querySnapshot.docs.map(doc => doc.data().assignmentId);
      
      // Fetch assignment details for each submission
      const assignmentsData = await Promise.all(
        assignmentIds.map(async (assignmentId) => {
          const assignmentDoc = await getDocs(query(collection(db, 'assignments'), where('id', '==', assignmentId)));
          const submissionDoc = querySnapshot.docs.find(doc => doc.data().assignmentId === assignmentId);
          
          return {
            id: assignmentId,
            ...assignmentDoc.docs[0].data(),
            submission: submissionDoc.data()
          };
        })
      );

      setAssignments(assignmentsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const AssignmentDetails = ({ assignment, onClose }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {assignment.title}
        </h3>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Submitted On</p>
              <p className="text-white font-medium">{formatDate(assignment.submission.submittedAt)}</p>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Grade</p>
              <p className="text-white font-medium">{assignment.submission.grade}/{assignment.maxPoints}</p>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-2">Assignment Description</h4>
            <p className="text-gray-300">{assignment.instructions}</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-2">Feedback</h4>
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-gray-300 whitespace-pre-wrap">{assignment.submission.feedback}</p>
            </div>
          </div>

          {assignment.submission.suggestions && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Suggestions for Improvement</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                {assignment.submission.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Grades & Feedback
            </span>
          </h1>
          <p className="text-gray-400">View your assignment grades and feedback</p>
        </header>

        {loading ? (
          <div className="text-center text-gray-400">Loading assignments...</div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700/50 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedAssignment(assignment);
                  setShowDetails(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{assignment.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        Submitted: {formatDate(assignment.submission.submittedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <ChartBarIcon className="w-4 h-4" />
                        Grade: {assignment.submission.grade}/{assignment.maxPoints}
                      </span>
                    </div>
                  </div>
                  <ChevronRightIcon className="w-6 h-6 text-gray-400" />
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