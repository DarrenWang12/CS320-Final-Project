import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - using values from .env.local
// Fallback to environment variables if available, otherwise use hardcoded values
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBNx8aj58lupaQ-9Rlkr7pVmus-ldNyzsY',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'cs320final-73d0a.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'cs320final-73d0a',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'cs320final-73d0a.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '629220726368',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:629220726368:web:79ecce103e59c929631505',
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw new Error(
    'Failed to initialize Firebase. Please check your Firebase configuration in .env file.'
  );
}

// Initialize Firebase Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

