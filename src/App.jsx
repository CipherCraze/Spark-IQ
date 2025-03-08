import { BrowserRouter as Router, Routes, Route } from 'react-router';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/LandingPage/Hero';
import CTA from './components/LandingPage/CTA';
import Login from './Components/Login';
import HowItWorks from './components/HowItWorks';
import Signup from './components/Signup';
import Team from './components/Team';
import Support from './components/Support';
import Pricing from './components/Pricing';
import Features from './components/LandingPage/Features';
import Testimonials from './components/LandingPage/Testimonials';
import Newsletter from './components/LandingPage/Newsletter';
import Dashboard from './components/dashboard/Dashboard'; // Import the Dashboard component

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
      </Routes>
    </Router>
  );
}

export default App;