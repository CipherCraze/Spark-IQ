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
  UsersIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const GradesAndAnalytics = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      // Fetch assignments created by the current teacher
      const assignmentsRef = collection(db, 'assignments');
      const q = query(assignmentsRef, where('teacherId', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      // Fetch submissions for each assignment
      const assignmentsData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const assignment = { id: doc.id, ...doc.data() };
          const submissionsQuery = query(
            collection(db, 'submissions'),
            where('assignmentId', '==', assignment.id)
          );
          const submissionsSnapshot = await getDocs(submissionsQuery);
          const submissions = submissionsSnapshot.docs.map(doc => doc.data());
          
          return {
            ...assignment,
            submissions,
            totalSubmissions: submissions.length,
            averageGrade: submissions.length > 0
              ? submissions.reduce((acc, sub) => acc + (sub.grade || 0), 0) / submissions.length
              : 0
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

  const generateGradeDistribution = (submissions) => {
    const distribution = {
      'A (90-100)': 0,
      'B (80-89)': 0,
      'C (70-79)': 0,
      'D (60-69)': 0,
      'F (0-59)': 0
    };

    submissions.forEach(sub => {
      const percentage = (sub.grade / sub.maxPoints) * 100;
      if (percentage >= 90) distribution['A (90-100)']++;
      else if (percentage >= 80) distribution['B (80-89)']++;
      else if (percentage >= 70) distribution['C (70-79)']++;
      else if (percentage >= 60) distribution['D (60-69)']++;
      else distribution['F (0-59)']++;
    });

    return Object.entries(distribution).map(([grade, count]) => ({
      grade,
      count
    }));
  };

  const COLORS = ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'];

  const AssignmentDetails = ({ assignment, onClose }) => {
    const gradeDistribution = generateGradeDistribution(assignment.submissions);
    const submissionData = [
      { name: 'Submitted', value: assignment.totalSubmissions },
      { name: 'Not Submitted', value: assignment.totalStudents - assignment.totalSubmissions }
    ];

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-xl p-8 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {assignment.title}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Grade Distribution Chart */}
            <div className="bg-gray-700/50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-4">Grade Distribution</h4>
              <BarChart width={400} height={300} data={gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </div>

            {/* Submission Status Chart */}
            <div className="bg-gray-700/50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-4">Submission Status</h4>
              <PieChart width={400} height={300}>
                <Pie
                  data={submissionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {submissionData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          </div>

          {/* Student Submissions List */}
          <div className="bg-gray-700/50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Student Submissions</h4>
            <div className="space-y-4">
              {assignment.submissions.map((submission, index) => (
                <div key={index} className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{submission.studentName}</p>
                      <p className="text-sm text-gray-400">
                        Submitted: {formatDate(submission.submittedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">
                        Grade: {submission.grade}/{assignment.maxPoints}
                      </p>
                      <p className="text-sm text-gray-400">
                        {((submission.grade / assignment.maxPoints) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  {submission.feedback && (
                    <div className="mt-2 text-sm text-gray-300">
                      <p className="font-medium">Feedback:</p>
                      <p className="mt-1">{submission.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Grades & Analytics
            </span>
          </h1>
          <p className="text-gray-400">View assignment analytics and student performance</p>
        </header>

        {loading ? (
          <div className="text-center text-gray-400">Loading assignments...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        Assigned: {formatDate(assignment.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <UsersIcon className="w-4 h-4" />
                        Submissions: {assignment.totalSubmissions}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">
                      Avg Grade: {assignment.averageGrade.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-400">
                      Max Points: {assignment.maxPoints}
                    </p>
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

export default GradesAndAnalytics; 