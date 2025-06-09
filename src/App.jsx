import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Fix the import
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
import Dashboard from './Components/dashboard/Dashboard'; // Import the Dashboard component
import ChatbotAccess from './Components/Chatbot/Chatbot'; // Import the Chatbot component
import ChatbotEducation from './Components/Chatbot/Chatbot-Educator'; // Import the ChatbotEducation component
import AssignmentSubmission from './Components/Features/AssignmentSubmission'; // Import the AssignmentSubmission component
import ChatFunctionality from './Components/Features/ChatFunctionality';
import StudentTests from './Components/Features/StudentTests'; // Import StudentTests component
import TeacherTests from './Components/Features/TeacherTests'; // Import TeacherTests component

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
import Profile from './Components/Features/Profile'; // Import the Profile component
import Settings from './Components/Features/Settings'; // Import the Settings component
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
import UserProfile from './Components/Features/UserProfile'; // Import the UserProfile component
import EducatorProfilePage from './Components/Features/EducatorProfilePage'; // Import the EducatorProfilePage component  
import EducatorSettings from './Components/Features/EducatorSettings'; // Import the EducatorSettings component
import ViewOnlyProfile from './Components/Features/ViewOnlyProfile'; // Import the ViewOnlyProfile component
import GradesAndAnalytics from './Components/Features/GradesAndAnalytics';
import GradesAndFeedback from './Components/Features/GradesAndFeedback';
import VoiceChat from './Components/Chatbot/VoiceChat'; // Import the VoiceChat component
import TeacherVoiceChat from './Components/Chatbot/TeacherVoiceChat'; // Import the TeacherVoiceChat component
import './styles/animations.css';
import { AuthProvider } from './context/AuthContext'; // or './contexts/AuthContext' if that's the folder
import PersonalizedFeedback from './Components/Features/PersonalizedFeedbackStudents';


const Layout = ({ children, showHeaderFooter = true }) => (
  <div className="flex flex-col min-h-screen">
    {showHeaderFooter && <Header />} {/* Conditionally render Header */}
    <main className="flex-grow">
      {children}
    </main>
    {showHeaderFooter && <Footer />} {/* Conditionally render Footer */}
  </div>
);

function App() {
  return (
    <AuthProvider> {/* Wrap the entire app with AuthProvider */}
    <Router>
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
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
              <Dashboard role="student" /> {/* Pass the role as a prop */}
            </Layout>
          }
        />
        {/* Educator Dashboard */}
        <Route
          path="/educator-dashboard"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
              <EducatorDashboard role="educator" /> {/* Pass the role as a prop */}
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
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
              <Settings />
            </Layout>
          }
        /> 
        {/* Educator Profile Page */}
        <Route
          path="/educator-profile"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
              <EducatorProfilePage />
            </Layout>
          }
        />
        {/* Educator Settings */}
        <Route
          path="/educator-settings"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
              <EducatorSettings />
            </Layout>
          }
        />
        {/* Assignment Management */}
        <Route
          path="/assignment-management"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
              <AssignmentManagement />
            </Layout>
          }
        />
        {/* Resource Management */}
        <Route
          path="/resource-management"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
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
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
              <MeetingHost />
            </Layout>
          }
        />
        
        {/* Announcements Page */}
        <Route
          path="/announcements"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
              <AnnouncementsPage />
            </Layout>
          }
        />
        
        {/* Smart Review */}
        <Route
          path="/smart-review"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
              <SmartReview />
            </Layout>
          }
        />

        
          {/* Voice Chat */}
        <Route
          path="/voice-chat"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
              <VoiceChat />
            </Layout>
          }
        />
        {/* Teacher Voice Chat */}
        <Route
          path="/teacher-voice-chat"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
              <TeacherVoiceChat />
            </Layout>
          }
        />
        {/* Voice Chat */}
        <Route
          path="/voice-chat"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
              <VoiceChat />
            </Layout>
          }
        />
        {/* Teacher Voice Chat */}
        <Route
          path="/teacher-voice-chat"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
              <TeacherVoiceChat />
            </Layout>
          }
        />
        {/* Resource Utilization */}
        <Route
          path="/resource-utilization"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
              <ResourceUtilization />
            </Layout>
          }
        />
        {/* Personalized Feedback For Students */}
        <Route
          path="/personalized-feedback-students"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
              <PersonalizedFeedback />
            </Layout>
          }
        />
        {/* Pricing */}
        <Route
          path="/pricing"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
              <Pricing />
            </Layout>
          }
        />
        {/* Chatbot Route */}
        <Route
          path="/chatbot-access"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
              <ChatbotAccess />
            </Layout>
          }
        />
        {/* Chatbot Education */}
        <Route
          path="/chatbot-education"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
              <ChatbotEducation />
            </Layout>
          }
        />
        

        {/* Assignment Submission Route */}
        <Route
          path="/assignment-submission"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
              <AssignmentSubmission />
            </Layout>
          }
        />
          
        {/* Suggestions Inbox Route */}
        <Route
          path="/inbox-for-suggestions"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
              <SuggestionsInbox />
            </Layout>
          }
        />
          {/* Chat Functionality Route */}
        <Route
          path="/chat-functionality"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
              <ChatFunctionality />
            </Layout>
          }
        />
        {/*Attendance Monitoring */}
        <Route
          path="/attendance-monitoring"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
              <AttendanceMonitoring />
            </Layout>
          }
        />
        {/*AI Generated Questions */}
        <Route
          path="/ai-generated-questions"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
              <AIGeneratedQuestions />
            </Layout>
          }
        />
        {/*Meeting */}
        <Route
          path="/meeting-participation"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
              <Meeting />
            </Layout>
          }
        />
        
        {/*Educational News Page */}
        <Route
          path="/educational-news"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
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
    </AuthProvider> // Close the AuthProvider
  );
}

export default App;