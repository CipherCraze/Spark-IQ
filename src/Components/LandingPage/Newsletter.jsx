import { useState } from 'react';
import { motion } from 'framer-motion';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubscribe = async () => {
    setIsSubmitted(true);
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setEmail('');
        setIsSubmitted(false);
      }, 3000);
    } catch (err) {
      setError('Subscription failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section 
      className="bg-gradient-to-br from-[#1f2937] to-[#0f172a] text-white py-16 px-6 text-center w-full min-h-screen flex items-center justify-center"
      role="region" 
      aria-labelledby="newsletter-heading"
    >
      <div className="container max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 
            id="newsletter-heading"
            className="text-4xl font-bold mb-6 leading-tight md:text-5xl"
          >
            Stay Updated with Our Newsletter
          </h2>
          <p className="text-lg text-gray-300 mb-8 md:text-xl">
            Subscribe now to get the latest news, updates, and exclusive offers delivered to your inbox.
          </p>

          {!isSuccess ? (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <div className="w-full sm:w-2/3 relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (isSubmitted) setError('');
                  }}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm pr-32"
                  aria-invalid={!!error}
                  aria-describedby="error-message"
                  disabled={isLoading}
                />
                {error && (
                  <motion.span
                    id="error-message"
                    role="alert"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute left-0 -bottom-6 text-red-400 text-sm text-left pl-4"
                  >
                    {error}
                  </motion.span>
                )}
              </div>

              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                aria-label="Subscribe to Newsletter"
                className="inline-block px-6 py-3 text-lg font-bold text-gray-900 bg-gradient-to-r from-[#00d4ff] via-[#5b42f3] to-[#af40ff] rounded-full hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/30 relative overflow-hidden disabled:opacity-80 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <span className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
                    Subscribing...
                  </div>
                ) : (
                  'Subscribe'
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-400 text-xl font-semibold flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Thank you for subscribing!
            </motion.div>
          )}

          <p className="mt-8 text-gray-400 text-sm max-w-xs mx-auto">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
      <div className="mt-6 flex flex-col items-center justify-center">
        <span className="inline-flex items-center gap-2 text-lg font-semibold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent animate-gradient-x drop-shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-6 h-6 text-pink-400 animate-pulse">
            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
          </svg>
          with love, team CodeSharks
        </span>
      </div>
    </section>
  );
};

export default Newsletter;