// src/context/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';

// When createContext is called without an argument, context will be undefined
// if useContext is called outside a Provider. This is fine and handled by your useTheme hook.
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Guard for SSR or environments where window is not defined
    if (typeof window === 'undefined') {
      return false; // Default to light mode or a configurable server-side preference
    }
    const savedTheme = localStorage.getItem('theme');
    // If a theme is saved, use it
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Otherwise, check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider. Make sure your component is a child of ThemeProvider.');
  }
  return context;
};