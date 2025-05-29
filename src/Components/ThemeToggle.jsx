// src/Components/ThemeToggle.jsx
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext'; // Assumes ThemeContext.jsx is in ../context/

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme(); // This line will throw an error if not within ThemeProvider

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-3 p-3 w-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-all mb-4" // Added mb-4 for spacing, adjust as needed
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? (
        <>
          <SunIcon className="w-5 h-5 text-yellow-500" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <MoonIcon className="w-5 h-5 text-purple-500" />
          <span>Dark Mode</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle; 