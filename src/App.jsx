import { BrowserRouter as Router, Routes, Route } from 'react-router'; // Corrected import
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/LandingPage/Hero';
import CTA from './components/LandingPage/CTA';
import Login from './components/Login';
import HowItWorks from './components/HowItWorks';
import Signup from './components/Signup';
import Team from './components/Team';
import Support from './components/Support';
import Pricing from './components/Pricing';
import Features from './components/LandingPage/Features';
import Testimonials from './components/LandingPage/Testimonials';
import Newsletter from './components/LandingPage/Newsletter';
import Dashboard from './components/dashboard/Dashboard'; // Import the Dashboard component
import ChatbotAccess from './components/Chatbot/Chatbot'; // Import the Chatbot component
import AssignmentSubmission from './components/Features/AssignmentSubmission'; // Import the AssignmentSubmission component
import ChatFunctionality from './components/Features/ChatFunctionality';
import Meeting from './components/Features/Meetings';
import AttendanceMonitoring from './components/Features/AttendanceMonitoring';
import ResourceUtilization from './components/Features/ResourceUtilization';
import Grades from './components/Features/GradingAccess';
import AIGeneratedQuestions from './components/Features/AIGeneratedQuestions';
import SuggestionsInbox from './components/Features/SuggestionsInbox';
import PersonalizedFeedback from './components/Features/Personalized_feedback';
import NotFound from './components/NotFound';

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
        {/* Not Found Route */}
        <Route path="*" element={<Layout><h1>404 - Not Found</h1></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;