import React from 'react';
import { Link } from 'react-router';
import styled from 'styled-components';

// Google Button Component
const GoogleButton = () => {
  return (
    <GoogleStyledWrapper>
      <button className="button">
        <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" viewBox="0 0 256 262">
          <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" />
          <path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" />
          <path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" />
          <path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" />
        </svg>
        Continue with Google
      </button>
    </GoogleStyledWrapper>
  );
};

// Styled wrapper for Google button with centered content
const GoogleStyledWrapper = styled.div`
  button {
    width: 100%; /* Match w-full */
    display: flex;
    padding: 0.75rem 1rem; /* Match py-3 px-4 */
    font-size: 0.875rem; /* Match text-sm */
    font-weight: 700;
    text-transform: uppercase;
    vertical-align: middle;
    align-items: center;
    justify-content: center; /* Center icon and text horizontally */
    border-radius: 0.5rem; /* Match rounded-md */
    border: 1px solid rgba(0, 0, 0, 0.25);
    gap: 0.75rem;
    color: rgb(65, 63, 63);
    background-color: #fff;
    cursor: pointer;
    transition: all .6s ease;
  }

  .button svg {
    height: 24px;
  }

  button:hover {
    transform: scale(1.02);
  }
`;

const Form = () => {
  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-gray-900">
      <div
        style={{
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
        className="w-full max-w-lg overflow-hidden bg-gray-800 rounded-lg shadow-xl"
      >
        <div className="p-8">
          <br />
          <br />
          <h2 className="text-3xl font-extrabold text-center text-white">Sign Up</h2>
          <p className="mt-4 text-center text-gray-400">It's quick and easy.</p>
          <form method="POST" action="#" className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm">
              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder="First name"
                  className="relative block w-full px-3 py-3 text-white bg-gray-700 border border-gray-700 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  required=""
                />
                <input
                  type="text"
                  placeholder="Last name"
                  className="relative block w-full px-3 py-3 text-white bg-gray-700 border border-gray-700 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  required=""
                />
              </div>
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Mobile number or email address"
                  className="relative block w-full px-3 py-3 text-white bg-gray-700 border border-gray-700 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  required=""
                />
              </div>
              <div className="mt-4">
                <input
                  type="password"
                  placeholder="New password"
                  className="relative block w-full px-3 py-3 text-white bg-gray-700 border border-gray-700 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  required=""
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-gray-500" style={{ fontSize: 12 }}>
                Date of birth{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  {' '}
                  (?){' '}
                </a>
              </div>
              <div className="flex mt-1 space-x-3">
                <select
                  name="day"
                  className="text-md flex-1 px-1 py-1.5 ring-1 ring-gray-400 rounded-md outline-none"
                >
                  {[...Array(31).keys()].map((i) => (
                    <option key={i} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                <select
                  name="month"
                  className="text-md flex-1 px-1 py-1.5 ring-1 ring-gray-400 rounded-md outline-none"
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(
                    (month, i) => (
                      <option key={i} value={month}>
                        {month}
                      </option>
                    )
                  )}
                </select>
                <select
                  name="year"
                  className="text-md flex-1 px-1 py-1.5 ring-1 ring-gray-400 rounded-md outline-none"
                >
                  {[...Array(33).keys()].map((i) => (
                    <option key={i} value={2000 + i}>
                      {2000 + i}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-gray-500" style={{ fontSize: 12 }}>
                Gender{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  {' '}
                  (?){' '}
                </a>
              </div>
              <div className="flex mt-1 space-x-3">
                {['Female', 'Male', 'Others'].map((gender, i) => (
                  <label
                    key={i}
                    htmlFor={gender.toLowerCase()}
                    className="flex items-center justify-between flex-1 px-2 py-1 space-x-2 border border-gray-600 rounded-md"
                  >
                    <span className="text-gray-400">{gender}</span>
                    <input type="radio" id={gender.toLowerCase()} name="gender" />
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs text-gray-400">
                By clicking Sign Up, you agree to our
                <a href="#" className="font-medium text-blue-400 hover:text-blue-300 hover:underline">
                  Terms
                </a>
                ,
                <a href="#" className="font-medium text-blue-400 hover:text-blue-300 hover:underline">
                  Privacy Policy
                </a>
                and
                <a href="#" className="font-medium text-blue-400 hover:text-blue-300 hover:underline">
                  Cookies Policy
                </a>
                . You may receive SMS notifications from us and can opt out at any time.
              </p>
            </div>

            <div>
              <button
                className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                type="submit"
              >
                Sign Up
              </button>
            </div>

            {/* Add Continue with Google button */}
            <div>
              <GoogleButton />
            </div>
          </form>
        </div>

        <div className="px-8 py-4 text-center bg-gray-700">
          <span className="text-gray-400">Already have an account?</span>
          <Link to="/login" className="font-medium text-indigo-500 hover:text-indigo-400">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Form;