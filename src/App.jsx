import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Components/Header';
import Footer from './Components/Footer';
import Hero from './Components/LandingPage/Hero';
import CTA from './Components/LandingPage/CTA';
import Login from './Components/Login';
import HowItWorks from './Components/HowItWorks';
import Signup from './Components/Signup';
import Team from './Components/Team';
import Support from './Components/Support';
import Pricing from './Components/Pricing';
import Features from './Components/LandingPage/Features';
import Testimonials from './Components/LandingPage/Testimonials';
import Newsletter from './Components/LandingPage/Newsletter';
import Dashboard from './Components/dashboard/Dashboard';
import ChatbotAccess from './Components/Chatbot/Chatbot';
import ChatbotEducation from './Components/Chatbot/Chatbot-Educator';
import AssignmentSubmission from './Components/Features/AssignmentSubmission';
import ChatFunctionality from './Components/Features/ChatFunctionality';
import StudentTests from './Components/Features/StudentTests';
import TeacherTests from './Components/Features/TeacherTests';
import AttendanceMonitoring from './Components/Features/AttendanceMonitoring';
import ResourceUtilization from './Components/Features/ResourceUtilization';
import Grades from './Components/Features/GradingAccess';
import AIGeneratedQuestions from './Components/Features/AIGeneratedQuestions';
import SuggestionsInbox from './Components/Features/SuggestionsInbox';
import NotFound from './Components/NotFound';
import EducatorDashboard from './Components/dashboard/EducatorDashboard';
import AssignmentManagement from './Components/Features/AssignmentManagement';
import GradingSystem from './Components/Features/GradingSytem';
import EducationalNewsPage from './Components/Features/EducationalNewsPage';
import Profile from './Components/Features/Profile';
import Settings from './Components/Features/Settings';
import SmartReview from './Components/Features/SmartReview';
import ResourceManagement from './Components/Features/ResourceManagement';
import AttendanceTracking from './Components/Features/AttendanceTracking';
import FeedbackDashboard from './Components/Features/FeedbackDashboard';
import SuggestionsToStudents from './Components/Features/SuggestionsToStudents';
import MeetingHost from './Components/MeetingHost';
import CollaborationHub from './Components/Features/CollaborationHub';
import AnnouncementsPage from './Components/Features/AnnouncementsPage';
import Meeting from './Components/Meetings';
import Meetings from './Components/Meetings';
import UserProfile from './Components/Features/UserProfile';
import EducatorProfilePage from './Components/Features/EducatorProfilePage';
import EducatorSettings from './Components/Features/EducatorSettings';
import ViewOnlyProfile from './Components/Features/ViewOnlyProfile';
import GradesAndAnalytics from './Components/Features/GradesAndAnalytics';
import GradesAndFeedback from './Components/Features/GradesAndFeedback';
import VoiceChat from './Components/Chatbot/VoiceChat';
import TeacherVoiceChat from './Components/Chatbot/TeacherVoiceChat';
import './styles/animations.css';
import { AuthProvider } from './context/AuthContext';
import PersonalizedFeedback from './Components/Features/PersonalizedFeedbackStudents';
import PersonalizedTeacherFeedback from './Components/Features/PersonalizedTeacherFeedback';
import { trackPageView } from './firebase/analytics';
import AIGeneratedQuestionseducator from './Components/Features/AIGeneratedQuestionsTeachers';

// Page view tracking component
const PageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view when location changes
    trackPageView(location.pathname, document.title);
  }, [location]);

  return null;
};

const Layout = ({ children, showHeaderFooter = true }) => (
  <div className="flex flex-col min-h-screen">
    {showHeaderFooter && <Header />}
    <main className="flex-grow">
      {children}
    </main>
    {showHeaderFooter && <Footer />}
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <PageViewTracker />
        <Routes>
          {/* Landing Page */}
          <Route
            path="/"
            element={
              <Layout>
                <div className="landing-page">
                  <Hero />
                  <Features />
                  <Testimonials />
                  <CTA />
                  <Newsletter />
                </div>
              </Layout>
            }
          />

          {/* Other Pages */}
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/signup" element={<Layout><Signup /></Layout>} />
          <Route path="/how-it-works" element={<Layout><HowItWorks /></Layout>} />
          <Route path="/team" element={<Layout><Team /></Layout>} />
          <Route path="/support" element={<Layout><Support /></Layout>} />
          <Route path="/pricing" element={<Layout><Pricing /></Layout>} />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <Layout showHeaderFooter={false}>
                <Dashboard role="student" />
              </Layout>
            }
          />
          {/* Educator Dashboard */}
          <Route
            path="/educator-dashboard"
            element={
              <Layout showHeaderFooter={false}>
                <EducatorDashboard role="educator" />
              </Layout>
            }
          />
          {/* Profile Routes */}
          <Route
            path="/profile"
            element={
              <Layout showHeaderFooter={false}>
                <Profile />
              </Layout>
            }
          />
          {/* View Only Profile Route (for viewing from chat) */}
          <Route
            path="/view-profile/:userId"
            element={
              <Layout showHeaderFooter={false}>
                <ViewOnlyProfile />
              </Layout>
            }
          />
          {/* User Profile Route (for viewing other users from chat) */}
          <Route
            path="/user-profile/:userId"
            element={
              <Layout showHeaderFooter={false}>
                <UserProfile />
              </Layout>
            }
          />
          {/* Profile with ID Route (for viewing own profile from dashboard) */}
          <Route
            path="/profile/:userId"
            element={
              <Layout showHeaderFooter={false}>
                <Profile />
              </Layout>
            }
          />
          {/* Settings Route */}
          <Route
            path="/settings"
            element={
              <Layout showHeaderFooter={false}>
                <Settings />
              </Layout>
            }
          /> 
          {/* Educator Profile Page */}
          <Route
            path="/educator-profile"
            element={
              <Layout showHeaderFooter={false}>
                <EducatorProfilePage />
              </Layout>
            }
          />
          {/* Educator Settings */}
          <Route
            path="/educator-settings"
            element={
              <Layout showHeaderFooter={false}>
                <EducatorSettings />
              </Layout>
            }
          />
          {/* Assignment Management */}
          <Route
            path="/assignment-management"
            element={
              <Layout showHeaderFooter={false}>
                <AssignmentManagement />
              </Layout>
            }
          />
          {/* Resource Management */}
          <Route
            path="/resource-management"
            element={
              <Layout showHeaderFooter={false}>
                <ResourceManagement />
              </Layout>
            }
          />
          {/* Attendance Tracking */}
          <Route
            path="/attendance-tracking"
            element={<AttendanceTracking />}
          />

        
          {/* Suggestions to Students */}
          <Route
            path="/suggestions-to-students"
            element={<SuggestionsToStudents />}
          />
          {/* Meeting Host */}
          <Route
            path="/meeting-host"
            element={
              <Layout showHeaderFooter={false}>
                <MeetingHost />
              </Layout>
            }
          />
          
          {/* Announcements Page */}
          <Route
            path="/announcements"
            element={
              <Layout showHeaderFooter={false}>
                <AnnouncementsPage />
              </Layout>
            }
          />
          
          {/* Smart Review */}
          <Route
            path="/smart-review"
            element={
              <Layout showHeaderFooter={false}>
                <SmartReview />
              </Layout>
            }
          />

          
            {/* Voice Chat */}
          <Route
            path="/voice-chat"
            element={
              <Layout showHeaderFooter={false}>
                <VoiceChat />
              </Layout>
            }
          />
          {/* Teacher Voice Chat */}
          <Route
            path="/teacher-voice-chat"
            element={
              <Layout showHeaderFooter={false}>
                <TeacherVoiceChat />
              </Layout>
            }
          />
          {/* Voice Chat */}
          <Route
            path="/voice-chat"
            element={
              <Layout showHeaderFooter={false}>
                <VoiceChat />
              </Layout>
            }
          />
          {/* Teacher Voice Chat */}
          <Route
            path="/teacher-voice-chat"
            element={
              <Layout showHeaderFooter={false}>
                <TeacherVoiceChat />
              </Layout>
            }
          />
          {/* Resource Utilization */}
          <Route
            path="/resource-utilization"
            element={
              <Layout showHeaderFooter={false}>
                <ResourceUtilization />
              </Layout>
            }
          />
          {/* Personalized Feedback For Students */}
          <Route
            path="/personalized-feedback-students"
            element={
              <Layout showHeaderFooter={false}>
                <PersonalizedFeedback />
              </Layout>
            }
          />
          {/* Personalized Feedback For Educators */}
          <Route
            path="/personalized-feedback-educators"
            element={
              <Layout showHeaderFooter={false}>
                <PersonalizedTeacherFeedback />
              </Layout>
            }
          />
          {/* Pricing */}
          <Route
            path="/pricing"
            element={
              <Layout showHeaderFooter={false}>
                <Pricing />
              </Layout>
            }
          />
          {/* Chatbot Route */}
          <Route
            path="/chatbot-access"
            element={
              <Layout showHeaderFooter={false}>
                <ChatbotAccess />
              </Layout>
            }
          />
          {/* Chatbot Education */}
          <Route
            path="/chatbot-education"
            element={
              <Layout showHeaderFooter={false}>
                <ChatbotEducation />
              </Layout>
            }
          />
          

          {/* Assignment Submission Route */}
          <Route
            path="/assignment-submission"
            element={
              <Layout showHeaderFooter={false}>
                <AssignmentSubmission />
              </Layout>
            }
          />
            
          {/* Suggestions Inbox Route */}
          <Route
            path="/inbox-for-suggestions"
            element={
              <Layout showHeaderFooter={false}>
                <SuggestionsInbox />
              </Layout>
            }
          />
            {/* Chat Functionality Route */}
          <Route
            path="/chat-functionality"
            element={
              <Layout showHeaderFooter={false}>
                <ChatFunctionality />
              </Layout>
            }
          />
          {/*Attendance Monitoring */}
          <Route
            path="/attendance-monitoring"
            element={
              <Layout showHeaderFooter={false}>
                <AttendanceMonitoring />
              </Layout>
            }
          />
          {/*AI Generated Questions */}
          <Route
            path="/ai-generated-questions"
            element={
              <Layout showHeaderFooter={false}>
                <AIGeneratedQuestions />
              </Layout>
            }
          />
          {/*AI Generated Questions for Educators */}
          <Route
            path="/ai-generated-questions-educator"
            element={
              <Layout showHeaderFooter={false}>
                <AIGeneratedQuestionseducator />
              </Layout>
            }
          />
          {/*Meeting */}
          <Route
            path="/meeting-participation"
            element={
              <Layout showHeaderFooter={false}>
                <Meeting />
              </Layout>
            }
          />
          
          {/*Educational News Page */}
          <Route
            path="/educational-news"
            element={
              <Layout showHeaderFooter={false}>
                <EducationalNewsPage />
              </Layout>
            }
          />
          {/* Meeting Routes */}
          <Route
            path="/meetings"
            element={
              <Layout showHeaderFooter={false}>
                <Meetings />
              </Layout>
            }
          />
          <Route
            path="/host"
            element={
              <Layout showHeaderFooter={false}>
                <MeetingHost />
              </Layout>
            }
          />
          {/* Grades & Analytics Route */}
          <Route
            path="/GradesAndAnalytics"
            element={
              <Layout showHeaderFooter={false}>
                <GradesAndAnalytics />
              </Layout>
            }
          />
          {/* Grades & Analytics Route */}
          <Route
            path="/GradesAndFeedback"
            element={
              <Layout showHeaderFooter={false}>
                <GradesAndFeedback />
              </Layout>
            }
          />
          {/* Student Tests */}
          <Route
            path="/student-tests"
            element={
              <Layout showHeaderFooter={false}>
                <StudentTests />
              </Layout>
            }
          />

          {/* Teacher Tests */}
          <Route
            path="/teacher-tests"
            element={
              <Layout showHeaderFooter={false}>
                <TeacherTests />
              </Layout>
            }
          />
          {/* Catch-all route for debugging */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-white">
                  <h1 className="text-xl font-bold mb-2">Page Not Found</h1>
                  <p>The requested page does not exist.</p>
                  <p className="text-sm text-gray-400 mt-2">Path: {window.location.pathname}</p>
                </div>
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;