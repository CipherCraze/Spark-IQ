// firebaseConfig.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection } from "firebase/firestore";
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
let app;
try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw new Error('Failed to initialize Firebase');
}

// Initialize services only if app is available
let auth;
let googleProvider;
let db;
let storage;
let usersCollection;
let studentsCollection;
let teachersCollection;
let questionsCollection;
let chatsCollection;
let messagesCollection;
let connectionsCollection;

if (app) {
  try {
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    db = getFirestore(app);
    storage = getStorage(app);

    // Collection references
    usersCollection = collection(db, 'users');
    studentsCollection = collection(db, 'students');
    teachersCollection = collection(db, 'teachers');
    questionsCollection = collection(db, 'questions');
    chatsCollection = collection(db, 'chats');
    messagesCollection = collection(db, 'messages');
    connectionsCollection = collection(db, 'connections');

    // Configure Google Auth Provider
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
  } catch (error) {
    console.error('Error initializing Firebase services:', error);
  }
}

// Export all Firebase services and collections
export {
  app,
  auth,
  googleProvider,
  db,
  storage,
  usersCollection,
  studentsCollection,
  teachersCollection,
  questionsCollection,
  chatsCollection,
  messagesCollection,
  connectionsCollection
};