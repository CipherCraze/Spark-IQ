import { BrowserRouter as Router, Routes, Route } from 'react-router';
import CTA from './Components/LandingPage/CTA';
import Hero from './Components/LandingPage/Hero';
import Login from './components/Login';
import Signup from './components/Signup';
import Footer from './components/Footer';

// Layout component to wrap all pages with footer
const Layout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
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
        <Route 
          path="/login" 
          element={
            <Layout>
              <Login />
            </Layout>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <Layout>
              <Signup />
            </Layout>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;