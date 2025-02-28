import React from 'react';
import { Link, useNavigate } from 'react-router'; // Import useNavigate from react-router-dom
import styled from 'styled-components';

const CTA = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Scroll to the top of the page
    window.scrollTo(0, 0);
    // Navigate to the login page
    navigate('/login');
  };

  return (
    <Section role="region" aria-labelledby="cta-heading">
      <div className="container">
        {/* Heading */}
        <h2 id="cta-heading">Ready to Join campusMart?</h2>
        {/* Description */}
        <p>
          Start buying, selling, and bidding today. Join thousands of students
          who are already part of the campusMart community!
        </p>
        {/* Call-to-Action Button */}
        <StyledButton onClick={handleClick} aria-label="Sign Up for campusMart">
          Sign Up Now
        </StyledButton>
      </div>
    </Section>
  );
};

const Section = styled.section`
  background: linear-gradient(135deg, #1f2937, #0f172a);
  color: white;
  padding: 5rem 1rem;
  text-align: center;

  .container {
    max-width: 800px;
    margin: 0 auto;
  }

  h2 {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
    line-height: 1.2;
  }

  p {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    color: #d1d5db;
  }
`;

const StyledButton = styled.button` // Changed to a regular button
  display: inline-block;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: bold;
  color: #0f172a;
  background: linear-gradient(90deg, #00d4ff, #5b42f3, #af40ff);
  border: none;
  border-radius: 999px;
  text-decoration: none;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  z-index: 1;
  cursor: pointer;

  &:hover {
    color: white;
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0px 8px 25px rgba(175, 64, 255, 0.5);
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -75%;
    width: 150%;
    height: 100%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent 60%);
    transition: left 0.5s ease;
    z-index: -1;
  }

  &:hover::after {
    left: -10%;
  }
`;

export default CTA;
