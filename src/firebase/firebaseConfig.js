// firebaseConfig.jsx
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

// Configure Google Auth Provider (optional customization)
googleProvider.setCustomParameters({
  prompt: 'select_account' // Forces account selection even when signed in
});

// Export all Firebase services
export { 
  app, 
  auth, 
  googleProvider, 
  db, 
  storage 
};

import { collection } from 'firebase/firestore';
export const usersCollection = collection(db, 'users');
export const studentsCollection = collection(db, 'students');
export const teachersCollection = collection(db, 'teachers');