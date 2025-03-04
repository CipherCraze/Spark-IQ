import { BrowserRouter as Router, Routes, Route } from 'react-router';
import CTA from './Components/LandingPage/CTA';
import Hero from './Components/LandingPage/Hero';
import Login from './Components/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="landing-page">
            <Hero />
            <CTA />
          </div>
        } />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;