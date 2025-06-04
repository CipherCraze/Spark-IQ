import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth } from '../../firebase/firebaseConfig';
import {
  DocumentTextIcon,
  CalendarIcon,
  XMarkIcon,
  ChevronRightIcon,
  UsersIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const GradesAndAnalytics = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchAssignmentsData = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        console.warn('No authenticated user found.');
        return;
      }
      try {
        setLoading(true);
        const assignmentsRef = collection(db, 'assignments');
        const q = query(assignmentsRef, where('teacherId', '==', auth.currentUser.uid));
        const querySnapshot = await getDocs(q);

        const assignmentsData = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const assignment = { id: doc.id, ...doc.data() };
            const submissionsQuery = query(
              collection(db, 'submissions'),
              where('assignmentId', '==', assignment.id)
            );
            const submissionsSnapshot = await getDocs(submissionsQuery);
            const submissions = submissionsSnapshot.docs.map(subDoc => ({ id: subDoc.id, ...subDoc.data() }));

            // Calculate statistics
            const totalSubmissions = submissions.length;
            const gradedSubmissions = submissions.filter(sub => sub.grade !== null && sub.grade !== undefined);
            const averageGrade = gradedSubmissions.length > 0
              ? gradedSubmissions.reduce((acc, sub) => acc + sub.grade, 0) / gradedSubmissions.length
              : 0;

            // Calculate grade distribution
            const gradeDistribution = {
              'A (90-100)': 0,
              'B (80-89)': 0,
              'C (70-79)': 0,
              'D (60-69)': 0,
              'F (0-59)': 0
            };

            gradedSubmissions.forEach(sub => {
              const percentage = (sub.grade / assignment.maxPoints) * 100;
              if (percentage >= 90) gradeDistribution['A (90-100)']++;
              else if (percentage >= 80) gradeDistribution['B (80-89)']++;
              else if (percentage >= 70) gradeDistribution['C (70-79)']++;
              else if (percentage >= 60) gradeDistribution['D (60-69)']++;
              else gradeDistribution['F (0-59)']++;
            });

            return {
              ...assignment,
              submissions,
              totalSubmissions,
              gradedSubmissions: gradedSubmissions.length,
              averageGrade,
              gradeDistribution,
              submissionRate: (totalSubmissions / (assignment.totalStudentsEnrolled || 1)) * 100
            };
          })
        );

        setAssignments(assignmentsData);
      } catch (error) {
        console.error('Error fetching assignments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentsData();
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

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#6B7280'];

  const AssignmentDetails = ({ assignment, onClose }) => {
    const gradeDistributionData = Object.entries(assignment.gradeDistribution).map(([grade, count]) => ({
      name: grade,
      value: count
    }));

    const submissionTrendData = [
      { name: 'Submitted', value: assignment.totalSubmissions },
      { name: 'Not Submitted', value: (assignment.totalStudentsEnrolled || 0) - assignment.totalSubmissions }
    ];

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-2xl p-6 sm:p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {assignment.title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-700/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Total Submissions</p>
              <p className="text-2xl font-bold text-white">{assignment.totalSubmissions}</p>
            </div>
            <div className="bg-gray-700/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Average Grade</p>
              <p className="text-2xl font-bold text-white">{assignment.averageGrade.toFixed(1)}%</p>
            </div>
            <div className="bg-gray-700/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Submission Rate</p>
              <p className="text-2xl font-bold text-white">{assignment.submissionRate.toFixed(1)}%</p>
            </div>
            <div className="bg-gray-700/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Max Points</p>
              <p className="text-2xl font-bold text-white">{assignment.maxPoints}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Grade Distribution Pie Chart */}
            <div className="bg-gray-700/30 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Grade Distribution</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gradeDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {gradeDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Submission Rate Bar Chart */}
            <div className="bg-gray-700/30 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Submission Status</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={submissionTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6">
                      {submissionTrendData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#EF4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Student Submissions List */}
          <div className="mt-8">
            <h4 className="text-lg font-semibold text-white mb-4">Student Submissions</h4>
            <div className="bg-gray-700/30 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Submitted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Grade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {assignment.submissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-gray-700/30">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {submission.studentName || 'Unknown Student'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {formatDate(submission.submittedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {submission.grade !== null && submission.grade !== undefined ? (
                            <span className="text-white font-medium">
                              {submission.grade} / {assignment.maxPoints}
                            </span>
                          ) : (
                            <span className="text-gray-400">Not Graded</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            submission.status === 'graded' ? 'bg-green-500/20 text-green-400' :
                            submission.status === 'submitted' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {submission.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Grades & Analytics
            </span>
          </h1>
          <p className="text-gray-400">View detailed analytics and performance metrics for all assignments.</p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/50 rounded-xl">
            <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-400">No assignments found</h3>
            <p className="text-gray-500 mt-2">Create assignments to start tracking student performance.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-gray-800/50 rounded-xl p-6 hover:bg-gray-800/70 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedAssignment(assignment);
                  setShowDetails(true);
                }}
              >
                <h3 className="text-xl font-semibold text-white mb-4">{assignment.title}</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Submissions</p>
                    <p className="text-lg font-semibold text-white">{assignment.totalSubmissions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Average Grade</p>
                    <p className="text-lg font-semibold text-white">{assignment.averageGrade.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Due: {formatDate(assignment.dueDate)}</span>
                  <ChevronRightIcon className="w-5 h-5" />
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

export default GradesAndAnalytics;