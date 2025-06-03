import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth } from '../../firebase/firebaseConfig';
import {
  DocumentTextIcon,
  CalendarIcon,
  // ChartBarIcon, // Not used in the provided JSX, but kept for potential future use
  XMarkIcon,
  // ChevronRightIcon, // Not used in the provided JSX, but kept for potential future use
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
  ResponsiveContainer, // Added for responsive charts
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
    const fetchAssignmentsData = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        console.warn('No authenticated user found.');
        // Potentially redirect to login or show an error message
        return;
      }
      try {
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

            // Ensure studentName and submittedAt are present, provide defaults if not
            const processedSubmissions = submissions.map(sub => ({
              ...sub,
              studentName: sub.studentName || 'Unknown Student',
              submittedAt: sub.submittedAt || new Date().toISOString(), // Default to now if not present
              grade: sub.grade === undefined || sub.grade === null ? 0 : sub.grade, // Default grade to 0 if not set
            }));


            return {
              ...assignment,
              submissions: processedSubmissions,
              totalSubmissions: processedSubmissions.length,
              // Ensure maxPoints is a positive number for calculations
              maxPoints: assignment.maxPoints > 0 ? assignment.maxPoints : 100, // Default maxPoints if invalid
              averageGrade: processedSubmissions.length > 0
                ? (processedSubmissions.reduce((acc, sub) => acc + (sub.grade || 0), 0) /
                  (processedSubmissions.length * (assignment.maxPoints > 0 ? assignment.maxPoints : 100))) * 100
                : 0,
              // Assuming totalStudentsEnrolled is a field on the assignment document
              totalStudentsEnrolled: assignment.totalStudentsEnrolled || 0,
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

  const generateGradeDistribution = (submissions, maxPointsAssignment) => {
    const distribution = {
      'A (90-100)': 0,
      'B (80-89)': 0,
      'C (70-79)': 0,
      'D (60-69)': 0,
      'F (0-59)': 0,
    };
    const validMaxPoints = maxPointsAssignment > 0 ? maxPointsAssignment : 100;

    submissions.forEach(sub => {
      const grade = sub.grade || 0;
      const percentage = (grade / validMaxPoints) * 100;
      if (percentage >= 90) distribution['A (90-100)']++;
      else if (percentage >= 80) distribution['B (80-89)']++;
      else if (percentage >= 70) distribution['C (70-79)']++;
      else if (percentage >= 60) distribution['D (60-69)']++;
      else distribution['F (0-59)']++;
    });

    return Object.entries(distribution).map(([gradeRange, count]) => ({
      gradeRange,
      count,
    }));
  };

  // Colors for charts
  const GRADE_BAR_COLOR = "#0ea5e9"; // sky-500
  const PIE_CHART_COLORS = ['#0ea5e9', '#475569']; // sky-500 (submitted), slate-600 (not submitted)


  const AssignmentDetails = ({ assignment, onClose }) => {
    const gradeDistribution = generateGradeDistribution(assignment.submissions, assignment.maxPoints);
    
    const submittedValue = assignment.totalSubmissions;
    const notSubmittedValue = assignment.totalStudentsEnrolled ? assignment.totalStudentsEnrolled - submittedValue : 0;

    const submissionPieData = [];
    if (submittedValue > 0) {
        submissionPieData.push({ name: 'Submitted', value: submittedValue });
    }
    // Only add "Not Submitted" if there are actually students who haven't submitted
    // or if totalStudentsEnrolled is known and greater than submitted.
    if (notSubmittedValue > 0) {
        submissionPieData.push({ name: 'Not Submitted', value: notSubmittedValue });
    } else if (submittedValue === 0 && assignment.totalStudentsEnrolled > 0) {
        // Case: No one submitted, but there are enrolled students
        submissionPieData.push({ name: 'Not Submitted', value: assignment.totalStudentsEnrolled });
    }

    // If after all checks, pie data is empty (e.g. 0 submissions, 0 enrolled), show a placeholder
    if (submissionPieData.length === 0) {
        submissionPieData.push({ name: 'No Data', value: 1, fill: '#334155' }); // slate-700
    }


    return (
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
        <div className="bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto ring-1 ring-slate-700 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700/50">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
              {assignment.title}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white bg-slate-700/80 hover:bg-slate-600/80 rounded-full p-1.5 transition-colors"
              aria-label="Close details"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Grade Distribution Chart */}
            <div className="bg-slate-700/40 p-6 rounded-xl shadow-lg">
              <h4 className="text-xl font-semibold text-sky-300 mb-6">Grade Distribution</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={gradeDistribution} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" /> {/* slate-700 */}
                  <XAxis dataKey="gradeRange" tick={{ fill: '#94a3b8' }} stroke="#475569" /> {/* slate-400, slate-600 */}
                  <YAxis allowDecimals={false} tick={{ fill: '#94a3b8' }} stroke="#475569" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', borderColor: '#334155', color: '#e2e8f0' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                    itemStyle={{ color: '#e2e8f0' }}
                    cursor={{ fill: 'rgba(14, 165, 233, 0.1)' }}
                  />
                  <Legend wrapperStyle={{ color: '#cbd5e1', paddingTop: '10px' }} />
                  <Bar dataKey="count" fill={GRADE_BAR_COLOR} name="Students" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Submission Status Chart */}
            <div className="bg-slate-700/40 p-6 rounded-xl shadow-lg">
              <h4 className="text-xl font-semibold text-sky-300 mb-6">Submission Status</h4>
              {submissionPieData.length > 0 && (submissionPieData[0].name !== 'No Data' || submissionPieData.length > 1) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={submissionPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      labelLine={false}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                        return (
                          <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12px">
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                    >
                      {submissionPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', borderColor: '#334155', color: '#e2e8f0' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Legend wrapperStyle={{ color: '#cbd5e1', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  No submission status data available.
                </div>
              )}
            </div>
          </div>

          {/* Student Submissions List */}
          {assignment.submissions && assignment.submissions.length > 0 ? (
            <div className="bg-slate-700/40 rounded-xl p-6 shadow-lg">
              <h4 className="text-xl font-semibold text-sky-300 mb-6">Student Submissions</h4>
              <div className="space-y-4">
                {assignment.submissions.map((submission) => (
                  <div key={submission.id || submission.studentName} className="bg-slate-700/70 p-4 rounded-lg shadow-sm hover:bg-slate-600/60 transition-colors duration-200 ease-in-out">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                      <div>
                        <p className="text-sky-400 font-medium text-lg">{submission.studentName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Submitted: {formatDate(submission.submittedAt)}
                        </p>
                      </div>
                      <div className="text-left sm:text-right mt-2 sm:mt-0">
                        <p className="text-lg font-semibold text-emerald-400">
                          Grade: {submission.grade ?? 'N/G'} / {assignment.maxPoints}
                        </p>
                        {assignment.maxPoints > 0 && submission.grade !== null && submission.grade !== undefined && (
                           <p className="text-sm text-emerald-300/80">
                            {(( (submission.grade || 0) / assignment.maxPoints) * 100).toFixed(1)}%
                          </p>
                        )}
                      </div>
                    </div>
                    {submission.feedback && (
                      <div className="mt-3 pt-3 border-t border-slate-600/50 text-sm">
                        <p className="font-medium text-slate-400 mb-1">Feedback:</p>
                        <p className="text-slate-300 italic opacity-90 whitespace-pre-wrap">{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-700/40 rounded-xl p-6 text-center text-slate-400">
                No submissions yet for this assignment.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
              Grades & Analytics
            </span>
          </h1>
          <p className="text-slate-400 text-lg">View assignment analytics and student performance.</p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-lg">
            <svg className="animate-spin h-8 w-8 text-sky-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading assignments...
          </div>
        ) : assignments.length === 0 ? (
           <div className="text-center py-12">
            <DocumentTextIcon className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No Assignments Found</h3>
            <p className="text-slate-500">You haven't created any assignments yet, or there was an issue loading them.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-slate-800 rounded-xl p-5 shadow-xl hover:shadow-sky-500/25 border border-slate-700 hover:border-sky-600/70 transition-all duration-300 ease-in-out transform hover:-translate-y-1.5 group cursor-pointer flex flex-col"
                onClick={() => {
                  setSelectedAssignment(assignment);
                  setShowDetails(true);
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-sky-400 group-hover:text-sky-300 transition-colors duration-200 flex-1 pr-2">
                    {assignment.title}
                  </h3>
                  <DocumentTextIcon className="w-7 h-7 text-slate-600 group-hover:text-sky-500 transition-colors duration-200 flex-shrink-0" />
                </div>

                <div className="text-xs text-slate-400 space-y-1.5 mb-4">
                  <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2 text-slate-500 flex-shrink-0" />
                    Assigned: {formatDate(assignment.createdAt)}
                  </div>
                  <div className="flex items-center">
                    <UsersIcon className="w-4 h-4 mr-2 text-slate-500 flex-shrink-0" />
                    Submissions: {assignment.totalSubmissions}
                    {assignment.totalStudentsEnrolled > 0 ? ` / ${assignment.totalStudentsEnrolled}` : ''}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-700/80 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Avg. Grade</p>
                    <p 
                      className="text-xl font-bold"
                      style={{ color: assignment.averageGrade >= 80 ? '#34d399' : (assignment.averageGrade >= 60 ? '#facc15' : '#f87171') }} // emerald-400, amber-400, red-400
                    >
                      {assignment.averageGrade.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-0.5">Max Points</p>
                    <p className="text-lg font-semibold text-slate-300">{assignment.maxPoints}</p>
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