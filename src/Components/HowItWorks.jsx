import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { FaShoppingCart, FaDollarSign, FaGavel } from 'react-icons/fa'; 
import { Link } from 'react-router'; // Import Link from react-router-dom
import styled, { keyframes } from 'styled-components';

export default function HowItWorks() {
  const steps = [
    {
      icon: <FaShoppingCart className="text-5xl text-blue-400" />,
      title: 'Browse Products',
      description: 'Explore a wide variety of products listed by sellers, from electronics to fashion.',
    },
    {
      icon: <FaDollarSign className="text-5xl text-emerald-400" />,
      title: 'Make a Purchase',
      description: 'Securely buy the items you love with a few simple clicks and enjoy a hassle-free experience.',
    },
    {
      icon: <FaGavel className="text-5xl text-purple-400" />,
      title: 'Bid on Auctions',
      description: 'Join live auctions, place bids, and grab your dream products at unbeatable prices.',
    },
  ];

  return (
    <section className="px-6 py-24 bg-gradient-to-br from-gray-900 via-navy-900 to-indigo-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-5xl font-bold text-transparent bg-gradient-to-r from-blue-200 to-purple-300 bg-clip-text"
          >
            Streamlined Marketplace Experience
          </motion.h1>
          <p className="max-w-2xl mx-auto text-xl font-light text-gray-300">
            Discover Campus Mart's intuitive platform designed for secure, efficient transactions and competitive bidding.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="relative p-8 transition-all duration-300 border group bg-white/5 backdrop-blur-lg rounded-2xl border-white/10 hover:border-blue-300/30"
            >
              <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 group-hover:opacity-100 rounded-2xl" />
              
              <div className="relative z-10">
                <div className="flex justify-center mb-6">
                  <div className="p-4 shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                    {React.cloneElement(step.icon, { className: 'text-3xl text-white' })}
                  </div>
                </div>
                
                <h3 className="mb-4 text-2xl font-semibold text-gray-100">
                  {step.title}
                  <div className="w-12 h-1 mt-2 transition-transform duration-300 origin-left scale-x-0 bg-blue-400 rounded-full group-hover:scale-x-100" />
                </h3>
                
                <p className="font-light leading-relaxed text-gray-400">
                  {step.description}
                </p>
                
                <div className="mt-6 transition-all duration-300 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0">
                  <FiArrowRight className="text-xl text-blue-400 animate-pulse" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-20">
          <StyledButton>
            <Link to="/login"> {/* Link to login page */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 transition-all duration-300 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500"
              >
                <span className="flex items-center gap-3 text-lg font-medium text-white">
                  Begin Your Journey
                  <FiArrowRight className="text-xl transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 transition-colors duration-300 border-2 rounded-full border-white/20 group-hover:border-white/40" />
              </motion.button>
            </Link>
          </StyledButton>
        </div>
      </div>
    </section>
  );
}

const shine = keyframes`
  to {
    background-position: 200% center;
  }
`;

const StyledButton = styled.div`
  button {
    position: relative;
    overflow: hidden;
    padding: 1.25rem 2.5rem;
    border: none;
    background-size: 200% auto;
    
    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(
        45deg,
        transparent 25%,
        rgba(255,255,255,0.1) 50%,
        transparent 75%
      );
      animation: ${shine} 6s infinite linear;
      opacity: 0.5;
    }
    
    &:hover::before {
      animation-duration: 3s;
    }
  }
  
  @media (max-width: 768px) {
    button {
      padding: 1rem 2rem;
      font-size: 0.9rem;
    }
  }
`;
