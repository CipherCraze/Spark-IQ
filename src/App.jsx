import { BrowserRouter as Router, Routes, Route } from 'react-router';
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

const Layout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow">
      {children}
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <div className="landing-page">
                <Hero />
                <CTA />
              </div>
            </Layout>
          }
        />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/signup" element={<Layout><Signup /></Layout>} />
        <Route path="/how-it-works" element={<Layout><HowItWorks /></Layout>} />
        <Route path="/team" element={<Layout><Team /></Layout>} />
        <Route path="/support" element={<Layout><Support /></Layout>} />
        <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;