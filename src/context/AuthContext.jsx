// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/firebaseConfig'; // Adjust path if your firebaseConfig is elsewhere
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  const value = {
    currentUser,
    // Add other auth functions if needed (e.g., login, logout, signup)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// How to use:
// Wrap your application's root component (e.g., App.js) with <AuthProvider>:
/*
// In your App.js or main entry file:
import { AuthProvider } from './contexts/AuthContext'; // Adjust path

function App() {
  return (
    <AuthProvider>
      // Your app components
    </AuthProvider>
  );
}
export default App;
*/