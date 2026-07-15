import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'placeholder',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'placeholder',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://placeholder-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'placeholder',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'placeholder',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'placeholder',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'placeholder'
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getDatabase(app);
