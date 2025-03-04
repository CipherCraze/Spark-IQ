import { useNavigate } from 'react-router';

const CTA = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    window.scrollTo(0, 0);
    navigate('/login');
  };

  return (
    <section 
      className="bg-gradient-to-br from-[#1f2937] to-[#0f172a] text-white py-20 px-4 text-center"
      role="region" 
      aria-labelledby="cta-heading"
    >
      <div className="container max-w-4xl mx-auto">
        <h2 
          id="cta-heading"
          className="text-4xl font-bold mb-6 leading-tight"
        >
          Empower Education with SPARK-IQ
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          Transform your teaching experience with AI-powered grading and personalized feedback. 
          Join educators worldwide who are revolutionizing classroom efficiency!
        </p>
        <button
          onClick={handleClick}
          aria-label="Get Started with SPARK-IQ"
          className="inline-block px-8 py-4 text-lg font-bold text-gray-900 bg-gradient-to-r from-[#00d4ff] via-[#5b42f3] to-[#af40ff] rounded-full hover:scale-105 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/30 relative overflow-hidden"
        >
          Get Started Free
          <span className="absolute inset-0 opacity-0 hover:opacity-30 transition-opacity duration-300 bg-gradient-to-r from-white/20 to-transparent"></span>
        </button>
      </div>
    </section>
  );
};

export default CTA;