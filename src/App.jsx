import { BrowserRouter as Router, Routes, Route } from 'react-router'; // Corrected import
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
import AssignmentSubmission from './Components/Features/AssignmentSubmission'; // Import the AssignmentSubmission component
import ChatFunctionality from './Components/Features/ChatFunctionality';
import Meeting from './Components/Features/Meetings';
import AttendanceMonitoring from './Components/Features/AttendanceMonitoring';
import ResourceUtilization from './Components/Features/ResourceUtilization';
import Grades from './Components/Features/GradingAccess';
import AIGeneratedQuestions from './Components/Features/AIGeneratedQuestions';
import SuggestionsInbox from './Components/Features/SuggestionsInbox';
import PersonalizedFeedback from './Components/Features/Personalized_feedback';
import NotFound from './Components/NotFound';
import EducatorDashboard from './Components/dashboard/EducatorDashboard';
import AssignmentManagement from './Components/Features/AssignmentManagement';
import GradingSystem from './Components/Features/GradingSytem';
import EducationalNewsPage from './Components/Features/EducationalNewsPage';
import Profile from './Components/Features/Profile'; // Import the Profile component
import Settings from './Components/Features/Settings'; // Import the Settings component
import ArgueAI from './Components/Features/ArgueAI';
import SmartReview from './Components/Features/SmartReview';
import ResourceManagement from './Components/Features/ResourceManagement';
import AttendanceTracking from './Components/Features/AttendanceTracking';
import FeedbackDashboard from './components/Features/FeedbackDashboard';

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
        {/* Profile Route */}
        <Route
          path="/profile"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
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
        {/* Feedback Dashboard */}
        <Route
          path="/feedback-dashboard"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
              <FeedbackDashboard />
            </Layout>
          }
        />  
        {/* Grading System */}
        <Route
          path="/grading-system"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
              <GradingSystem />
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
        {/* Argue AI */}
        <Route

          path="/argue-ai"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}

              <ArgueAI />
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
        {/*pricing */}
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
        {/* Grades Route */}
        <Route
          path="/grading-access"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
              <Grades />
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
        {/*Personalized Feedback */}
        <Route
          path="/personalized-feedback"
          element={
            <Layout showHeaderFooter={false}> {/* Hide Header and Footer */}
              <PersonalizedFeedback />
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
        {/* Not Found Route */}
        <Route path="*" element={<Layout><h1>404 - Not Found</h1></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;